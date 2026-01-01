-- Fix payment_method constraint to allow NULL values
-- Migration: fix_payment_method_constraint
-- Created: 2026-01-01

-- Drop the existing constraint
ALTER TABLE applications
DROP CONSTRAINT IF EXISTS applications_payment_method_check;

-- Add new constraint that allows NULL
ALTER TABLE applications
ADD CONSTRAINT applications_payment_method_check 
CHECK (payment_method IS NULL OR payment_method IN ('bank_transfer', 'credit_card'));
