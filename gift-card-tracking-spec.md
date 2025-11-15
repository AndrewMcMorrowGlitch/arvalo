# Gift Card Tracking System - Technical Specification

## System Overview

A backend system that manages gift card balances and transaction tracking for AI-powered purchases. The system maintains gift card credentials, tracks balances, and logs all purchase attempts with pessimistic locking to prevent overdrafts.

## Core Requirements

**Input:**
- Gift card credentials (card number, PIN, retailer)
- Initial balance amount
- Purchase requests (item details, amount)

**Output:**
- Transaction logs (success/failure, amounts, timestamps)
- Current gift card balances
- Purchase history per card

**Key Constraint:** Uses pessimistic locking to ensure only one purchase can occur at a time per gift card, preventing race conditions and overdrafts.

## Database Schema (Supabase/PostgreSQL)

### Table: users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: gift_cards
```sql
CREATE TABLE gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    retailer TEXT NOT NULL,
    card_number TEXT NOT NULL, -- Encrypt in production
    pin TEXT NOT NULL, -- Encrypt in production
    initial_balance DECIMAL(10,2) NOT NULL,
    current_balance DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, depleted, expired, invalid
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT positive_balance CHECK (current_balance >= 0),
    CONSTRAINT valid_initial_balance CHECK (initial_balance > 0)
);

CREATE INDEX idx_gift_cards_user_id ON gift_cards(user_id);
CREATE INDEX idx_gift_cards_status ON gift_cards(status);
```

### Table: purchases
```sql
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    item_description TEXT,
    item_id TEXT, -- External item reference
    status TEXT NOT NULL, -- pending, completed, failed, cancelled
    failure_reason TEXT,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2),
    external_transaction_id TEXT, -- From purchase API
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_purchases_gift_card_id ON purchases(gift_card_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_created_at ON purchases(created_at DESC);
```

