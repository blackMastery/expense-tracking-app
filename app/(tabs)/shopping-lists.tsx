import CreateShoppingListModal from '@/components/CreateShoppingListModal';
import ShoppingListCard from '@/components/ShoppingListCard';
import { Colors } from '@/constants/Colors';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ShoppingList } from '@/types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ShoppingListsScreen() {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const { shoppingLists, sharedLists } = useData();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleShoppingListPress = (shoppingList: ShoppingList) => {
    router.push(`/shopping-list/${shoppingList.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Shopping Lists</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.tint }]}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <Text style={styles.createButtonText}>+ Create List</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* My Lists */}
        {shoppingLists.length === 0 && sharedLists.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No Shopping Lists Yet
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.tabIconDefault }]}>
              Create your first shopping list by selecting items from your library.
            </Text>
            <TouchableOpacity
              style={[styles.emptyStateButton, { backgroundColor: colors.tint }]}
              onPress={() => setIsCreateModalVisible(true)}
            >
              <Text style={styles.emptyStateButtonText}>Create Your First List</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {shoppingLists.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>My Lists</Text>
                {shoppingLists.map(item => (
                  <ShoppingListCard
                    key={item.id}
                    shoppingList={item}
                    onPress={() => handleShoppingListPress(item)}
                  />
                ))}
              </View>
            )}

            {sharedLists.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Shared with Me
                </Text>
                {sharedLists.map(item => (
                  <View key={item.id}>
                    <View style={[styles.sharedBadge, { backgroundColor: colors.tint + '20' }]}>
                      <Text style={[styles.sharedBadgeText, { color: colors.tint }]}>
                        Shared list
                      </Text>
                    </View>
                    <ShoppingListCard
                      shoppingList={item}
                      onPress={() => handleShoppingListPress(item)}
                    />
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Create Shopping List Modal */}
      <CreateShoppingListModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
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
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  sharedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 4,
  },
  sharedBadgeText: { fontSize: 12, fontWeight: '600' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
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
