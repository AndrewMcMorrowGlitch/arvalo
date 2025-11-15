# Merge Execution Plan: Gift-Card-Tracking → Main

## ✅ Strategy Confirmed

Based on your requirements:
- ✅ Keep Gmail import
- ✅ Separate gift card purchases from receipt purchases
- ✅ Rename database tables (purchases → gift_card_transactions)
- ✅ Keep latest dashboard components with real data
- ✅ Update gift cards UI to match main branch style

---

## 📝 Step-by-Step Execution

### Step 1: Start Merge (No Commit)
```bash
git merge gift-card-tracking --no-commit --no-ff
```

### Step 2: Handle Conflicts - Keep from MAIN
These files should use main's version (newer, better):
- ✅ `src/components/dashboard/dashboard-shell.tsx` (has Gmail import)
- ✅ `src/components/dashboard/price-drops.tsx` (real data)
- ✅ `src/components/dashboard/return-tracking.tsx` (real data)
- ✅ `src/components/dashboard/subscriptions.tsx` (real data)
- ✅ `src/components/dashboard/duplicate-charges.tsx` (real data)
- ✅ `src/app/api/purchases/route.ts` (receipt tracking - keep separate)

### Step 3: Keep from GIFT-CARD-TRACKING
These are NEW files we want to add:
- ✅ `src/app/api/gift-cards/route.ts`
- ✅ `src/app/api/gift-cards/[id]/purchases/route.ts`
- ✅ `src/components/add-gift-card-dialog.tsx`
- ✅ `src/components/make-purchase-dialog.tsx`
- ✅ `src/components/purchase-history.tsx`
- ✅ `src/lib/validation/schemas.ts` (merge both - add gift card schemas)
- ✅ Database migrations (but will need to rename tables)

### Step 4: Manual Updates Needed

#### A. Gift Cards Component
- Take from gift-card-tracking (full functionality)
- Update UI to match main's style:
  - Match border styles, colors, spacing
  - Update header format to match other panels
  - Use consistent button styles
  - Match card/section styling

#### B. Dashboard Shell
- Keep main version
- Ensure gift cards section still works with new component

#### C. Database Migrations
Rename in both migration files:
- `purchases` table → `gift_card_transactions`
- Update all references in RPC functions
- Update API routes to use new table name

#### D. Validation Schemas
Merge both:
- Keep ReceiptDataSchema from main
- Add GiftCardSchema from gift-card-tracking
- Add PurchaseSchema (rename to GiftCardPurchaseSchema for clarity)

### Step 5: Gmail Routes
Ensure these are preserved:
- `src/app/api/gmail/callback/route.ts`
- `src/app/api/gmail/connect/route.ts`
- `src/app/api/gmail/import/route.ts`

### Step 6: Testing
- TypeScript build check
- Verify no import errors
- Check schema exports

---

## 🎯 File-by-File Decision Matrix

| File | Action | Reason |
|------|--------|--------|
| `dashboard-shell.tsx` | Use MAIN | Has Gmail import + latest |
| `gift-cards.tsx` | Use GC-TRACKING then modify | Full functionality, update UI |
| `price-drops.tsx` | Use MAIN | Real data integration |
| `return-tracking.tsx` | Use MAIN | Real data integration |
| `subscriptions.tsx` | Use MAIN | Real data integration |
| `duplicate-charges.tsx` | Use MAIN | Real data integration |
| `purchases/route.ts` | Use MAIN | Keep receipt tracking |
| `gift-cards/route.ts` | Use GC-TRACKING | New feature |
| `schemas.ts` | MERGE BOTH | Need both sets |
| Gmail routes | Use MAIN | Preserve feature |
| Database migrations | Use GC-TRACKING + RENAME | New, but fix naming |

---

## 🔧 UI Updates for Gift Cards Component

Match main's style patterns:

```tsx
// Header format (like other panels)
<div className="border-l-4 border-[color] pl-4">
  <h1 className="text-2xl font-bold text-gray-900 mb-2">Gift Cards</h1>
  <p className="text-gray-600">Description</p>
</div>

// Card styling (match other panels)
<div className="bg-white rounded-2xl p-6 border border-gray-200">

// Button styling (match main's buttons)
<Button variant="..." size="..." className="...">
```

---

## ⚠️ Validation Checklist

Before committing:
- [ ] Gmail import button still visible in dashboard
- [ ] All 3 Gmail API routes exist
- [ ] Gift cards component renders
- [ ] Gift card API routes work
- [ ] Database migrations renamed correctly
- [ ] No TypeScript errors
- [ ] Schemas export correctly
- [ ] Latest dashboard components preserved

---

## 🚀 Ready to Execute

Proceeding with merge...
