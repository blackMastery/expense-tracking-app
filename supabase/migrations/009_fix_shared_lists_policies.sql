-- Fix RLS policies that incorrectly queried auth.users directly
-- Replace with auth.email() which is accessible to authenticated users

DROP POLICY IF EXISTS "Recipients can view their shares" ON shared_lists;
DROP POLICY IF EXISTS "Recipients can view shared shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Recipients with edit can modify shared list items" ON shopping_list_items;

CREATE POLICY "Recipients can view their shares" ON shared_lists
  FOR SELECT USING (
    shared_with_email = auth.email()
  );

CREATE POLICY "Recipients can view shared shopping lists" ON shopping_lists
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM shared_lists
      WHERE shared_lists.list_id = shopping_lists.id
      AND shared_lists.shared_with_email = auth.email()
    )
  );

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
