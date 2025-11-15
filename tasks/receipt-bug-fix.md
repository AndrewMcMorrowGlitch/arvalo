# Fix Receipt Creation Bug for Return Tracking

## Problem
When creating a purchase from return tracking, the API returns 400 error "failed to create purchase".

## Root Cause  
In `/api/purchases/route.ts` line 202, the code tries to save `receiptText` to the database's `ocr_raw_text` field. However, when using `skipExtraction: true` mode (from the confirmation dialog), `receiptText` is undefined because only `receiptData` is passed from the frontend.

## Tasks
- [x] Identify the bug location
- [x] Fix the API route to handle both modes correctly  
- [ ] Test the fix

## Solution Implemented
Changed line 202 in `/api/purchases/route.ts` from:
```typescript
ocr_raw_text: receiptText,
```
to:
```typescript
ocr_raw_text: receiptText || null,
```

This allows the purchase to be created even when `receiptText` is undefined (in skipExtraction mode).

## Changes Made
- Modified `src/app/api/purchases/route.ts:202` to make `ocr_raw_text` optional

## Testing
Please test by:
1. Going to the dashboard
2. Click "Manually add a receipt" 
3. Paste receipt text for return tracking
4. Confirm the extracted data
5. Verify the purchase is created successfully
