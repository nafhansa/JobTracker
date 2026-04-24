-- Migration: Add unique constraint on order_id for lifetime_access_purchases (webhook idempotency)
ALTER TABLE lifetime_access_purchases ADD CONSTRAINT unique_lifetime_order_id UNIQUE (order_id);