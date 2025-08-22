import AddItemModal from '@/components/AddItemModal';
import { Colors } from '@/constants/Colors';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Item } from '@/types';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ItemsScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const { items, deleteItem } = useData();
  const colorScheme = useColorScheme();

  const handleDeleteItem = (item: Item) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(item.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={[styles.itemCard, { 
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      borderColor: Colors[colorScheme ?? 'light'].border
    }]}>
      <View style={styles.itemImageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImagePlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].border }]}>
            <Text style={[styles.itemImagePlaceholderText, { color: Colors[colorScheme ?? 'light'].text }]}>
              📷
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: Colors[colorScheme ?? 'light'].text }]}>
          {item.name}
        </Text>
        <Text style={[styles.itemPrice, { color: Colors[colorScheme ?? 'light'].tint }]}>
          ${item.price.toFixed(2)}
        </Text>
        {item.description && (
          <Text style={[styles.itemCategory, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            {item.description}
          </Text>
        )}
      </View>
      
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: '#ff4444' }]}
        onPress={() => handleDeleteItem(item)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Item Library
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Items List */}
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            No Items Yet
          </Text>
          <Text style={[styles.emptyStateText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            Start building your item library by adding items with photos, prices, and categories.
          </Text>
          <TouchableOpacity
            style={[styles.emptyStateButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Text style={styles.emptyStateButtonText}>Add Your First Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.itemsList}
          contentContainerStyle={styles.itemsListContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Item Modal */}
      <AddItemModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
      />
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
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    padding: 20,
  },
  itemCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 15,
    alignItems: 'center',
  },
  itemImageContainer: {
    marginRight: 15,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImagePlaceholderText: {
    fontSize: 24,
  },
  itemInfo: {
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
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
    lineHeight: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
