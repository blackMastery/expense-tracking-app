import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ShoppingList } from '@/types';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ShoppingListCardProps {
  shoppingList: ShoppingList;
  onPress: () => void;
}

export default function ShoppingListCard({ shoppingList, onPress }: ShoppingListCardProps) {
  const colorScheme = useColorScheme();
  
  const totalCost = shoppingList.items ? shoppingList.items.reduce((total, item) => total + (item.item.price * (item.quantity || 1)), 0) : 0;
  const itemCount = shoppingList.items ? shoppingList.items.length : 0;

  return (
    <TouchableOpacity
      style={[styles.card, { 
        backgroundColor: Colors[colorScheme ?? 'light'].background,
        borderColor: Colors[colorScheme ?? 'light'].border
      }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.listName, { color: Colors[colorScheme ?? 'light'].text }]}>
          {shoppingList.name}
        </Text>
        <View style={[styles.badge, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
          <Text style={styles.badgeText}>{itemCount}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={[styles.totalCost, { color: Colors[colorScheme ?? 'light'].tint }]}>
          ${totalCost.toFixed(2)}
        </Text>
        <Text style={[styles.itemCount, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.date, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
          Created {new Date(shoppingList.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  listName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  details: {
    marginBottom: 15,
  },
  totalCost: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemCount: {
    fontSize: 14,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  date: {
    fontSize: 12,
  },
});
