import AddItemModal from '@/components/AddItemModal';
import AddItemsToListModal from '@/components/AddItemsToListModal';
import ShareListModal from '@/components/ShareListModal';
import { formatCurrency } from '@/lib/currency';
import { Colors } from '@/constants/Colors';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ShoppingListItemWithItem } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function ShoppingListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { shoppingLists, sharedLists, deleteShoppingList, addItemToShoppingList, removeItemFromShoppingList, updateItemQuantity, toggleItemChecked, refreshShoppingList } = useData();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [shoppingMode, setShoppingMode] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isAddItemsModalVisible, setIsAddItemsModalVisible] = useState(false);
  const [isNewItemModalVisible, setIsNewItemModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      refreshShoppingList(id);
    }
  }, [id]);

  const shoppingList = [...shoppingLists, ...sharedLists].find(list => list.id === id);

  if (!shoppingList) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Shopping list not found
        </Text>
      </View>
    );
  }

  const totalCost = shoppingList.items
    ? shoppingList.items.reduce((total, item) => total + (item.item.price * (item.quantity || 1)), 0)
    : 0;
  const itemCount = shoppingList.items ? shoppingList.items.length : 0;
  const checkedCount = shoppingList.items ? shoppingList.items.filter(i => i.checked).length : 0;

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

  const handleToggleChecked = async (item: ShoppingListItemWithItem) => {
    await toggleItemChecked(shoppingList.id, item.item_id, !item.checked);
  };

  const handleExportCSV = async () => {
    if (!shoppingList.items || shoppingList.items.length === 0) {
      Alert.alert('Empty List', 'Nothing to export');
      return;
    }

    const header = 'Item,Price,Quantity,Total,Checked\n';
    const rows = shoppingList.items.map(item =>
      `"${item.item.name}",${item.item.price.toFixed(2)},${item.quantity || 1},${(item.item.price * (item.quantity || 1)).toFixed(2)},${item.checked ? 'Yes' : 'No'}`
    ).join('\n');
    const csv = header + rows + `\n\nTotal Cost,$${totalCost.toFixed(2)}`;

    const fileUri = `${FileSystem.cacheDirectory}${shoppingList.name.replace(/[^a-z0-9]/gi, '_')}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(fileUri, { mimeType: 'text/csv' });
  };

  const renderItem = ({ item }: { item: ShoppingListItemWithItem }) => {
    const isChecked = item.checked;

    return (
      <TouchableOpacity
        style={[
          styles.itemCard,
          {
            backgroundColor: isChecked && shoppingMode ? (colorScheme === 'dark' ? '#1a2a1a' : '#f0fff0') : colors.background,
            borderColor: isChecked && shoppingMode ? '#4CAF50' : colors.border,
          },
        ]}
        onPress={shoppingMode ? () => handleToggleChecked(item) : undefined}
        activeOpacity={shoppingMode ? 0.6 : 1}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            {shoppingMode && (
              <View style={[
                styles.checkbox,
                isChecked ? { backgroundColor: '#4CAF50', borderColor: '#4CAF50' } : { borderColor: colors.border },
              ]}>
                {isChecked && <Text style={styles.checkmark}>✓</Text>}
              </View>
            )}

            {item.item.image_url ? (
              <Image source={{ uri: item.item.image_url }} style={[styles.itemImage, isChecked && shoppingMode && styles.checkedImage]} />
            ) : (
              <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.border }]}>
                <Text style={[styles.itemImagePlaceholderText, { color: colors.text }]}>
                  📷
                </Text>
              </View>
            )}

            <View style={styles.itemDetails}>
              <Text style={[
                styles.itemName,
                { color: colors.text },
                isChecked && shoppingMode && styles.checkedText,
              ]}>
                {item.item.name}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.tint }]}>
                {formatCurrency(item.item.price)}
              </Text>
              {item.item.description && (
                <Text style={[styles.itemCategory, { color: colors.tabIconDefault }]}>
                  {item.item.description}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.itemActions}>
            {!shoppingMode && (
              <View style={[styles.quantityStepper, { borderColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.stepperButton, { backgroundColor: colors.border }]}
                  onPress={() => {
                    const newQty = (item.quantity || 1) - 1;
                    if (newQty < 1) {
                      handleRemoveItem(item.item_id, item.item.name);
                    } else {
                      updateItemQuantity(shoppingList.id, item.item_id, newQty);
                    }
                  }}
                >
                  <Text style={[styles.stepperButtonText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.stepperCount, { color: colors.text }]}>{item.quantity || 1}</Text>
                <TouchableOpacity
                  style={[styles.stepperButton, { backgroundColor: colors.tint }]}
                  onPress={() => updateItemQuantity(shoppingList.id, item.item_id, (item.quantity || 1) + 1)}
                >
                  <Text style={styles.stepperButtonTextLight}>+</Text>
                </TouchableOpacity>
              </View>
            )}

            {shoppingMode && (
              <View style={[styles.quantityBadge, { backgroundColor: colors.tint }]}>
                <Text style={styles.quantityText}>Qty: {item.quantity || 1}</Text>
              </View>
            )}

            {!shoppingMode && (
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: '#ff4444' }]}
                onPress={() => handleRemoveItem(item.item_id, item.item.name)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[styles.itemTotal, { borderTopColor: colors.border }]}>
          <Text style={[styles.itemTotalText, { color: colors.text }]}>
            {`Total: ${formatCurrency(item.item.price * (item.quantity || 1))}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.tint }]}>← Back</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {shoppingList.name}
        </Text>

        <TouchableOpacity onPress={() => setIsMenuVisible(true)} style={styles.menuButton}>
          <Text style={[styles.menuButtonText, { color: colors.text }]}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Summary + Shopping Mode Toggle */}
      <View style={[styles.summary, { borderBottomColor: colors.border }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Total Items:</Text>
          <Text style={[styles.summaryValue, { color: colors.tint }]}>{itemCount}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Total Cost:</Text>
          <Text style={[styles.summaryValue, { color: colors.tint }]}>{formatCurrency(totalCost)}</Text>
        </View>

        {itemCount > 0 && (
          <TouchableOpacity
            style={[
              styles.shoppingModeButton,
              { backgroundColor: shoppingMode ? '#4CAF50' : colors.tint },
            ]}
            onPress={() => setShoppingMode(prev => !prev)}
          >
            <Text style={styles.shoppingModeButtonText}>
              {shoppingMode
                ? `Shopping Mode ON — ${checkedCount}/${itemCount} checked`
                : '🛒 Start Shopping'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Items List */}
      {itemCount === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: colors.tabIconDefault }]}>
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

      {/* Dropdown Menu */}
      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={[styles.menuDropdown, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setIsMenuVisible(false); setIsAddItemsModalVisible(true); }}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>+ Add Items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setIsMenuVisible(false); setIsNewItemModalVisible(true); }}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>+ New Item</Text>
            </TouchableOpacity>

            {!shoppingList.is_shared && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setIsMenuVisible(false); setIsShareModalVisible(true); }}
              >
                <Text style={[styles.menuItemText, { color: colors.text }]}>Share</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setIsMenuVisible(false); handleExportCSV(); }}
            >
              <Text style={[styles.menuItemText, { color: colors.text }]}>Export CSV</Text>
            </TouchableOpacity>

            {!shoppingList.is_shared && (
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemLast]}
                onPress={() => { setIsMenuVisible(false); handleDeleteList(); }}
              >
                <Text style={[styles.menuItemText, { color: '#ff4444' }]}>Delete List</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <ShareListModal
        visible={isShareModalVisible}
        listId={shoppingList.id}
        onClose={() => setIsShareModalVisible(false)}
      />

      <AddItemsToListModal
        visible={isAddItemsModalVisible}
        listId={shoppingList.id}
        existingItemIds={shoppingList.items ? shoppingList.items.map(i => i.item_id) : []}
        onClose={() => setIsAddItemsModalVisible(false)}
      />

      <AddItemModal
        visible={isNewItemModalVisible}
        onClose={() => setIsNewItemModalVisible(false)}
        onItemCreated={(item) => addItemToShoppingList(shoppingList.id, item.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  backButton: { padding: 5, minWidth: 60 },
  backButtonText: { fontSize: 16 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerButton: { padding: 5 },
  headerButtonText: { fontSize: 14, fontWeight: '600' },
  summary: {
    padding: 20,
    borderBottomWidth: 1,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 16, fontWeight: '500' },
  summaryValue: { fontSize: 18, fontWeight: 'bold' },
  shoppingModeButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  shoppingModeButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  itemsList: { flex: 1 },
  itemsListContent: { padding: 20 },
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  checkedImage: { opacity: 0.4 },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImagePlaceholderText: { fontSize: 24 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  checkedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  itemPrice: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  itemCategory: { fontSize: 12 },
  itemActions: { alignItems: 'flex-end' },
  quantityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  quantityText: { color: 'white', fontSize: 12, fontWeight: '600' },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: { color: 'white', fontSize: 12, fontWeight: '600' },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  stepperButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonText: { fontSize: 18, fontWeight: '600' },
  stepperButtonTextLight: { fontSize: 18, fontWeight: '600', color: 'white' },
  stepperCount: { width: 30, textAlign: 'center', fontSize: 15, fontWeight: '600' },
  itemTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  itemTotalText: { fontSize: 14, fontWeight: '600' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: { fontSize: 16, textAlign: 'center', opacity: 0.7 },
  errorText: { fontSize: 16, textAlign: 'center', marginTop: 100 },
  menuButton: { padding: 8, minWidth: 40, alignItems: 'flex-end' },
  menuButtonText: { fontSize: 22, fontWeight: '600', lineHeight: 24 },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuDropdown: {
    marginTop: 90,
    marginRight: 16,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuItemText: { fontSize: 15, fontWeight: '500' },
});
