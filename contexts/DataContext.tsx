import {
  createBudget as createBudgetInSupabase,
  createItem,
  createShoppingList as createShoppingListInSupabase,
  deleteBudget as deleteBudgetInSupabase,
  deleteItem as deleteItemInSupabase,
  deleteShoppingList as deleteShoppingListInSupabase,
  addItemToShoppingList as addItemToShoppingListInSupabase,
  removeItemFromShoppingList as removeItemFromShoppingListInSupabase,
  updateShoppingListItemQuantity as updateShoppingListItemQuantityInSupabase,
  getBudgets,
  getItems,
  getShoppingListWithItems,
  getShoppingLists as getShoppingListsFromSupabase,
  getSharedWithMeLists,
  toggleShoppingListItemChecked as toggleCheckedInSupabase,
  updateBudget as updateBudgetInSupabase,
  updateItem as updateItemInSupabase,
  updateShoppingList as updateShoppingListInSupabase,
} from '@/lib/supabase-utils';
import { Budget, CreateBudgetData, CreateItemData, CreateShoppingListData, Item, ShoppingList } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface DataContextType {
  items: Item[];
  shoppingLists: ShoppingList[];
  sharedLists: ShoppingList[];
  budgets: Budget[];
  addItem: (itemData: CreateItemData) => Promise<Item>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  createShoppingList: (listData: CreateShoppingListData) => Promise<ShoppingList>;
  updateShoppingList: (id: string, updates: Partial<ShoppingList>) => Promise<void>;
  deleteShoppingList: (id: string) => Promise<void>;
  addItemToShoppingList: (listId: string, itemId: string, quantity?: number) => Promise<void>;
  removeItemFromShoppingList: (listId: string, itemId: string) => Promise<void>;
  updateItemQuantity: (listId: string, itemId: string, quantity: number) => Promise<void>;
  toggleItemChecked: (listId: string, itemId: string, checked: boolean) => Promise<void>;
  refreshShoppingList: (listId: string) => Promise<void>;
  getShoppingListTotal: (listId: string) => number;
  getShoppingListItemCount: (listId: string) => number;
  refreshItems: () => Promise<void>;
  createBudget: (budgetData: CreateBudgetData) => Promise<Budget>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
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
  const [sharedLists, setSharedLists] = useState<ShoppingList[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      try {
        const [supabaseItems, supabaseLists, supabaseSharedLists, supabaseBudgets] = await Promise.all([
          getItems(),
          getShoppingListsFromSupabase(),
          getSharedWithMeLists(),
          getBudgets(),
        ]);

        setItems(supabaseItems);
        setShoppingLists(supabaseLists);
        setSharedLists(supabaseSharedLists);
        setBudgets(supabaseBudgets);

        await Promise.all([
          AsyncStorage.setItem('items', JSON.stringify(supabaseItems)),
          AsyncStorage.setItem('shoppingLists', JSON.stringify(supabaseLists)),
          AsyncStorage.setItem('budgets', JSON.stringify(supabaseBudgets)),
        ]);
      } catch (error) {
        console.log('Failed to load from Supabase, using cached data:', error);

        const [cachedItems, cachedLists, cachedBudgets] = await Promise.all([
          AsyncStorage.getItem('items'),
          AsyncStorage.getItem('shoppingLists'),
          AsyncStorage.getItem('budgets'),
        ]);

        if (cachedItems) {
          setItems(JSON.parse(cachedItems).map((item: any) => ({
            ...item,
            created_at: new Date(item.created_at).toISOString(),
            updated_at: new Date(item.updated_at).toISOString(),
          })));
        }

        if (cachedLists) {
          setShoppingLists(JSON.parse(cachedLists).map((list: any) => ({
            ...list,
            created_at: new Date(list.created_at).toISOString(),
            updated_at: new Date(list.updated_at).toISOString(),
          })));
        }

        if (cachedBudgets) {
          setBudgets(JSON.parse(cachedBudgets));
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
      const newItem = await createItem(itemData);
      const newItems = [newItem, ...items];
      setItems(newItems);
      await saveItems(newItems);
      return newItem;
    } catch (error) {
      console.error('Error adding item:', error);

      const fallbackItem: Item = {
        id: Date.now().toString(),
        user_id: 'local',
        ...itemData,
        image_url: itemData.imageUri,
        description: itemData.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newItems = [fallbackItem, ...items];
      setItems(newItems);
      await saveItems(newItems);

      return fallbackItem;
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>): Promise<void> => {
    try {
      await updateItemInSupabase(id, updates);
    } catch (error) {
      console.error('Error updating item in Supabase:', error);
    }

    const newItems = items.map(item =>
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    );
    setItems(newItems);
    await saveItems(newItems);
  };

  const deleteItem = async (id: string): Promise<void> => {
    try {
      await deleteItemInSupabase(id);
    } catch (error) {
      console.error('Error deleting item:', error);
    }

    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    await saveItems(newItems);
  };

  const createShoppingList = async (listData: CreateShoppingListData): Promise<ShoppingList> => {
    try {
      const newList = await createShoppingListInSupabase(listData.name);

      // Add all selected items to the list
      if (listData.itemIds && listData.itemIds.length > 0) {
        await Promise.all(
          listData.itemIds.map(itemId => addItemToShoppingListInSupabase(newList.id, itemId))
        );
      }

      // Fetch the list with items populated
      const listWithItems = await getShoppingListWithItems(newList.id);
      const fullList = listWithItems ?? newList;
      const newLists = [fullList, ...shoppingLists];
      setShoppingLists(newLists);
      await saveShoppingLists(newLists);
      return fullList;
    } catch (error) {
      console.error('Error creating shopping list:', error);

      const fallbackList: ShoppingList = {
        id: Date.now().toString(),
        name: listData.name,
        user_id: 'local',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newLists = [fallbackList, ...shoppingLists];
      setShoppingLists(newLists);
      await saveShoppingLists(newLists);

      return fallbackList;
    }
  };

  const updateShoppingList = async (id: string, updates: Partial<ShoppingList>): Promise<void> => {
    try {
      await updateShoppingListInSupabase(id, updates);
    } catch (error) {
      console.error('Error updating shopping list:', error);
    }

    const newLists = shoppingLists.map(list =>
      list.id === id ? { ...list, ...updates, updated_at: new Date().toISOString() } : list
    );
    setShoppingLists(newLists);
    await saveShoppingLists(newLists);
  };

  const deleteShoppingList = async (id: string): Promise<void> => {
    try {
      await deleteShoppingListInSupabase(id);
    } catch (error) {
      console.error('Error deleting shopping list:', error);
    }

    const newLists = shoppingLists.filter(list => list.id !== id);
    setShoppingLists(newLists);
    await saveShoppingLists(newLists);
  };

  const addItemToShoppingList = async (listId: string, itemId: string, quantity: number = 1): Promise<void> => {
    try {
      await addItemToShoppingListInSupabase(listId, itemId, quantity);

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
      await removeItemFromShoppingListInSupabase(listId, itemId);

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

  const updateItemQuantity = async (listId: string, itemId: string, quantity: number): Promise<void> => {
    // Optimistic update
    const newLists = shoppingLists.map(list => {
      if (list.id !== listId || !list.items) return list;
      return {
        ...list,
        items: list.items.map(item =>
          item.item_id === itemId ? { ...item, quantity } : item
        ),
      };
    });
    setShoppingLists(newLists);

    try {
      await updateShoppingListItemQuantityInSupabase(listId, itemId, quantity);
    } catch (error) {
      console.error('Error updating item quantity:', error);
      setShoppingLists(shoppingLists);
    }
  };

  const refreshShoppingList = async (listId: string): Promise<void> => {
    try {
      const updatedList = await getShoppingListWithItems(listId);
      if (updatedList) {
        setShoppingLists(prev =>
          prev.map(list => list.id === listId ? updatedList : list)
        );
      }
    } catch (error) {
      console.error('Error refreshing shopping list:', error);
    }
  };

  const toggleItemChecked = async (listId: string, itemId: string, checked: boolean): Promise<void> => {
    // Optimistic update
    const newLists = shoppingLists.map(list => {
      if (list.id !== listId || !list.items) return list;
      return {
        ...list,
        items: list.items.map(item =>
          item.item_id === itemId ? { ...item, checked } : item
        ),
      };
    });
    setShoppingLists(newLists);

    try {
      await toggleCheckedInSupabase(listId, itemId, checked);
    } catch (error) {
      console.error('Error toggling item checked:', error);
      // Revert on failure
      setShoppingLists(shoppingLists);
    }
  };

  const getShoppingListTotal = (listId: string): number => {
    const list = [...shoppingLists, ...sharedLists].find(l => l.id === listId);
    if (!list || !list.items) return 0;
    return list.items.reduce((total, item) => total + (item.item.price * (item.quantity || 1)), 0);
  };

  const getShoppingListItemCount = (listId: string): number => {
    const list = [...shoppingLists, ...sharedLists].find(l => l.id === listId);
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

  // Budget actions
  const createBudget = async (budgetData: CreateBudgetData): Promise<Budget> => {
    const newBudget = await createBudgetInSupabase(budgetData);
    const newBudgets = [newBudget, ...budgets];
    setBudgets(newBudgets);
    await AsyncStorage.setItem('budgets', JSON.stringify(newBudgets));
    return newBudget;
  };

  const updateBudget = async (id: string, updates: Partial<Budget>): Promise<void> => {
    await updateBudgetInSupabase(id, updates);
    const newBudgets = budgets.map(b =>
      b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b
    );
    setBudgets(newBudgets);
    await AsyncStorage.setItem('budgets', JSON.stringify(newBudgets));
  };

  const deleteBudget = async (id: string): Promise<void> => {
    await deleteBudgetInSupabase(id);
    const newBudgets = budgets.filter(b => b.id !== id);
    setBudgets(newBudgets);
    await AsyncStorage.setItem('budgets', JSON.stringify(newBudgets));
  };

  const value: DataContextType = {
    items,
    shoppingLists,
    sharedLists,
    budgets,
    addItem,
    updateItem,
    deleteItem,
    createShoppingList,
    updateShoppingList,
    deleteShoppingList,
    addItemToShoppingList,
    removeItemFromShoppingList,
    updateItemQuantity,
    toggleItemChecked,
    refreshShoppingList,
    getShoppingListTotal,
    getShoppingListItemCount,
    refreshItems,
    createBudget,
    updateBudget,
    deleteBudget,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
