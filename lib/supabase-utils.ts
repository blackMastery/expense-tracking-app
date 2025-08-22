import { CreateItemData, Item, Profile, ShoppingList, ShoppingListItemWithItem } from '../types';
import { supabase } from './supabase';

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
};

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data;
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Item database functions
export const createItem = async (itemData: CreateItemData): Promise<Item> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Handle image upload if provided
  let imageUrl: string | undefined;
  if (itemData.imageUri) {
    imageUrl = await uploadItemImage(itemData.imageUri, user.id);
  }

  const { data, error } = await supabase
    .from('items')
    .insert({
      user_id: user.id,
      name: itemData.name,
      price: itemData.price,
      image_url: imageUrl,
      description: itemData.category || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating item:', error);
    throw error;
  }

  return data;
};

export const getItems = async (): Promise<Item[]> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching items:', error);
    throw error;
  }

  return data || [];
};

export const updateItem = async (id: string, updates: Partial<Item>): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('items')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

export const deleteItem = async (id: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

// Image upload function
const uploadItemImage = async (imageUri: string, userId: string): Promise<string> => {
  try {
    // Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Generate unique filename
    const fileExt = imageUri.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('item-images')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('item-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error handling image upload:', error);
    throw error;
  }
};

// Shopping List database functions
export const createShoppingList = async (name: string): Promise<ShoppingList> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('shopping_lists')
    .insert({
      user_id: user.id,
      name: name,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating shopping list:', error);
    throw error;
  }

  return data;
};

export const getShoppingLists = async (): Promise<ShoppingList[]> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shopping lists:', error);
    throw error;
  }

  return data || [];
};

export const updateShoppingList = async (id: string, updates: Partial<ShoppingList>): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('shopping_lists')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating shopping list:', error);
    throw error;
  }
};

export const deleteShoppingList = async (id: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('shopping_lists')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting shopping list:', error);
    throw error;
  }
};

// Shopping List Items database functions
export const addItemToShoppingList = async (listId: string, itemId: string, quantity: number = 1): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // First verify the shopping list belongs to the user
  const { data: list, error: listError } = await supabase
    .from('shopping_lists')
    .select('id')
    .eq('id', listId)
    .eq('user_id', user.id)
    .single();

  if (listError || !list) {
    throw new Error('Shopping list not found or access denied');
  }

  // Check if item already exists in the list
  const { data: existingItem, error: checkError } = await supabase
    .from('shopping_list_items')
    .select('*')
    .eq('list_id', listId)
    .eq('item_id', itemId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking existing item:', checkError);
    throw checkError;
  }

  if (existingItem) {
    // Update quantity if item already exists
    const { error: updateError } = await supabase
      .from('shopping_list_items')
      .update({
        quantity: (existingItem.quantity || 1) + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('list_id', listId)
      .eq('item_id', itemId);

    if (updateError) {
      console.error('Error updating item quantity:', updateError);
      throw updateError;
    }
  } else {
    // Add new item to the list
    const { error: insertError } = await supabase
      .from('shopping_list_items')
      .insert({
        list_id: listId,
        item_id: itemId,
        quantity: quantity,
      });

    if (insertError) {
      console.error('Error adding item to shopping list:', insertError);
      throw insertError;
    }
  }
};

export const removeItemFromShoppingList = async (listId: string, itemId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // First verify the shopping list belongs to the user
  const { data: list, error: listError } = await supabase
    .from('shopping_lists')
    .select('id')
    .eq('id', listId)
    .eq('user_id', user.id)
    .single();

  if (listError || !list) {
    throw new Error('Shopping list not found or access denied');
  }

  const { error } = await supabase
    .from('shopping_list_items')
    .delete()
    .eq('list_id', listId)
    .eq('item_id', itemId);

  if (error) {
    console.error('Error removing item from shopping list:', error);
    throw error;
  }
};

export const getShoppingListWithItems = async (listId: string): Promise<ShoppingList & { items: ShoppingListItemWithItem[] } | null> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get the shopping list
  const { data: list, error: listError } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('id', listId)
    .eq('user_id', user.id)
    .single();

  if (listError || !list) {
    return null;
  }

  // Get the items in the shopping list
  const { data: listItems, error: itemsError } = await supabase
    .from('shopping_list_items')
    .select(`
      *,
      item:items(*)
    `)
    .eq('list_id', listId);

  if (itemsError) {
    console.error('Error fetching shopping list items:', itemsError);
    throw itemsError;
  }

  return {
    ...list,
    items: listItems || [],
  };
};
