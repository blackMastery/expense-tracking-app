import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { items, shoppingLists } = useData();
  const colorScheme = useColorScheme();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const totalItemsValue = items.reduce((total, item) => total + item.price, 0);
  const totalListsValue = shoppingLists.reduce((total, list) => {
    if (!list.items) return total;
    return total + list.items.reduce((listTotal, listItem) => listTotal + (listItem.item.price * (listItem.quantity || 1)), 0);
  }, 0);

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Profile
        </Text>
      </View>

      {/* User Info */}
      <View style={[styles.userSection, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
        <View style={[styles.avatar, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={[styles.userName, { color: Colors[colorScheme ?? 'light'].text }]}>
          {user?.name || 'User'}
        </Text>
        <Text style={[styles.userEmail, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
          {user?.email || 'user@example.com'}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <Text style={[styles.statsTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Your Stats
        </Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { 
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderColor: Colors[colorScheme ?? 'light'].border
          }]}>
            <Text style={[styles.statNumber, { color: Colors[colorScheme ?? 'light'].tint }]}>
              {items.length}
            </Text>
            <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Items in Library
            </Text>
          </View>

          <View style={[styles.statCard, { 
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderColor: Colors[colorScheme ?? 'light'].border
          }]}>
            <Text style={[styles.statNumber, { color: Colors[colorScheme ?? 'light'].tint }]}>
              {shoppingLists.length}
            </Text>
            <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Shopping Lists
            </Text>
          </View>

          <View style={[styles.statCard, { 
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderColor: Colors[colorScheme ?? 'light'].border
          }]}>
            <Text style={[styles.statNumber, { color: Colors[colorScheme ?? 'light'].tint }]}>
              ${totalItemsValue.toFixed(2)}
            </Text>
            <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Total Items Value
            </Text>
          </View>

          <View style={[styles.statCard, { 
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderColor: Colors[colorScheme ?? 'light'].border
          }]}>
            <Text style={[styles.statNumber, { color: Colors[colorScheme ?? 'light'].tint }]}>
              ${totalListsValue.toFixed(2)}
            </Text>
            <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Total Lists Value
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: '#ff4444' }]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
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
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsSection: {
    padding: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
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
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsSection: {
    padding: 20,
    marginTop: 'auto',
  },
  signOutButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
