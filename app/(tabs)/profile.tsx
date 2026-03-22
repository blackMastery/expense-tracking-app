import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { items, shoppingLists } = useData();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleExportItems = async () => {
    if (items.length === 0) {
      Alert.alert('No Items', 'Your library is empty');
      return;
    }
    const header = 'Name,Price,Category,Recurring,Recurrence Period\n';
    const rows = items.map(item =>
      `"${item.name}",${item.price.toFixed(2)},"${item.description || ''}",${item.is_recurring ? 'Yes' : 'No'},"${item.recurrence_period || ''}"`
    ).join('\n');
    const csv = header + rows;
    const fileUri = `${FileSystem.cacheDirectory}item_library.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
    await Sharing.shareAsync(fileUri, { mimeType: 'text/csv' });
  };

  const totalItemsValue = items.reduce((total, item) => total + item.price, 0);
  const totalListsValue = shoppingLists.reduce((total, list) => {
    if (!list.items) return total;
    return total + list.items.reduce((listTotal, listItem) => listTotal + (listItem.item.price * (listItem.quantity || 1)), 0);
  }, 0);

  const monthlyRecurringCost = items
    .filter(item => item.is_recurring)
    .reduce((total, item) => {
      if (item.recurrence_period === 'weekly') return total + item.price * 4.33;
      if (item.recurrence_period === 'yearly') return total + item.price / 12;
      return total + item.price; // monthly
    }, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      </View>

      {/* User Info */}
      <View style={[styles.userSection, { borderBottomColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>
          {user?.name || 'User'}
        </Text>
        <Text style={[styles.userEmail, { color: colors.tabIconDefault }]}>
          {user?.email || 'user@example.com'}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <Text style={[styles.statsTitle, { color: colors.text }]}>Your Stats</Text>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.tint }]}>{items.length}</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Items in Library</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.tint }]}>{shoppingLists.length}</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Shopping Lists</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.tint }]}>${totalItemsValue.toFixed(2)}</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Total Items Value</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.tint }]}>${totalListsValue.toFixed(2)}</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Total Lists Value</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>${monthlyRecurringCost.toFixed(2)}</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Monthly Recurring</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.tint }]}>
              {items.filter(i => i.is_recurring).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Recurring Items</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={[styles.actionsSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.actionsTitle, { color: colors.text }]}>Tools</Text>

        <TouchableOpacity
          style={[styles.actionRow, { borderBottomColor: colors.border }]}
          onPress={() => router.push('/budget')}
        >
          <Text style={[styles.actionIcon]}>💰</Text>
          <Text style={[styles.actionLabel, { color: colors.text }]}>Budget Manager</Text>
          <Text style={[styles.actionChevron, { color: colors.tabIconDefault }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionRow, { borderBottomColor: colors.border }]}
          onPress={() => router.push('/analytics')}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={[styles.actionLabel, { color: colors.text }]}>Analytics</Text>
          <Text style={[styles.actionChevron, { color: colors.tabIconDefault }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionRow, { borderBottomColor: colors.border }]}
          onPress={handleExportItems}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={[styles.actionLabel, { color: colors.text }]}>Export Item Library</Text>
          <Text style={[styles.actionChevron, { color: colors.tabIconDefault }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <View style={styles.signOutSection}>
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: '#ff4444' }]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    paddingTop: 60,
  },
  title: { fontSize: 28, fontWeight: 'bold' },
  userSection: {
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  userName: { fontSize: 24, fontWeight: '600', marginBottom: 5 },
  userEmail: { fontSize: 16, opacity: 0.7 },
  statsSection: { padding: 20 },
  statsTitle: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
    alignItems: 'center',
  },
  statNumber: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  statLabel: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  actionsSection: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  actionsTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  actionIcon: { fontSize: 20, marginRight: 14 },
  actionLabel: { flex: 1, fontSize: 16 },
  actionChevron: { fontSize: 22 },
  signOutSection: { padding: 20, paddingTop: 30, paddingBottom: 50 },
  signOutButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
