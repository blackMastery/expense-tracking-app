import { formatCurrency } from '@/lib/currency';
import { Colors } from '@/constants/Colors';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Budget } from '@/types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

export default function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const { items } = useData();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Calculate how much of this budget is used based on recurring items in the matching category
  const spent = items
    .filter(item => {
      if (!item.is_recurring) return false;
      if (budget.category && item.description !== budget.category) return false;
      return true;
    })
    .reduce((total, item) => {
      if (item.recurrence_period === 'weekly') {
        if (budget.period === 'monthly') return total + item.price * 4.33;
        if (budget.period === 'yearly') return total + item.price * 52;
        return total + item.price;
      }
      if (item.recurrence_period === 'yearly') {
        if (budget.period === 'monthly') return total + item.price / 12;
        if (budget.period === 'weekly') return total + item.price / 52;
        return total + item.price;
      }
      // monthly
      if (budget.period === 'weekly') return total + item.price / 4.33;
      if (budget.period === 'yearly') return total + item.price * 12;
      return total + item.price;
    }, 0);

  const progress = Math.min(spent / budget.amount, 1);
  const isOverBudget = spent > budget.amount;
  const progressColor = isOverBudget ? '#ff4444' : progress > 0.8 ? '#FF9800' : '#4CAF50';

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: isOverBudget ? '#ff4444' : colors.border }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: colors.text }]}>{budget.name}</Text>
          {budget.category && (
            <View style={[styles.categoryBadge, { backgroundColor: colors.border }]}>
              <Text style={[styles.categoryText, { color: colors.text }]}>{budget.category}</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(budget)} style={styles.actionBtn}>
            <Text style={[styles.actionText, { color: colors.tint }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(budget)} style={styles.actionBtn}>
            <Text style={[styles.actionText, { color: '#ff4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={[styles.spent, { color: isOverBudget ? '#ff4444' : colors.text }]}>
          {formatCurrency(spent)}
        </Text>
        <Text style={[styles.limit, { color: colors.tabIconDefault }]}>
          / {formatCurrency(budget.amount)} {budget.period}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: progressColor }]} />
      </View>

      <Text style={[styles.statusText, { color: isOverBudget ? '#ff4444' : colors.tabIconDefault }]}>
        {isOverBudget
          ? `Over budget by ${formatCurrency(spent - budget.amount)}`
          : `${formatCurrency(budget.amount - spent)} remaining`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 17, fontWeight: '600' },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: { fontSize: 11, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 4 },
  actionText: { fontSize: 14, fontWeight: '600' },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
  spent: { fontSize: 22, fontWeight: 'bold' },
  limit: { fontSize: 14, marginLeft: 4 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  statusText: { fontSize: 13 },
});
