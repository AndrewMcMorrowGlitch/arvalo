# Technical Plan for New Backend Features

This document outlines the technical plan for implementing several new features in the Arvalo backend. The plan is designed to be compatible with the existing Next.js, Supabase, and Claude-integrated architecture.

## Core Concepts

The implementation of these new features will follow the existing architectural patterns:

- **Dedicated Tracking Tables:** For each new tracking feature (Returns, Subscriptions, Warranties, Gift Cards), a new table will be created in Supabase, linked to the `purchases` table via a `purchase_id`. This follows the pattern established by the `price_tracking` table.
- **Extensible Data Extraction:** The existing Claude prompts in `src/lib/claude/extract-receipt.ts` will be updated to extract new information (e.g., return policy URLs, warranty details) from receipts.
- **Recurring Tasks via Cron Jobs:** New cron jobs, modeled after `src/app/api/cron/check-prices/route.ts`, will be created to monitor deadlines and trigger notifications.
- **Unified Notification System:** All new alerts and reminders will be funneled into the existing `notifications` table.

---

## 1. Return Track

**Objective:** Track return windows, deadlines, and status updates to prevent missed refunds.

### Data Model

- **New Table: `return_tracking`**
  - `id`: UUID, primary key
  - `purchase_id`: UUID, foreign key to `purchases`
  - `user_id`: UUID, foreign key to `users`
  - `return_by_date`: Timestamp
  - `status`: Enum (`eligible`, `in_progress`, `completed`, `expired`)
  - `return_policy_url`: Text (optional)

### Backend Logic

1.  **Data Extraction:**
    - Update the `ReceiptData` interface in `src/lib/claude/extract-receipt.ts` to include `return_by_date` and `return_policy_url`.
    - Enhance the Claude prompt to extract this information from receipts. If not available on the receipt, it could be a secondary step to scrape the retailer's website.
2.  **Creating Return Tracking:**
    - In the `POST /api/purchases` route, when a purchase is created, check if `return_by_date` is present. If so, create a new entry in the `return_tracking` table.
3.  **Cron Job for Deadlines:**
    - Create a new cron job at `src/app/api/cron/check-returns/route.ts`.
    - This job will run daily and query the `return_tracking` table for items where `return_by_date` is approaching (e.g., within 7 days).
    - For each upcoming deadline, create a notification in the `notifications` table.
    - It will also update the `status` to `expired` for past-due returns.

### API Endpoints

- **`POST /api/returns/track`**: (Optional) Allow users to manually add or update return tracking for a purchase.
- **`GET /api/returns`**: Fetches all return tracking information for the current user.

---

## 2. Subscription Management

**Objective:** Identify active subscriptions, upcoming renewals, and unused services.

### Data Model

- **New Table: `subscriptions`**
  - `id`: UUID, primary key
  - `purchase_id`: UUID, foreign key to `purchases`
  - `user_id`: UUID, foreign key to `users`
  - `renewal_date`: Timestamp
  - `billing_cycle`: Enum (`monthly`, `yearly`, `quarterly`)
  - `price`: Number
  - `is_active`: Boolean

### Backend Logic

1.  **Data Extraction & Identification:**
    - Update `extract-receipt.ts` to identify subscription-related keywords (e.g., "subscription", "renewal", "monthly plan").
    - The Claude prompt should be trained to extract `renewal_date`, `billing_cycle`, and `price`.
2.  **Creating Subscriptions:**
    - In `POST /api/purchases`, if a purchase is identified as a subscription, create an entry in the `subscriptions` table.
3.  **Cron Job for Renewals:**
    - Create a new cron job at `src/app/api/cron/check-subscriptions/route.ts`.
    - This job will run daily to:
        - Find subscriptions with `renewal_date` approaching (e.g., within 7 days) and create notifications.
        - After a renewal date passes, automatically update the `renewal_date` to the next billing cycle and assume it's still active, unless cancelled by the user.

### API Endpoints

- **`GET /api/subscriptions`**: Fetches all subscriptions for the current user.
- **`PUT /api/subscriptions/:id`**: Allows a user to mark a subscription as `is_active: false`.

---

## 3. Warranty Tracking

**Objective:** Store warranty info and monitor eligibility for claims.

### Data Model

- **New Table: `warranties`**
  - `id`: UUID, primary key
  - `purchase_id`: UUID, foreign key to `purchases`
  - `user_id`: UUID, foreign key to `users`
  - `expires_at`: Timestamp
  - `warranty_provider`: Text
  - `details_url`: Text (optional)

### Backend Logic

1.  **Data Extraction:**
    - Update `extract-receipt.ts` to look for warranty information (e.g., "warranty", "extended protection").
    - Extract `expires_at` and other details.
