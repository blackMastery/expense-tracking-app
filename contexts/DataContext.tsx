import { createItem, deleteItem as deleteItemInSupabase, getItems, updateItem as updateItemInSupabase } from '@/lib/supabase-utils';
import { 
  createShoppingList as createShoppingListInSupabase,
  getShoppingLists as getShoppingListsFromSupabase,
  updateShoppingList as updateShoppingListInSupabase,
  deleteShoppingList as deleteShoppingListInSupabase,
  addItemToShoppingList as addItemToShoppingListInSupabase,
  removeItemFromShoppingList as removeItemFromShoppingListInSupabase,
  getShoppingListWithItems
} from '@/lib/supabase-utils';
import { CreateItemData, CreateShoppingListData, Item, ShoppingList } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface DataContextType {
  items: Item[];
  shoppingLists: ShoppingList[];
  addItem: (itemData: CreateItemData) => Promise<Item>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  createShoppingList: (listData: CreateShoppingListData) => Promise<ShoppingList>;
  updateShoppingList: (id: string, updates: Partial<ShoppingList>) => Promise<void>;
  deleteShoppingList: (id: string) => Promise<void>;
  addItemToShoppingList: (listId: string, itemId: string, quantity?: number) => Promise<void>;
  removeItemFromShoppingList: (listId: string, itemId: string) => Promise<void>;
  getShoppingListTotal: (listId: string) => number;
  getShoppingListItemCount: (listId: string) => number;
  refreshItems: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from Supabase first
      try {
        const [supabaseItems, supabaseLists] = await Promise.all([
          getItems(),
          getShoppingListsFromSupabase()
        ]);
        
        setItems(supabaseItems);
        setShoppingLists(supabaseLists);
        
        // Cache in AsyncStorage
        await Promise.all([
          AsyncStorage.setItem('items', JSON.stringify(supabaseItems)),
          AsyncStorage.setItem('shoppingLists', JSON.stringify(supabaseLists))
        ]);
      } catch (error) {
        console.log('Failed to load from Supabase, using cached data:', error);
        
        // Fallback to AsyncStorage if Supabase fails
        const [cachedItems, cachedLists] = await Promise.all([
          AsyncStorage.getItem('items'),
          AsyncStorage.getItem('shoppingLists')
        ]);
        
        if (cachedItems) {
          const parsedItems = JSON.parse(cachedItems).map((item: any) => ({
            ...item,
            created_at: new Date(item.created_at).toISOString(),
            updated_at: new Date(item.updated_at).toISOString(),
          }));
          setItems(parsedItems);
        }
        
        if (cachedLists) {
          const parsedLists = JSON.parse(cachedLists).map((list: any) => ({
            ...list,
            created_at: new Date(list.created_at).toISOString(),
            updated_at: new Date(list.updated_at).toISOString(),
          }));
          setShoppingLists(parsedLists);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveItems = async (newItems: Item[]) => {
    try {
      await AsyncStorage.setItem('items', JSON.stringify(newItems));
    } catch (error) {
      console.error('Error saving items to cache:', error);
    }
  };

  const saveShoppingLists = async (newLists: ShoppingList[]) => {
    try {
      await AsyncStorage.setItem('shoppingLists', JSON.stringify(newLists));
    } catch (error) {
      console.error('Error saving shopping lists:', error);
    }
  };

  const addItem = async (itemData: CreateItemData): Promise<Item> => {
    try {
      // Save to Supabase first
      const newItem = await createItem(itemData);
      
      // Update local state
      const newItems = [...items, newItem];
      setItems(newItems);
      
      // Cache in AsyncStorage
      await saveItems(newItems);
      
      return newItem;
    } catch (error) {
      console.error('Error adding item:', error);
      
      // If Supabase fails, save locally only
      const fallbackItem: Item = {
        id: Date.now().toString(),
        user_id: 'local', // Placeholder for local items
        ...itemData,
        image_url: itemData.imageUri,
        description: itemData.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const newItems = [...items, fallbackItem];
      setItems(newItems);
      await saveItems(newItems);
      
      return fallbackItem;
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>): Promise<void> => {
    try {
      // Update in Supabase first
      await updateItemInSupabase(id, updates);
      
      // Update local state
      const newItems = items.map(item =>
        item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
      );
      setItems(newItems);
      await saveItems(newItems);
    } catch (error) {
      console.error('Error updating item:', error);
      
      // If Supabase fails, update locally only
      const newItems = items.map(item =>
        item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
      );
      setItems(newItems);
      await saveItems(newItems);
    }
  };

  const deleteItem = async (id: string): Promise<void> => {
    try {
      // Delete from Supabase first
      await deleteItemInSupabase(id);
      
      // Update local state
      const newItems = items.filter(item => item.id !== id);
      setItems(newItems);
      await saveItems(newItems);
    } catch (error) {
      console.error('Error deleting item:', error);
      
      // If Supabase fails, delete locally only
      const newItems = items.filter(item => item.id !== id);
      setItems(newItems);
      await saveItems(newItems);
    }
  };

  const createShoppingList = async (listData: CreateShoppingListData): Promise<ShoppingList> => {
    try {
      // Save to Supabase first
      const newList = await createShoppingListInSupabase(listData.name);
      
      // Update local state
      const newLists = [...shoppingLists, newList];
      setShoppingLists(newLists);
      
      // Cache in AsyncStorage
      await saveShoppingLists(newLists);
      
      return newList;
    } catch (error) {
      console.error('Error creating shopping list:', error);
      
      // If Supabase fails, save locally only
      const fallbackList: ShoppingList = {
        id: Date.now().toString(),
        name: listData.name,
        user_id: 'local', // Placeholder for local items
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const newLists = [...shoppingLists, fallbackList];
      setShoppingLists(newLists);
      await saveShoppingLists(newLists);
      
      return fallbackList;
    }
  };

  const updateShoppingList = async (id: string, updates: Partial<ShoppingList>): Promise<void> => {
    try {
      // Update in Supabase first
      await updateShoppingListInSupabase(id, updates);
      
      // Update local state
      const newLists = shoppingLists.map(list =>
        list.id === id ? { ...list, ...updates, updated_at: new Date().toISOString() } : list
      );
      setShoppingLists(newLists);
      await saveShoppingLists(newLists);
    } catch (error) {
      console.error('Error updating shopping list:', error);
      
      // If Supabase fails, update locally only
      const newLists = shoppingLists.map(list =>
        list.id === id ? { ...list, ...updates, updated_at: new Date().toISOString() } : list
      );
      setShoppingLists(newLists);
      await saveShoppingLists(newLists);
    }
  };

  const deleteShoppingList = async (id: string): Promise<void> => {
    try {
      // Delete from Supabase first
      await deleteShoppingListInSupabase(id);
      
      // Update local state
      const newLists = shoppingLists.filter(list => list.id !== id);
      setShoppingLists(newLists);
      await saveShoppingLists(newLists);
    } catch (error) {
      console.error('Error deleting shopping list:', error);
      
      // If Supabase fails, delete locally only
      const newLists = shoppingLists.filter(list => list.id !== id);
      setShoppingLists(newLists);
      await saveShoppingLists(newLists);
    }
  };

  const addItemToShoppingList = async (listId: string, itemId: string, quantity: number = 1): Promise<void> => {
    try {
      // Add to Supabase first
      await addItemToShoppingListInSupabase(listId, itemId, quantity);
      
      // Refresh the shopping list data
      const updatedList = await getShoppingListWithItems(listId);
      if (updatedList) {
        const newLists = shoppingLists.map(list =>
          list.id === listId ? updatedList : list
        );
        setShoppingLists(newLists);
        await saveShoppingLists(newLists);
      }
    } catch (error) {
      console.error('Error adding item to shopping list:', error);
      throw error;
    }
  };

  const removeItemFromShoppingList = async (listId: string, itemId: string): Promise<void> => {
    try {
      // Remove from Supabase first
      await removeItemFromShoppingListInSupabase(listId, itemId);
      
      // Refresh the shopping list data
      const updatedList = await getShoppingListWithItems(listId);
      if (updatedList) {
        const newLists = shoppingLists.map(list =>
          list.id === listId ? updatedList : list
        );
        setShoppingLists(newLists);
        await saveShoppingLists(newLists);
      }
    } catch (error) {
      console.error('Error removing item from shopping list:', error);
      throw error;
    }
  };

  const getShoppingListTotal = (listId: string): number => {
    const list = shoppingLists.find(l => l.id === listId);
    if (!list || !list.items) return 0;
    return list.items.reduce((total, item) => total + (item.item.price * (item.quantity || 1)), 0);
  };

  const getShoppingListItemCount = (listId: string): number => {
    const list = shoppingLists.find(l => l.id === listId);
    if (!list || !list.items) return 0;
    return list.items.length;
  };

  const refreshItems = async () => {
    try {
      const supabaseItems = await getItems();
      setItems(supabaseItems);
      await saveItems(supabaseItems);
    } catch (error) {
      console.error('Error refreshing items:', error);
    }
  };

  const value: DataContextType = {
    items,
    shoppingLists,
    addItem,
    updateItem,
    deleteItem,
    createShoppingList,
    updateShoppingList,
    deleteShoppingList,
    addItemToShoppingList,
    removeItemFromShoppingList,
    getShoppingListTotal,
    getShoppingListItemCount,
    refreshItems,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
