import { formatCurrency } from '@/lib/currency';
import { Colors } from '@/constants/Colors';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Item } from '@/types';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CreateShoppingListModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateShoppingListModal({ visible, onClose }: CreateShoppingListModalProps) {
  const [listName, setListName] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  
  const { items, createShoppingList } = useData();
  const colorScheme = useColorScheme();

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleCreateList = async () => {
    if (!listName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    if (selectedItems.size === 0) {
      Alert.alert('Error', 'Please select at least one item');
      return;
    }

    setIsLoading(true);
    try {
      await createShoppingList({
        name: listName.trim(),
        itemIds: Array.from(selectedItems),
      });

      // Reset form
      setListName('');
      setSelectedItems(new Set());
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create shopping list');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setListName('');
    setSelectedItems(new Set());
  };

  const renderItem = ({ item }: { item: Item }) => {
    const isSelected = selectedItems.has(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.itemRow,
          isSelected && { backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' }
        ]}
        onPress={() => toggleItemSelection(item.id)}
      >
        <View style={styles.itemInfo}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImagePlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].border }]}>
              <Text style={[styles.itemImagePlaceholderText, { color: Colors[colorScheme ?? 'light'].text }]}>
                📷
              </Text>
            </View>
          )}
          
          <View style={styles.itemDetails}>
            <Text style={[styles.itemName, { color: Colors[colorScheme ?? 'light'].text }]}>
              {item.name}
            </Text>
            <Text style={[styles.itemPrice, { color: Colors[colorScheme ?? 'light'].tint }]}>
              {formatCurrency(item.price)}
            </Text>
            {item.description && (
              <Text style={[styles.itemCategory, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
        
        <Switch
          value={isSelected}
          onValueChange={() => toggleItemSelection(item.id)}
          trackColor={{ false: Colors[colorScheme ?? 'light'].border, true: Colors[colorScheme ?? 'light'].tint }}
          thumbColor={isSelected ? 'white' : Colors[colorScheme ?? 'light'].tabIconDefault}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Create Shopping List
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: Colors[colorScheme ?? 'light'].tint }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <TextInput
            style={[styles.input, { 
              borderColor: Colors[colorScheme ?? 'light'].border,
              color: Colors[colorScheme ?? 'light'].text,
              backgroundColor: Colors[colorScheme ?? 'light'].background
            }]}
            placeholder="List Name"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={listName}
            onChangeText={setListName}
          />

          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Select Items ({selectedItems.size} selected)
          </Text>

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                No items in your library yet. Add some items first!
              </Text>
            </View>
          ) : (
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={styles.itemsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              { 
                backgroundColor: selectedItems.size > 0 ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].border,
                opacity: selectedItems.size > 0 ? 1 : 0.5
              }
            ]}
            onPress={handleCreateList}
            disabled={isLoading || selectedItems.size === 0}
          >
            <Text style={styles.createButtonText}>
              {isLoading ? 'Creating...' : `Create List (${selectedItems.size} items)`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  itemsList: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  itemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImagePlaceholderText: {
    fontSize: 20,
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  createButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
