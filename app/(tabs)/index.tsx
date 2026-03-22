import AddItemModal from '@/components/AddItemModal';
import EditItemModal from '@/components/EditItemModal';
import PriceHistoryModal from '@/components/PriceHistoryModal';
import { formatCurrency } from '@/lib/currency';
import { Colors } from '@/constants/Colors';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Item } from '@/types';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ItemsScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [historyItem, setHistoryItem] = useState<Item | null>(null);
  const { items, deleteItem } = useData();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const categories = useMemo(() => {
    const cats = items
      .map(item => item.description)
      .filter((c): c is string => !!c && c.trim().length > 0);
    return Array.from(new Set(cats));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !selectedCategory || item.description === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

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
      backgroundColor: colors.background,
      borderColor: colors.border,
    }]}>
      <View style={styles.itemImageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.border }]}>
            <Text style={[styles.itemImagePlaceholderText, { color: colors.text }]}>
              📷
            </Text>
          </View>
        )}
      </View>

      <View style={styles.itemInfo}>
        <View style={styles.itemNameRow}>
          <Text style={[styles.itemName, { color: colors.text }]}>
            {item.name}
          </Text>
          {item.is_recurring && (
            <View style={[styles.recurringBadge, { backgroundColor: colors.tint }]}>
              <Text style={styles.recurringBadgeText}>
                {item.recurrence_period === 'weekly' ? '↻ Weekly' :
                  item.recurrence_period === 'yearly' ? '↻ Yearly' : '↻ Monthly'}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.itemPrice, { color: colors.tint }]}>
          {formatCurrency(item.price)}
        </Text>
        {item.description && (
          <Text style={[styles.itemCategory, { color: colors.tabIconDefault }]}>
            {item.description}
          </Text>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.historyButton, { backgroundColor: colors.border }]}
          onPress={() => setHistoryItem(item)}
        >
          <Text style={[styles.historyButtonText, { color: colors.text }]}>$</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.tint }]}
          onPress={() => setEditItem(item)}
        >
          <Text style={styles.editButtonText}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: '#ff4444' }]}
          onPress={() => handleDeleteItem(item)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Item Library
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, {
            backgroundColor: colors.border,
            color: colors.text,
          }]}
          placeholder="Search items..."
          placeholderTextColor={colors.tabIconDefault}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Category Filter Chips */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContainer}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              !selectedCategory
                ? { backgroundColor: colors.tint }
                : { backgroundColor: colors.border },
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[
              styles.chipText,
              { color: !selectedCategory ? 'white' : colors.text },
            ]}>
              All
            </Text>
          </TouchableOpacity>

          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                selectedCategory === cat
                  ? { backgroundColor: colors.tint }
                  : { backgroundColor: colors.border },
              ]}
              onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            >
              <Text style={[
                styles.chipText,
                { color: selectedCategory === cat ? 'white' : colors.text },
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            No Items Yet
          </Text>
          <Text style={[styles.emptyStateText, { color: colors.tabIconDefault }]}>
            Start building your item library by adding items with photos, prices, and categories.
          </Text>
          <TouchableOpacity
            style={[styles.emptyStateButton, { backgroundColor: colors.tint }]}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Text style={styles.emptyStateButtonText}>Add Your First Item</Text>
          </TouchableOpacity>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            No Results
          </Text>
          <Text style={[styles.emptyStateText, { color: colors.tabIconDefault }]}>
            No items match your search.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
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

      <EditItemModal
        visible={editItem !== null}
        item={editItem}
        onClose={() => setEditItem(null)}
      />

      <PriceHistoryModal
        visible={historyItem !== null}
        item={historyItem}
        onClose={() => setHistoryItem(null)}
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
    borderBottomWidth: 1,
    paddingTop: 60,
  },
  title: { fontSize: 28, fontWeight: 'bold' },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchInput: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  chipsScroll: { maxHeight: 50 },
  chipsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
  itemsList: { flex: 1 },
  itemsListContent: { padding: 20 },
  itemCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 15,
    alignItems: 'center',
  },
  itemImageContainer: { marginRight: 15 },
  itemImage: { width: 60, height: 60, borderRadius: 8 },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImagePlaceholderText: { fontSize: 24 },
  itemInfo: { flex: 1 },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  itemName: { fontSize: 16, fontWeight: '600' },
  recurringBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recurringBadgeText: { color: 'white', fontSize: 10, fontWeight: '600' },
  itemPrice: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  itemCategory: { fontSize: 12 },
  cardActions: { flexDirection: 'column', gap: 6, alignItems: 'center' },
  historyButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButtonText: { fontSize: 14, fontWeight: 'bold' },
  editButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
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
  emptyStateButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
