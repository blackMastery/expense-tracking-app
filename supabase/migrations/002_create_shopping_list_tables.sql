-- Create shopping list tables
-- Items Table
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_items_user_id ON public.items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_id ON public.items(id);

-- ShoppingLists Table
CREATE TABLE IF NOT EXISTS public.shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shoppinglists_user_id ON public.shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shoppinglists_id ON public.shopping_lists(id);

-- ShoppingListItems Table (Junction)
CREATE TABLE IF NOT EXISTS public.shopping_list_items (
    list_id UUID NOT NULL,
    item_id UUID NOT NULL,
    quantity INTEGER DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (list_id, item_id),
    FOREIGN KEY (list_id) REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shoppinglistitems_list_id ON public.shopping_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_shoppinglistitems_item_id ON public.shopping_list_items(item_id);

-- Enable RLS on all tables
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Create policies for Items table
CREATE POLICY "Users can view their own items" ON public.items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items" ON public.items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON public.items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON public.items
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for ShoppingLists table
CREATE POLICY "Users can view their own shopping lists" ON public.shopping_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping lists" ON public.shopping_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping lists" ON public.shopping_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping lists" ON public.shopping_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for ShoppingListItems table
CREATE POLICY "Users can view items in their shopping lists" ON public.shopping_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists 
      WHERE id = list_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add items to their shopping lists" ON public.shopping_list_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopping_lists 
      WHERE id = list_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove items from their shopping lists" ON public.shopping_list_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists 
      WHERE id = list_id AND user_id = auth.uid()
    )
  );

-- Grant necessary permissions
GRANT ALL ON public.items TO anon, authenticated;
GRANT ALL ON public.shopping_lists TO anon, authenticated;
GRANT ALL ON public.shopping_list_items TO anon, authenticated;
