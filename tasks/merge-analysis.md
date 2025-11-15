# Merge Analysis: Gift-Card-Tracking → Main

## 🚨 CRITICAL CONFLICTS IDENTIFIED

### 1. **Gmail Import Functionality (WILL BE DELETED)**
**Main branch has:**
- `/api/gmail/callback` - OAuth callback handler
- `/api/gmail/connect` - Gmail connection endpoint
- `/api/gmail/import` - Receipt import from Gmail
- Dashboard import button + "Connect Gmail" link

**Gift-card-tracking branch:**
- ❌ DOES NOT have these files
- ❌ Dashboard shell has NO Gmail import functionality

**Impact:** Merging will **DELETE** the entire Gmail import feature that was just added to main.

---

### 2. **Purchases API - Completely Different Implementations**

**Main branch (`/api/purchases/route.ts`):**
- GET: Lists purchases with retailer + price tracking data
- POST: Receipt text extraction → validation → save to database
- DELETE: Remove purchase and associated tracking
- **Purpose:** General purchase tracking from receipts

**Gift-card-tracking branch:**
- POST only: Gift card purchase workflow
- Uses `PurchaseSchema` (gift_card_id, amount, item_description)
- Calls RPC functions: `initiate_purchase` + `finalize_purchase`
- Simulates external payment processor
- **Purpose:** Specific to gift card transactions

**Impact:** These serve **completely different purposes** - one is receipt tracking, the other is gift card payment processing.

---

### 3. **Dashboard Components - Mock vs Real Data**

#### Gift Cards Component:
- **Main:** Simple "Coming soon" placeholder
- **Gift-card-tracking:** Full-featured component with:
  - Real API integration
  - Add/Edit/Delete gift cards
  - Make purchases with gift cards
  - Purchase history modal
  - Balance tracking

#### Other Components (Price Drops, Return Tracking, Subscriptions, Duplicate Charges):
- **Main:** Real data integration (recently updated)
- **Gift-card-tracking:** Older versions with mock/sample data

**Impact:** Merging will **downgrade** recently updated components back to mock data versions.

---

### 4. **Database Migrations - New Tables**

**Gift-card-tracking adds:**
- `supabase/migrations/20251115120000_create_gift_card_tables.sql`
  - `gift_cards` table
  - `purchases` table (gift card purchases, different from main purchases)
  - `audit_log` table
- `supabase/migrations/20251115130000_create_purchase_functions.sql`
  - `initiate_purchase` RPC function
  - `finalize_purchase` RPC function

**Impact:** These are new additions (good), but the `purchases` table name conflicts with existing purchases table for receipts.

---

### 5. **Validation Schemas**

**Gift-card-tracking adds:**
- `GiftCardSchema` (retailer, card_number, pin, initial_balance)
- `PurchaseSchema` (gift_card_id, amount, item_description) - for gift card purchases

**Main has:**
- `ReceiptDataSchema` - for receipt extraction
- Purchase tracking schemas

**Impact:** The word "purchase" is overloaded - means different things in each branch.

---

## 📊 COMPARISON SUMMARY

| Feature | Main Branch | Gift-Card-Tracking | Merge Impact |
|---------|-------------|-------------------|--------------|
| Gmail Import | ✅ Full feature | ❌ Missing | **WILL BE DELETED** |
| Gift Card Management | ❌ Placeholder | ✅ Full feature | ✅ Added |
| Receipt Purchase Tracking | ✅ Working | ❌ Will be replaced | **WILL BREAK** |
| Dashboard UI | ✅ Latest real data | ⚠️ Older mock data | **DOWNGRADE** |
| Database Migrations | Existing | New gift card tables | ⚠️ Table name conflict |

---

## 🎯 RECOMMENDED MERGE STRATEGY

### Option 1: **Smart Merge (RECOMMENDED)**
Keep both features working together:

1. **Keep Gmail Import** from main
2. **Add Gift Card Management** from gift-card-tracking
3. **Separate the Purchases APIs:**
   - `/api/purchases` → Receipt tracking (main)
   - `/api/gift-cards/purchases` → Gift card transactions (gift-card-tracking)
4. **Keep Latest Dashboard Components** from main
5. **Add Gift Card Component** from gift-card-tracking
6. **Fix Database Schema:**
   - Rename `purchases` table in gift card migrations to `gift_card_transactions`
   - Keep existing `purchases` table for receipts

**Effort:** Medium - requires careful file selection and schema renaming

---

### Option 2: **Two-API Approach**
Create parallel systems:

1. Keep everything from main
2. Add gift card features as separate system
3. Gift cards use `/api/gift-cards/*` routes exclusively
4. Update dashboard to show both features

**Effort:** Low-Medium - cleaner separation

---

### Option 3: **Accept Deletions (NOT RECOMMENDED)**
Just merge and lose Gmail import + downgrade dashboard

**Effort:** Low
**Impact:** ❌ Loses work, ❌ Breaks features

---

## 🛠️ UI/UX IMPROVEMENTS TO CONSIDER

### 1. **Unified Dashboard Shell**
- Keep Gmail import button from main
- Keep real data components from main
- Add gift card component from gift-card-tracking
- Create consistent styling across all panels

### 2. **Gift Card Component Enhancement**
- Match design system of other updated components
- Add empty states that match main's style
- Integrate with receipt scanning (future)

### 3. **Navigation Clarity**
- Make it clear gift cards are for managing prepaid cards
- Separate from regular purchase tracking
- Maybe rename to "Prepaid Cards" or "Gift Card Manager"

### 4. **Database Naming**
- `purchases` → receipt-based purchases
- `gift_card_transactions` → gift card usage tracking
- Clear separation of concerns

---

## ❓ QUESTIONS FOR YOU

1. **Do you want to keep the Gmail import feature?** (I assume yes)

2. **Should gift card "purchases" be separate from receipt "purchases"?** (I recommend yes - different concepts)

3. **UI preference:** Should the gift cards component match the newer style from main, or keep its current detailed style?

4. **Database:** Should I rename the gift card `purchases` table to `gift_card_transactions` to avoid conflicts?

5. **Dashboard components:** Keep the latest versions with real data from main, right?

---

## 📋 NEXT STEPS

Once you answer the questions above, I'll:
1. Create a precise merge plan
2. Execute the merge with manual conflict resolution
3. Ensure both features work together
4. Fix any UI inconsistencies
5. Test the build

**Estimated time:** 30-45 minutes for careful merge
