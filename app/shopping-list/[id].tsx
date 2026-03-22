import ShareListModal from '@/components/ShareListModal';
import { Colors } from '@/constants/Colors';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ShoppingListItemWithItem } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function ShoppingListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { shoppingLists, sharedLists, deleteShoppingList, removeItemFromShoppingList, toggleItemChecked } = useData();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [shoppingMode, setShoppingMode] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

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
                ${item.item.price.toFixed(2)}
              </Text>
              {item.item.description && (
                <Text style={[styles.itemCategory, { color: colors.tabIconDefault }]}>
                  {item.item.description}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.itemActions}>
            <View style={[styles.quantityBadge, { backgroundColor: colors.tint }]}>
              <Text style={styles.quantityText}>Qty: {item.quantity || 1}</Text>
            </View>

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
            Total: ${(item.item.price * (item.quantity || 1)).toFixed(2)}
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

        <View style={styles.headerActions}>
          {!shoppingList.is_shared && (
            <TouchableOpacity onPress={() => setIsShareModalVisible(true)} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: colors.tint }]}>Share</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleExportCSV} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: colors.tint }]}>Export</Text>
          </TouchableOpacity>
          {!shoppingList.is_shared && (
            <TouchableOpacity onPress={handleDeleteList} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: '#ff4444' }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Summary + Shopping Mode Toggle */}
      <View style={[styles.summary, { borderBottomColor: colors.border }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Total Items:</Text>
          <Text style={[styles.summaryValue, { color: colors.tint }]}>{itemCount}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Total Cost:</Text>
          <Text style={[styles.summaryValue, { color: colors.tint }]}>${totalCost.toFixed(2)}</Text>
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

      <ShareListModal
        visible={isShareModalVisible}
        listId={shoppingList.id}
        onClose={() => setIsShareModalVisible(false)}
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
});
