-- Add recurring expense fields to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE items ADD COLUMN IF NOT EXISTS recurrence_period TEXT CHECK (recurrence_period IN ('weekly', 'monthly', 'yearly'));
