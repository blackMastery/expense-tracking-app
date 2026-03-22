-- Add checked column to shopping_list_items for shopping mode
ALTER TABLE shopping_list_items ADD COLUMN IF NOT EXISTS checked BOOLEAN DEFAULT false;

-- Update the updated_at index to include checked for faster queries
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_checked ON shopping_list_items(list_id, checked);
