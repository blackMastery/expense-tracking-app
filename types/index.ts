export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // Legacy properties for backward compatibility
  imageUri?: string;
  category?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  items?: ShoppingListItemWithItem[];
}

export interface ShoppingListItem {
  id: string;
  list_id: string;
  item_id: string;
  added_at: string;
  quantity?: number;
}

export interface ShoppingListItemWithItem extends ShoppingListItem {
  item: Item;
  quantity: number;
}

export interface CreateItemData {
  name: string;
  price: number;
  imageUri?: string;
  category?: string;
}

export interface CreateShoppingListData {
  name: string;
  itemIds: string[];
}