### Table: audit_log
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID REFERENCES gift_cards(id) ON DELETE SET NULL,
    purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- card_added, purchase_initiated, purchase_completed, purchase_failed, balance_adjusted
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_gift_card_id ON audit_log(gift_card_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
```

## Purchase Flow Logic

### Step 1: Add Gift Card
```
POST /api/gift-cards

Request:
{
    "user_id": "uuid",
    "retailer": "Amazon",
    "card_number": "XXXX-XXXX-XXXX",
    "pin": "1234",
    "initial_balance": 100.00
}

Process:
1. Validate input data
2. Encrypt card_number and pin (use Supabase Vault or application-level encryption)
3. Insert into gift_cards table with current_balance = initial_balance
4. Log to audit_log (action: "card_added")

Response:
{
    "gift_card_id": "uuid",
    "current_balance": 100.00,
    "status": "active"
}
```

### Step 2: Initiate Purchase (with Pessimistic Locking)

```
POST /api/purchases

Request:
{
    "gift_card_id": "uuid",
    "amount": 30.00,
    "item_description": "Item A",
    "item_id": "external-item-123"
}

Process Flow:
1. BEGIN TRANSACTION
2. SELECT * FROM gift_cards WHERE id = ? FOR UPDATE -- Pessimistic lock
3. Check if current_balance >= amount
   - If insufficient: ROLLBACK, return error
4. Create purchase record with status='pending'
5. Log to audit_log (action: "purchase_initiated")
6. COMMIT TRANSACTION (releases lock temporarily)

7. Call external purchase API with gift card credentials + amount
   - Wait for synchronous response
   
8. BEGIN TRANSACTION
9. SELECT * FROM gift_cards WHERE id = ? FOR UPDATE -- Re-acquire lock
10. Handle API response:

    IF SUCCESS:
        - Update purchases: status='completed', balance_after=current_balance-amount, completed_at=NOW()
        - Update gift_cards: current_balance = current_balance - amount
        - If current_balance = 0, set status='depleted'
        - Log to audit_log (action: "purchase_completed")
        
    IF FAILURE:
        - Update purchases: status='failed', failure_reason=<error message>
        - Do NOT deduct from current_balance (release reserved amount)
        - Log to audit_log (action: "purchase_failed")

11. COMMIT TRANSACTION
12. Return response

Response (Success):
{
    "purchase_id": "uuid",
    "status": "completed",
    "amount": 30.00,
    "balance_before": 100.00,
    "balance_after": 70.00
}

Response (Failure):
{
    "purchase_id": "uuid",
    "status": "failed",
    "failure_reason": "Card declined by retailer",
    "balance_before": 100.00,
    "balance_after": 100.00
}
```

### Step 3: Query Balance

```
GET /api/gift-cards/{gift_card_id}/balance

Response:
{
    "gift_card_id": "uuid",
    "current_balance": 70.00,
    "initial_balance": 100.00,
    "total_spent": 30.00,
    "status": "active"
}
```

### Step 4: Get Transaction History

```
GET /api/gift-cards/{gift_card_id}/purchases

Response:
{
    "gift_card_id": "uuid",
    "purchases": [
        {
            "purchase_id": "uuid",
            "amount": 30.00,
            "item_description": "Item A",
            "status": "completed",
            "balance_before": 100.00,
            "balance_after": 70.00,
            "created_at": "2025-11-15T10:30:00Z",
            "completed_at": "2025-11-15T10:30:05Z"
        }
    ]
}
```

## Technical Implementation Details

### Pessimistic Locking Strategy

Using PostgreSQL's `FOR UPDATE` clause to lock the gift card row during the entire purchase process:

```sql
-- This locks the row until transaction completes
SELECT * FROM gift_cards 
WHERE id = $1 
FOR UPDATE;
```

**Why pessimistic locking:**
- Prevents concurrent purchases from the same card
- Ensures balance consistency
- Simple to implement and reason about
- Acceptable performance for purchase frequency

**Trade-off:** If purchase API is slow, the lock is held longer. Consider timeouts.

### Transaction Isolation

Use `SERIALIZABLE` or `REPEATABLE READ` isolation level to prevent phantom reads:

```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- Purchase logic here
COMMIT;
```

### Error Handling States

**Purchase States:**
- `pending`: Purchase initiated, waiting for API response
- `completed`: Purchase successful, balance deducted
- `failed`: Purchase failed, balance NOT deducted
- `cancelled`: User/system cancelled before API call

**Gift Card States:**
- `active`: Card has balance > 0 and is usable
- `depleted`: Balance = 0
- `expired`: Card past expiration date (if tracked)
- `invalid`: Card credentials invalid or blocked

### Idempotency

Include an idempotency key in purchase requests to prevent duplicate charges if client retries:

```sql
ALTER TABLE purchases ADD COLUMN idempotency_key TEXT UNIQUE;
```

Before creating purchase, check if idempotency_key already exists and return existing result.

## API Endpoints Summary

### Gift Cards
- `POST /api/gift-cards` - Add new gift card
- `GET /api/gift-cards` - List user's gift cards
- `GET /api/gift-cards/{id}` - Get specific gift card details
- `GET /api/gift-cards/{id}/balance` - Get current balance
- `DELETE /api/gift-cards/{id}` - Remove gift card (soft delete recommended)

### Purchases
- `POST /api/purchases` - Initiate new purchase
- `GET /api/purchases/{id}` - Get purchase details
- `GET /api/gift-cards/{id}/purchases` - Get purchase history for card
- `GET /api/users/{id}/purchases` - Get all purchases for user

### Admin/Monitoring
- `GET /api/audit-log` - Query audit logs (with filters)
- `POST /api/gift-cards/{id}/adjust-balance` - Manual balance adjustment (admin only)

## Security Considerations

### Encryption
Gift card credentials must be encrypted at rest:

**Option 1: Supabase Vault**
```sql
-- Store encrypted
SELECT vault.create_secret('card-123-number', 'XXXX-XXXX-XXXX');

-- Retrieve decrypted
SELECT decrypted_secret FROM vault.decrypted_secrets 
WHERE name = 'card-123-number';
```

**Option 2: Application-level encryption**
- Use AES-256-GCM encryption
- Store encryption keys in environment variables or secret manager
- Never log decrypted credentials

### Access Control
Implement Row Level Security (RLS) in Supabase:

```sql
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own gift cards"
ON gift_cards FOR ALL
USING (user_id = auth.uid());
```

### Rate Limiting
- Implement rate limiting on purchase endpoints to prevent abuse
- Max 10 purchase attempts per gift card per minute
- Track failed attempts and temporarily lock cards after 5 consecutive failures

## Monitoring & Observability

### Key Metrics to Track
- Purchase success rate per retailer
- Average purchase completion time
- Balance discrepancy alerts (if actual != tracked)
- Failed purchase reasons (grouped)
- Cards with pending purchases > 5 minutes

### Alerts
- Failed purchase rate > 10% in 15min window
- Gift card balance goes negative (should be impossible, but monitor)
- Purchase stuck in 'pending' for > 5 minutes
- Multiple concurrent purchase attempts on same card (lock contention)

### Logging
Log to audit_log table for:
- All balance changes
- All purchase attempts (success and failure)
- Gift card additions/removals
- Manual balance adjustments

## Example Scenario Walkthrough

**Initial State:**
- User adds $100 Amazon gift card
- Database: gift_cards table has current_balance = 100.00

**Purchase 1: Item A for $30**
1. POST /api/purchases with amount=30.00
2. Lock gift card row (FOR UPDATE)
3. Check balance: 100.00 >= 30.00 ✓
4. Create purchase record: status='pending', balance_before=100.00
5. Release lock, call purchase API
6. Purchase API returns SUCCESS
7. Re-lock gift card row
8. Update purchase: status='completed', balance_after=70.00
9. Update gift_cards: current_balance=70.00
10. Commit transaction
11. Return: balance_after=70.00

**Purchase 2: Item B for $40**
1. POST /api/purchases with amount=40.00
2. Lock gift card row (FOR UPDATE)
3. Check balance: 70.00 >= 40.00 ✓
4. Create purchase record: status='pending', balance_before=70.00
5. Release lock, call purchase API
6. Purchase API returns SUCCESS
7. Re-lock gift card row
8. Update purchase: status='completed', balance_after=30.00
9. Update gift_cards: current_balance=30.00
10. Commit transaction
11. Return: balance_after=30.00

**Purchase 3: Item C for $50 (Insufficient Funds)**
1. POST /api/purchases with amount=50.00
2. Lock gift card row (FOR UPDATE)
3. Check balance: 30.00 < 50.00 ✗
4. Rollback transaction
5. Return error: "Insufficient balance. Available: $30.00, Required: $50.00"

**Database Final State:**
```
gift_cards:
  current_balance: 30.00
  initial_balance: 100.00

purchases:
  1. Item A: completed, 30.00, balance_after=70.00
  2. Item B: completed, 40.00, balance_after=30.00
```

## Technology Stack Recommendations

### Backend Framework Options
- **Node.js + Express/Fastify** - Good Supabase integration, async/await for API calls
- **Python + FastAPI** - Excellent for async operations, type safety
- **Go** - Best performance, built-in concurrency primitives

### Database
- **Supabase (PostgreSQL)** - As specified, includes built-in auth, RLS, and vault

### Queue System (Optional Enhancement)
While you specified synchronous API calls, consider adding a queue for retries:
- **BullMQ** (Node.js) - Redis-based job queue
- **Celery** (Python) - Distributed task queue
- **Inngest** - Serverless workflow engine

### Monitoring
- **Sentry** - Error tracking
- **Datadog/New Relic** - APM and metrics
- **Supabase built-in logging** - Database query logs

## Deployment Considerations

### Environment Variables
```
DATABASE_URL=postgresql://...
PURCHASE_API_URL=https://...
PURCHASE_API_KEY=...
ENCRYPTION_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...
```

### Database Migrations
Use a migration tool:
- **Supabase CLI** for schema migrations
- **Flyway** or **Liquibase** for version control
- Keep migration files in version control

### Scaling Considerations
- Connection pooling for database (pgBouncer recommended)
- If purchase volume is high, consider read replicas for analytics queries
- Partition purchases table by created_at if expecting millions of records

## Future Enhancements

### Balance Reconciliation
Periodically verify tracked balance against actual retailer balance:
```sql
CREATE TABLE balance_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID NOT NULL REFERENCES gift_cards(id),
    tracked_balance DECIMAL(10,2) NOT NULL,
    actual_balance DECIMAL(10,2) NOT NULL,
    discrepancy DECIMAL(10,2) GENERATED ALWAYS AS (actual_balance - tracked_balance) STORED,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Reservation System
Instead of immediate deduction, reserve funds before API call:
```sql
ALTER TABLE purchases ADD COLUMN reserved_at TIMESTAMPTZ;
ALTER TABLE gift_cards ADD COLUMN reserved_balance DECIMAL(10,2) DEFAULT 0;
```

### Multi-Card Purchases
Support splitting purchases across multiple gift cards if one has insufficient balance.

### Webhook Support
If purchase API supports webhooks, implement async processing:
1. Initiate purchase, return immediately with status='pending'
2. Listen for webhook to confirm completion
3. Update balance when webhook received

## Testing Strategy

### Unit Tests
- Balance calculation logic
- Pessimistic locking behavior
- Insufficient funds handling
- Encryption/decryption of credentials

### Integration Tests
- Full purchase flow with mock purchase API
- Concurrent purchase attempts on same card
- Failed purchase scenarios
- Balance reconciliation

### Load Tests
- Concurrent purchases across multiple cards
- Database lock contention under high load
- Purchase API timeout handling

## Handoff to Claude Code

When providing this spec to Claude Code, include:

1. This complete markdown document
2. Specific technology choices (Node.js/Python/Go, which frameworks)
3. Sample purchase API contract (request/response format)
4. Any existing authentication system details
5. Deployment target (AWS, GCP, self-hosted, etc.)

**Example prompt:**
"Using this technical specification, implement the gift card tracking system backend in Node.js with Express and Supabase. The purchase API endpoint is POST https://api.example.com/purchase with request format {card_number, pin, amount} and returns {success: boolean, transaction_id: string, error?: string}. Implement pessimistic locking as specified and include comprehensive error handling."