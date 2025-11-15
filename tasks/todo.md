# Link Gift Cards to Purchases - Implementation Plan

## Overview
Add functionality to optionally link purchases (from receipt uploads) to gift cards, so that the purchase amount is deducted from the selected gift card's balance.

## Tasks

### 1. Database Changes
- [ ] Add `gift_card_id` column to `purchases` table
  - Optional foreign key reference to `gift_cards(id)`
  - Will be NULL for purchases not linked to gift cards

### 2. Frontend Changes
- [ ] Update `ReceiptConfirmationDialog` component
  - Add optional dropdown/select field to choose gift card
  - Fetch user's active gift cards
  - Display current balance for each gift card
  - Show gift card selection as optional field

### 3. Backend Changes
- [ ] Modify `POST /api/purchases` endpoint
  - Accept optional `gift_card_id` in request body
  - When gift_card_id is provided:
    - Verify user owns the gift card
    - Check gift card has sufficient balance
    - Deduct purchase amount from gift card balance
    - Create transaction record in `gift_card_transactions`
    - Update audit log
  - Link purchase to gift card via gift_card_id field

### 4. Testing
- [ ] Test receipt upload with gift card selection
- [ ] Test receipt upload without gift card (existing flow)
- [ ] Verify gift card balance updates correctly
- [ ] Check transaction history shows correctly

## Technical Details

**Database Migration:**
```sql
ALTER TABLE purchases ADD COLUMN gift_card_id UUID REFERENCES gift_cards(id) ON DELETE SET NULL;
CREATE INDEX idx_purchases_gift_card_id ON purchases(gift_card_id);
```

**Key Files to Modify:**
- `supabase/migrations/` - New migration file
- `src/components/receipt-confirmation-dialog.tsx` - Add gift card dropdown
- `src/app/api/purchases/route.ts` - Handle gift card deduction logic
- `src/lib/validation/schemas.ts` - Update validation schema if needed

## User Flow
1. User uploads receipt → Claude extracts data
2. User sees confirmation dialog with extracted data
3. **NEW:** User optionally selects a gift card from dropdown
4. User confirms → Receipt saved, gift card balance updated (if selected)
5. Dashboard shows updated gift card balance

## Changes Made

### 1. Database Migration (✓ Complete)
**File:** `supabase/migrations/20251115140000_add_gift_card_to_purchases.sql`
- Added `gift_card_id` column to `purchases` table
- Created index for faster lookups
- Added documentation comment

### 2. Frontend Changes (✓ Complete)
**File:** `src/components/receipt-confirmation-dialog.tsx`
- Added gift card state management (giftCards, selectedGiftCardId, loadingGiftCards)
- Added useEffect to fetch active gift cards when dialog opens
- Added Select dropdown UI for gift card selection
- Shows retailer name and current balance for each card
- Displays balance validation message (sufficient/insufficient)
- Updated onConfirm to pass selected gift card ID

**File:** `src/components/add-receipt.tsx`
- Updated handleConfirmReceipt to accept and pass giftCardId parameter

### 3. Backend Changes (✓ Complete)
**File:** `src/app/api/purchases/route.ts`
- Added giftCardId parameter to request body parsing
- Added gift card validation logic:
  - Verifies user owns the gift card
  - Checks gift card has sufficient balance
  - Checks gift card is active (not depleted/expired)
- Deducts purchase amount from gift card balance
- Updates gift card status to 'depleted' if balance reaches 0
- Creates transaction record in gift_card_transactions table
- Logs action to audit_log table
- Links purchase to gift card via gift_card_id field

## Review Section

### Summary
Successfully implemented the ability to link purchases (from receipt uploads) to gift cards. When a user uploads a receipt, they can now optionally select a gift card to pay with. The system validates the gift card and deducts the purchase amount from its balance.

### Files Modified
1. `supabase/migrations/20251115140000_add_gift_card_to_purchases.sql` (new)
2. `src/components/receipt-confirmation-dialog.tsx`
3. `src/components/add-receipt.tsx`
4. `src/app/api/purchases/route.ts`

### Key Features
- Optional gift card selection (doesn't affect existing receipt flow)
- Real-time balance validation and display
- Automatic balance deduction and status updates
- Full audit trail via transactions and audit log
- Error handling for insufficient balance, invalid cards, etc.

### Next Steps for User
1. Run the database migration in Supabase SQL Editor
2. Test by uploading a receipt and selecting a gift card
3. Verify gift card balance updates correctly in the dashboard

### Design Decisions
- Gift card selection is optional to maintain backward compatibility
- Only shows active cards with balance > 0
- Validates balance before processing to prevent overdrafts
- Creates transaction records for audit trail
- Auto-depletes gift card when balance reaches 0
