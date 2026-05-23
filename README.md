# Inventory Reservation System (Allo Take-Home)

A full-stack inventory reservation system built with Next.js (App Router), Prisma, and PostgreSQL, designed to handle safe stock reservation under concurrent checkout scenarios.

## LIVE DEMO LINK:
https://allo-take-home-exercise-bindiya-sud.vercel.app

## How to use:
1. Open homepage
2. Click Reserve
3. Actions: Confirm / Cancel / Wait for expiry

# Features

* Product listing with warehouse-wise stock
* Stock reservation with temporary holds
* 10-minute reservation expiry system
* Confirm purchase flow (permanent stock deduction)
* Cancel reservation flow (stock restoration)
* Automatic expiry cleanup (lazy cleanup on product fetch)
* Race-condition safe reservation using database row locking
* Full end-to-end checkout simulation UI

This system solves a common e-commerce issue:
Preventing overselling when multiple users try to purchase the last available units simultaneously.

# Concurrency Handling
To ensure correct behavior under concurrent requests, the reservation API uses PostgreSQL row-level locking:

SELECT *
FROM "Inventory"
WHERE "productId" = $1
AND "warehouseId" = $2
FOR UPDATE

### Why this matters:
* Prevents multiple transactions from reading the same stock simultaneously
* Ensures only one reservation succeeds for the last available unit
* Eliminates race conditions during checkout

# Reservation Expiry System
Each reservation has an "expiresAt" timestamp (set to 10 minutes.)

### Expiry handling approach:
Expired reservations are automatically cleaned up when "/api/products" is called
During cleanup:
  * reservedStock is decremented
  * reservation status is set to RELEASED

This is a lazy cleanup strategy, ensuring simplicity without background workers.

# Data Model Overview

### Product
Represents items available for purchase.

### Warehouse
Stores inventory per location.

### Inventory
Tracks stock per product per warehouse:
* totalStock
* reservedStock

### Reservation

Tracks temporary holds:
* PENDING
* CONFIRMED
* RELEASED
* expiresAt

# API Overview

## Products
GET /api/products
Returns all products with computed available stock.

## Create Reservation
POST /api/reservations

Request:
{
  "productId": "[product_id]",
  "warehouseId": "[warehouse_id]",
  "quantity": 1
}

Response:
* "409" if insufficient stock
* Returns reservation object on success

## Confirm Reservation
POST /api/reservations/:id/confirm
* Confirms purchase
* Converts reservation into final stock deduction
* Returns "410" if expired

## Release Reservation
POST /api/reservations/:id/release
* Cancels reservation early
* Restores stock

## Get Reservation
GET /api/reservations/:id
Returns reservation details with product + warehouse info.

# Frontend Flow
1. User views product list
2. Clicks "Reserve"
3. Redirected to reservation page
4. Countdown timer starts (10 min)
5. User can:
   * Confirm purchase
   * Cancel reservation
   * Wait for expiry

UI updates automatically after actions.

# How Expiry Works
* Reservations expire after 10 minutes
* Expired reservations are cleaned when "/api/products" is fetched
* Stock is automatically restored during cleanup

# Trade-offs

### 1. Lazy Expiry Cleanup
Instead of background workers (cron jobs), expiry is handled during product fetch.
This simplifies architecture but depends on user traffic.

### 2. No Redis Locking
Database-level locking was used instead of Redis for simplicity.

### 3. Basic UI
UI is minimal and functional, focused on system behavior rather than design.

# How to Run Locally
npm install

# Set environment variables:
DATABASE_URL=[postgres_url]

# Run migrations:
npx prisma db push

# Seed database:
npx prisma db seed

# Start server:
npm run dev


