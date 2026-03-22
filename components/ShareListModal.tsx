import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getListShares, revokeShare, shareList } from '@/lib/supabase-utils';
import { SharedList } from '@/types';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ShareListModalProps {
  visible: boolean;
  listId: string;
  onClose: () => void;
}

export default function ShareListModal({ visible, listId, onClose }: ShareListModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [shares, setShares] = useState<SharedList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (visible && listId) {
      loadShares();
    }
  }, [visible, listId]);

  const loadShares = async () => {
    try {
      const data = await getListShares(listId);
      setShares(data);
    } catch (error) {
      console.error('Error loading shares:', error);
    }
  };

  const handleShare = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const newShare = await shareList(listId, email.trim(), permission);
      setShares(prev => [newShare, ...prev]);
      setEmail('');
    } catch (error: any) {
      if (error?.code === '23505') {
        Alert.alert('Already Shared', 'This list is already shared with that email');
      } else {
        Alert.alert('Error', 'Failed to share list. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = (share: SharedList) => {
    Alert.alert(
      'Revoke Access',
      `Remove access for ${share.shared_with_email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeShare(share.id);
              setShares(prev => prev.filter(s => s.id !== share.id));
            } catch (error) {
              Alert.alert('Error', 'Failed to revoke access');
            }
          },
        },
      ]
    );
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
          <Text style={[styles.title, { color: colors.text }]}>Share List</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.doneText, { color: colors.tint }]}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Email Input */}
          <Text style={[styles.label, { color: colors.text }]}>Invite by email</Text>
          <TextInput
            style={[styles.input, {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.background,
            }]}
            placeholder="email@example.com"
            placeholderTextColor={colors.tabIconDefault}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Permission Toggle */}
          <View style={styles.permissionRow}>
            {(['view', 'edit'] as const).map(opt => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.permissionOption,
                  permission === opt
                    ? { backgroundColor: colors.tint }
                    : { backgroundColor: colors.border },
                ]}
                onPress={() => setPermission(opt)}
              >
                <Text style={[
                  styles.permissionText,
                  { color: permission === opt ? 'white' : colors.text },
                ]}>
                  {opt === 'view' ? '👁 View only' : '✏️ Can edit'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: colors.tint }]}
            onPress={handleShare}
            disabled={isLoading}
          >
            <Text style={styles.shareButtonText}>
              {isLoading ? 'Sharing...' : 'Share'}
            </Text>
          </TouchableOpacity>

          {/* Current Shares */}
          {shares.length > 0 && (
            <>
              <Text style={[styles.label, { color: colors.text, marginTop: 24 }]}>
                Shared with ({shares.length})
              </Text>
              {shares.map(share => (
                <View key={share.id} style={[styles.shareRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.shareInfo}>
                    <Text style={[styles.shareEmail, { color: colors.text }]}>
                      {share.shared_with_email}
                    </Text>
                    <Text style={[styles.sharePermission, { color: colors.tabIconDefault }]}>
                      {share.permission === 'edit' ? 'Can edit' : 'View only'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRevoke(share)}
                    style={styles.revokeButton}
                  >
                    <Text style={styles.revokeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
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
  doneText: { fontSize: 16 },
  content: { padding: 20 },
  label: { fontSize: 15, fontWeight: '500', marginBottom: 10 },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
  },
  permissionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  permissionOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionText: { fontSize: 14, fontWeight: '600' },
  shareButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  shareInfo: { flex: 1 },
  shareEmail: { fontSize: 15, fontWeight: '500' },
  sharePermission: { fontSize: 13, marginTop: 2 },
  revokeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ff4444',
  },
  revokeText: { color: 'white', fontSize: 13, fontWeight: '600' },
});
