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
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ShoppingListsScreen() {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const { shoppingLists } = useData();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleShoppingListPress = (shoppingList: ShoppingList) => {
    router.push(`/shopping-list/${shoppingList.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Shopping Lists
        </Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <Text style={styles.createButtonText}>+ Create List</Text>
        </TouchableOpacity>
      </View>

      {/* Shopping Lists */}
      {shoppingLists.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            No Shopping Lists Yet
          </Text>
          <Text style={[styles.emptyStateText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
            Create your first shopping list by selecting items from your library.
          </Text>
          <TouchableOpacity
            style={[styles.emptyStateButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => setIsCreateModalVisible(true)}
          >
            <Text style={styles.emptyStateButtonText}>Create Your First List</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={shoppingLists}
          renderItem={({ item }) => (
            <ShoppingListCard
              shoppingList={item}
              onPress={() => handleShoppingListPress(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          style={styles.listsList}
          contentContainerStyle={styles.listsListContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create Shopping List Modal */}
      <CreateShoppingListModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
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
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listsList: {
    flex: 1,
  },
  listsListContent: {
    padding: 20,
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
