import { Colors } from '@/constants/Colors';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Budget } from '@/types';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface SetBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  editBudget?: Budget;
}

const PERIOD_OPTIONS = ['weekly', 'monthly', 'yearly'] as const;

export default function SetBudgetModal({ visible, onClose, editBudget }: SetBudgetModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { createBudget, updateBudget } = useData();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (editBudget) {
      setName(editBudget.name);
      setAmount(editBudget.amount.toString());
      setPeriod(editBudget.period);
      setCategory(editBudget.category || '');
    } else {
      setName('');
      setAmount('');
      setPeriod('monthly');
      setCategory('');
    }
  }, [editBudget, visible]);

  const handleSubmit = async () => {
    if (!name.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in name and amount');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      if (editBudget) {
        await updateBudget(editBudget.id, {
          name: name.trim(),
          amount: amountValue,
          period,
          category: category.trim() || undefined,
        });
      } else {
        await createBudget({
          name: name.trim(),
          amount: amountValue,
          period,
          category: category.trim() || undefined,
        });
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save budget');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {editBudget ? 'Edit Budget' : 'New Budget'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelText, { color: colors.tint }]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
            placeholder="Budget Name (e.g. Groceries)"
            placeholderTextColor={colors.tabIconDefault}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
            placeholder="Amount Limit"
            placeholderTextColor={colors.tabIconDefault}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
            placeholder="Category (optional)"
            placeholderTextColor={colors.tabIconDefault}
            value={category}
            onChangeText={setCategory}
          />

          <Text style={[styles.sectionLabel, { color: colors.text }]}>Period</Text>
          <View style={styles.periodRow}>
            {PERIOD_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.periodOption,
                  period === opt ? { backgroundColor: colors.tint } : { backgroundColor: colors.border },
                ]}
                onPress={() => setPeriod(opt)}
              >
                <Text style={[
                  styles.periodText,
                  { color: period === opt ? 'white' : colors.text },
                ]}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.tint }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Saving...' : editBudget ? 'Update Budget' : 'Create Budget'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  content: { padding: 20 },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  sectionLabel: { fontSize: 15, fontWeight: '500', marginBottom: 10 },
  periodRow: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  periodOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodText: { fontSize: 14, fontWeight: '600' },
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
