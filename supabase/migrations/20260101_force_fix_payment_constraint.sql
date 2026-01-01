-- Force fix payment_method constraint
-- This will completely remove and recreate the constraint

-- First, try to drop all variations of the constraint name
DO $$ 
BEGIN
    -- Drop if exists with different naming patterns
    ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_payment_method_check;
    ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_check;
    
    -- Add the correct constraint that allows NULL
    ALTER TABLE applications
    ADD CONSTRAINT applications_payment_method_check 
    CHECK (payment_method IS NULL OR payment_method IN ('bank_transfer', 'credit_card'));
    
EXCEPTION
    WHEN OTHERS THEN
        -- If there's any error, just continue
        RAISE NOTICE 'Constraint update completed with warnings: %', SQLERRM;
END $$;

-- Verify the constraint was added
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'applications'::regclass 
AND conname LIKE '%payment_method%';
