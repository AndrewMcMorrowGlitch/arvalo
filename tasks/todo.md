# Fix Gift Card Form Validation Issue

## Problem
The gift card form shows "Required" errors even when all fields are filled. The form validation is preventing submission.

## Root Cause Analysis
Looking at the code:
1. The `GiftCardSchema` in `src/lib/validation/schemas.ts` (lines 125-130) validates:
   - `retailer`: min 1 character required
   - `card_number`: min 1 character required
   - `pin`: min 1 character required
   - `initial_balance`: must be positive number

2. The form in `add-gift-card-dialog.tsx` uses `react-hook-form` with the schema, but the `initial_balance` field has a default value of `0` (line 38), which fails the "positive" validation (must be > 0).

3. When the form initializes with `initial_balance: 0`, it immediately fails validation since 0 is not positive.

## Todo Items

- [ ] Fix the `initial_balance` default value from `0` to `undefined`
- [ ] Update the schema to use `.min(0.01)` instead of `.positive()` for clearer validation
- [ ] Test the form with sample data (potato, 235235, test pin, 50)
- [ ] Verify "Required" errors are gone and form submits successfully

## Changes Made

### 1. Fixed validation mode in add-gift-card-dialog.tsx
- Added `mode: 'onBlur'` to prevent validation from running immediately on page load
- Removed `initial_balance` from defaultValues to let the form handle empty state
- Removed `valueAsNumber: true` from the register call

### 2. Updated validation in schemas.ts (line 129)
- Changed `.positive()` to `.coerce.number().min(0.01, 'Initial balance must be at least $0.01')`
- The `coerce` ensures the string input from the form is converted to a number
- Provides clearer error messaging

### 3. Simplified onSubmit handler
- Removed manual `Number()` conversion since zod's coerce handles it
- Simplified the body to just `JSON.stringify(values)`

## Database Setup Required

### The gift_cards table doesn't exist yet in Supabase!

**Error seen:** `Could not find the table 'public.gift_cards' in the schema cache`

**To fix this, run the SQL migration:**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of this file:
   `/Users/kevinhao/Desktop/arvalo/supabase/migrations/20251115120000_create_gift_card_tables.sql`
6. Click **Run** to execute the migration

This will create:
- `gift_cards` table (for storing gift card info)
- `gift_card_transactions` table (for tracking purchases)
- `audit_log` table (for tracking changes)
- All necessary indexes and Row Level Security policies

## Review

### Summary
Fixed TWO issues:
1. **Form validation** - The form was validating immediately on load, showing errors before user input
2. **Database missing** - The gift_cards table hasn't been created in Supabase yet

### Files Modified
- `src/components/add-gift-card-dialog.tsx` - Fixed validation mode and field handling
- `src/lib/validation/schemas.ts` - Updated validation with coerce for proper type conversion

### Next Steps
1. ⚠️ **You need to run the SQL migration in Supabase** (see instructions above)
2. After running the migration, refresh the page and try adding a gift card again
3. The form validation errors should be gone, and cards should save successfully

### Testing (After Database Setup)
The form should:
- ✅ Not show validation errors on initial load
- ✅ Only validate fields when you click away (onBlur)
- ✅ Accept valid input (e.g., retailer: "potato", card_number: "235235", pin: "123", balance: 50)
- ✅ Submit successfully and save to database
