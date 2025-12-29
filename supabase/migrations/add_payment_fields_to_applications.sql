-- Add payment tracking fields to applications table
-- Migration: add_payment_fields_to_applications
-- Created: 2025-12-29

ALTER TABLE applications
ADD COLUMN IF NOT EXISTS wants_payment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'credit_card')),
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN applications.wants_payment IS 'Whether the applicant wants to pay now';
COMMENT ON COLUMN applications.payment_method IS 'Payment method: bank_transfer or credit_card';
COMMENT ON COLUMN applications.payment_status IS 'Payment status: pending, completed, failed, cancelled';
COMMENT ON COLUMN applications.payment_date IS 'Date when payment was completed';

-- Create index for payment queries
CREATE INDEX IF NOT EXISTS idx_applications_payment_status ON applications(payment_status);
CREATE INDEX IF NOT EXISTS idx_applications_wants_payment ON applications(wants_payment);
