-- Create price_history table
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- RLS: users can only see price history for their own items
CREATE POLICY "Users can view price history of own items" ON price_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items WHERE items.id = price_history.item_id AND items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert price history for own items" ON price_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM items WHERE items.id = price_history.item_id AND items.user_id = auth.uid()
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_price_history_item_id ON price_history(item_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(item_id, recorded_at DESC);
