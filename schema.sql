-- Items Table
CREATE TABLE Items (
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

CREATE INDEX idx_items_user_id ON Items(user_id);
CREATE INDEX idx_items_id ON Items(id);

-- ShoppingLists Table
CREATE TABLE ShoppingLists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_shoppinglists_user_id ON ShoppingLists(user_id);
CREATE INDEX idx_shoppinglists_id ON ShoppingLists(id);

-- ShoppingListItems Table (Junction)
CREATE TABLE ShoppingListItems (
    list_id UUID NOT NULL,
    item_id UUID NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (list_id, item_id),
    FOREIGN KEY (list_id) REFERENCES ShoppingLists(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES Items(id) ON DELETE CASCADE
);

CREATE INDEX idx_shoppinglistitems_list_id ON ShoppingListItems(list_id);
CREATE INDEX idx_shoppinglistitems_item_id ON ShoppingListItems(item_id);