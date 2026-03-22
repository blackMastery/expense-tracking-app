import BudgetCard from '@/components/BudgetCard';
import SetBudgetModal from '@/components/SetBudgetModal';
import { Colors } from '@/constants/Colors';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Budget } from '@/types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function BudgetScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | undefined>(undefined);
  const { budgets, deleteBudget } = useData();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleEdit = (budget: Budget) => {
    setEditBudget(budget);
    setIsModalVisible(true);
  };

  const handleDelete = (budget: Budget) => {
    Alert.alert(
      'Delete Budget',
      `Delete "${budget.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget(budget.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  const handleAdd = () => {
    setEditBudget(undefined);
    setIsModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.tint }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Budget Manager</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={handleAdd}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {budgets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💰</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Budgets Yet</Text>
          <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
            Set spending limits to track your recurring expenses against your budget.
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: colors.tint }]}
            onPress={handleAdd}
          >
            <Text style={styles.emptyButtonText}>Create First Budget</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={b => b.id}
          renderItem={({ item }) => (
            <BudgetCard budget={item} onEdit={handleEdit} onDelete={handleDelete} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <SetBudgetModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditBudget(undefined);
        }}
        editBudget={editBudget}
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
  backButton: { minWidth: 60 },
  backText: { fontSize: 16 },
  title: { fontSize: 22, fontWeight: 'bold' },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  list: { padding: 20 },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 30, opacity: 0.7 },
  emptyButton: { paddingHorizontal: 30, paddingVertical: 14, borderRadius: 8 },
  emptyButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
