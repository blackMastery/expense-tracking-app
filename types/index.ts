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
  is_recurring?: boolean;
  recurrence_period?: 'weekly' | 'monthly' | 'yearly';
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
  is_shared?: boolean;
  owner_email?: string;
}

export interface ShoppingListItem {
  id: string;
  list_id: string;
  item_id: string;
  added_at: string;
  quantity?: number;
  checked?: boolean;
}

export interface ShoppingListItemWithItem extends ShoppingListItem {
  item: Item;
  quantity: number;
  checked: boolean;
}

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  item_id: string;
  price: number;
  recorded_at: string;
}

export interface SharedList {
  id: string;
  list_id: string;
  owner_id: string;
  shared_with_email: string;
  permission: 'view' | 'edit';
  created_at: string;
}

export interface CreateItemData {
  name: string;
  price: number;
  imageUri?: string;
  category?: string;
  is_recurring?: boolean;
  recurrence_period?: 'weekly' | 'monthly' | 'yearly';
}

export interface CreateShoppingListData {
  name: string;
  itemIds: string[];
}

export interface CreateBudgetData {
  name: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  category?: string;
}