2.  **Creating Warranties:**
    - In `POST /api/purchases`, if warranty information is found, create an entry in the `warranties` table.
3.  **Cron Job for Expirations:**
    - Create `src/app/api/cron/check-warranties/route.ts`.
    - This daily job will find warranties nearing their `expires_at` date and create notifications.

### API Endpoints

- **`GET /api/warranties`**: Fetches all warranties for the current user.

---

## 4. Gift Card Tracking

**Objective:** Track balances and expiration dates for gift cards.

### Data Model

- **New Table: `gift_cards`**
  - `id`: UUID, primary key
  - `user_id`: UUID, foreign key to `users`
  - `provider`: Text (e.g., "Amazon", "Starbucks")
  - `initial_balance`: Number
  - `current_balance`: Number
  - `expires_at`: Timestamp (optional)
  - `last_used_at`: Timestamp

### Backend Logic

1.  **Data Extraction:**
    - This is more complex as gift cards may not be on purchase receipts.
    - A dedicated UI for adding gift cards is recommended.
    - The Claude `ocr.ts` could be used to extract details from a photo of a gift card.
2.  **Cron Job for Expirations:**
    - Create `src/app/api/cron/check-gift-cards/route.ts`.
    - This daily job will find gift cards nearing their `expires_at` date and create notifications.

### API Endpoints

- **`POST /api/gift-cards`**: To manually add a new gift card.
- **`GET /api/gift-cards`**: Fetches all gift cards for the current user.
- **`PUT /api/gift-cards/:id`**: To update the balance of a gift card after use.

---

## 5. Duplicate Charge Detection

**Objective:** Detect and alert users about accidental double charges.

### Backend Logic

1.  **Detection Logic:**
    - This can be implemented directly within the `POST /api/purchases` route.
    - Before inserting a new purchase, run a query to find existing purchases for the same `user_id` that have:
        - The same `retailer_id`.
        - The same `total` amount.
        - A `purchase_date` within a close time window (e.g., +/- 5 minutes).
2.  **Alerting:**
    - If a potential duplicate is found, instead of blocking the purchase, create a high-priority notification for the user in the `notifications` table, asking them to review the potential duplicate.

### API Endpoints

- No new endpoints required. This is a modification of an existing one.

---

## 6. Cross-Retailer Comparison

**Objective:** Compare prices for identical items across major retailers.

### Backend Logic

1.  **Product Identification:**
    - This requires a universal identifier for a product, like a UPC or SKU.
    - The `extract-receipt.ts` prompt should be updated to extract this information.
2.  **Comparison Service:**
    - Create a new function, `findBestPrice(product_identifier)`, likely in a new file `src/lib/bright-data/price-comparison.ts`.
    - This function would need a predefined list of major retailers and their product page URL structures.
    - It would iterate through the retailers, construct the search URL for the `product_identifier`, and use the existing `checkProductPrice` function to get the price from each.
3.  **Triggering Comparison:**
    - This could be triggered manually by the user from a purchase details page.

### API Endpoints

- **`GET /api/products/:id/compare-prices`**: Takes a `purchase.id` or `product.id`, identifies the product, and triggers the comparison logic. Returns a list of prices from different retailers.

---

## 7. Recurrent Purchase Tracking

**Objective:** Track recurrent purchases and recommend optimal buy cycles.

### Data Model

- **New Table: `recurrent_purchases`**
  - `id`: UUID, primary key
  - `user_id`: UUID, foreign key to `users`
  - `product_name_normalized`: Text (a normalized name for the product)
  - `purchase_dates`: Array of Timestamps
  - `avg_cycle_days`: Integer
  - `next_predicted_purchase`: Timestamp

### Backend Logic

1.  **Identification and Calculation:**
    - Create a new cron job at `src/app/api/cron/analyze-recurrence/route.ts`.
    - This job will run weekly/monthly.
    - It will scan the `purchases` table, group items by a normalized product name for each user.
    - For products purchased multiple times (e.g., > 2), it will calculate the average time between purchases to get `avg_cycle_days` and predict the `next_predicted_purchase`.
    - The results will be stored/updated in the `recurrent_purchases` table.
2.  **Notifications:**
    - A separate daily cron job (`check-recurrent-purchases`) will check this table and create notifications for users when a `next_predicted_purchase` date is near.

### API Endpoints

- **`GET /api/recommendations/recurrent`**: Fetches the recurrent purchase recommendations for the current user.

---
## Price Drop
This feature seems to be already implemented with the `price_tracking` table and the `/api/cron/check-prices` cron job. No major changes are needed here, but it serves as a great foundation for the other tracking features.
