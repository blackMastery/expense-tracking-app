import { Colors } from '@/constants/Colors';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ShoppingListItemWithItem } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ShoppingListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { shoppingLists, deleteShoppingList, removeItemFromShoppingList } = useData();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const shoppingList = shoppingLists.find(list => list.id === id);

  if (!shoppingList) {
    return (
      <View style={styles.container}>
        <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Shopping list not found
        </Text>
      </View>
    );
  }

  const totalCost = shoppingList.items ? shoppingList.items.reduce((total, item) => total + (item.item.price * (item.quantity || 1)), 0) : 0;
  const itemCount = shoppingList.items ? shoppingList.items.length : 0;

  const handleDeleteList = () => {
    Alert.alert(
      'Delete Shopping List',
      `Are you sure you want to delete "${shoppingList.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteShoppingList(shoppingList.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete shopping list');
            }
          },
        },
      ]
    );
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    Alert.alert(
      'Remove Item',
      `Remove "${itemName}" from the list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeItemFromShoppingList(shoppingList.id, itemId);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ShoppingListItemWithItem }) => (
    <View style={[styles.itemCard, { 
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      borderColor: Colors[colorScheme ?? 'light'].border
    }]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          {item.item.image_url ? (
            <Image source={{ uri: item.item.image_url }} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImagePlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].border }]}>
              <Text style={[styles.itemImagePlaceholderText, { color: Colors[colorScheme ?? 'light'].text }]}>
                📷
              </Text>
            </View>
          )}
          
          <View style={styles.itemDetails}>
            <Text style={[styles.itemName, { color: Colors[colorScheme ?? 'light'].text }]}>
              {item.item.name}
            </Text>
            <Text style={[styles.itemPrice, { color: Colors[colorScheme ?? 'light'].tint }]}>
              ${item.item.price.toFixed(2)}
            </Text>
            {item.item.description && (
              <Text style={[styles.itemCategory, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                {item.item.description}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.itemActions}>
          <View style={[styles.quantityBadge, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
            <Text style={styles.quantityText}>Qty: {item.quantity || 1}</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: '#ff4444' }]}
            onPress={() => handleRemoveItem(item.item_id, item.item.name)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.itemTotal}>
        <Text style={[styles.itemTotalText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Total: ${(item.item.price * (item.quantity || 1)).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: Colors[colorScheme ?? 'light'].tint }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          {shoppingList.name}
        </Text>
        
        <TouchableOpacity onPress={handleDeleteList} style={styles.deleteButton}>
          <Text style={[styles.deleteButtonText, { color: '#ff4444' }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={[styles.summary, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
            Total Items:
          </Text>
          <Text style={[styles.summaryValue, { color: Colors[colorScheme ?? 'light'].tint }]}>
            {itemCount}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
            Total Cost:
          </Text>
          <Text style={[styles.summaryValue, { color: Colors[colorScheme ?? 'light'].tint }]}>
            ${totalCost.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Items List */}
      {itemCount === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            No items in this shopping list
          </Text>
        </View>
      ) : (
        <FlatList
          data={shoppingList.items}
          renderItem={renderItem}
          keyExtractor={(item) => item.item_id}
          style={styles.itemsList}
          contentContainerStyle={styles.itemsListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  summary: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    padding: 20,
  },
  itemCard: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 15,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImagePlaceholderText: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  quantityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  quantityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  itemTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});
