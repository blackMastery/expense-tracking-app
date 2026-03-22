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
  TouchableOpacity,
  View,
} from 'react-native';

interface AddItemsToListModalProps {
  visible: boolean;
  listId: string;
  existingItemIds: string[];
  onClose: () => void;
}

export default function AddItemsToListModal({
  visible,
  listId,
  existingItemIds,
  onClose,
}: AddItemsToListModalProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const { items, addItemToShoppingList } = useData();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const availableItems = items.filter(item => !existingItemIds.includes(item.id));

  const toggleItem = (itemId: string) => {
    const next = new Set(selectedItems);
    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }
    setSelectedItems(next);
  };

  const handleAdd = async () => {
    if (selectedItems.size === 0) return;

    setIsLoading(true);
    try {
      await Promise.all(
        Array.from(selectedItems).map(itemId => addItemToShoppingList(listId, itemId))
      );
      setSelectedItems(new Set());
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add items to list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedItems(new Set());
    onClose();
  };

  const renderItem = ({ item }: { item: Item }) => {
    const isSelected = selectedItems.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.itemRow,
          { borderColor: colors.border },
          isSelected && { backgroundColor: colors.tint + '20' },
        ]}
        onPress={() => toggleItem(item.id)}
      >
        <View style={styles.itemInfo}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.border }]}>
              <Text style={styles.itemImagePlaceholderText}>📷</Text>
            </View>
          )}
          <View style={styles.itemDetails}>
            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.itemPrice, { color: colors.tint }]}>
              {formatCurrency(item.price)}
            </Text>
            {item.description && (
              <Text style={[styles.itemCategory, { color: colors.tabIconDefault }]}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
        <Switch
          value={isSelected}
          onValueChange={() => toggleItem(item.id)}
          trackColor={{ false: colors.border, true: colors.tint }}
          thumbColor={isSelected ? 'white' : colors.tabIconDefault}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Add Items</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={[styles.cancelText, { color: colors.tint }]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {availableItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.tabIconDefault }]}>
                {items.length === 0
                  ? 'No items in your library yet. Add some items first!'
                  : 'All items are already in this list.'}
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Select Items ({selectedItems.size} selected)
              </Text>
              <FlatList
                data={availableItems}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: selectedItems.size > 0 ? colors.tint : colors.border,
                opacity: selectedItems.size > 0 ? 1 : 0.5,
              },
            ]}
            onPress={handleAdd}
            disabled={isLoading || selectedItems.size === 0}
          >
            <Text style={styles.addButtonText}>
              {isLoading ? 'Adding...' : `Add ${selectedItems.size > 0 ? selectedItems.size + ' ' : ''}Item${selectedItems.size !== 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: '600' },
  cancelText: { fontSize: 16 },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  itemInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
  itemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImagePlaceholderText: { fontSize: 20 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  itemPrice: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  itemCategory: { fontSize: 12 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyStateText: { fontSize: 16, textAlign: 'center', opacity: 0.7 },
  footer: { padding: 20, borderTopWidth: 1 },
  addButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
