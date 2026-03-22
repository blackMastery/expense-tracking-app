-- Create shared_lists table
CREATE TABLE IF NOT EXISTS shared_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email VARCHAR(255) NOT NULL,
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;

-- Owner can manage their shares
CREATE POLICY "Owners can manage shares" ON shared_lists
  FOR ALL USING (auth.uid() = owner_id);

-- Recipients can view shares directed to them
CREATE POLICY "Recipients can view their shares" ON shared_lists
  FOR SELECT USING (
    shared_with_email = auth.email()
  );

-- Allow recipients to see the shared shopping list
CREATE POLICY "Recipients can view shared shopping lists" ON shopping_lists
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM shared_lists
      WHERE shared_lists.list_id = shopping_lists.id
      AND shared_lists.shared_with_email = auth.email()
    )
  );

-- Allow recipients with edit permission to modify items in shared lists
CREATE POLICY "Recipients with edit can modify shared list items" ON shopping_list_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shopping_lists sl
      WHERE sl.id = shopping_list_items.list_id
      AND (
        sl.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM shared_lists
          WHERE shared_lists.list_id = sl.id
          AND shared_lists.shared_with_email = auth.email()
          AND shared_lists.permission = 'edit'
        )
      )
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shared_lists_list_id ON shared_lists(list_id);
CREATE INDEX IF NOT EXISTS idx_shared_lists_owner_id ON shared_lists(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_lists_email ON shared_lists(shared_with_email);
