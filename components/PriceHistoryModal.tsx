import { formatCurrency } from '@/lib/currency';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getPriceHistory } from '@/lib/supabase-utils';
import { Item, PriceHistory } from '@/types';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';

interface PriceHistoryModalProps {
  visible: boolean;
  item: Item | null;
  onClose: () => void;
}

export default function PriceHistoryModal({ visible, item, onClose }: PriceHistoryModalProps) {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (visible && item) {
      loadHistory();
    }
  }, [visible, item]);

  const loadHistory = async () => {
    if (!item) return;
    setIsLoading(true);
    try {
      const data = await getPriceHistory(item.id);
      setHistory(data);
    } catch (error) {
      console.error('Error loading price history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxPrice = history.length > 0 ? Math.max(...history.map(h => h.price)) : 1;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Price History
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeText, { color: colors.tint }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {item && (
          <View style={[styles.itemInfo, { borderBottomColor: colors.border }]}>
            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.currentPrice, { color: colors.tint }]}>
              {`Current: ${formatCurrency(item.price)}`}
            </Text>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
              No price history yet.{'\n'}History is recorded when prices are updated.
            </Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={h => h.id}
            contentContainerStyle={styles.list}
            renderItem={({ item: h, index }) => {
              const barWidth = (h.price / maxPrice) * 100;
              const prevPrice = history[index + 1]?.price;
              const change = prevPrice ? h.price - prevPrice : 0;

              return (
                <View style={[styles.historyRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.historyLeft}>
                    <Text style={[styles.historyDate, { color: colors.tabIconDefault }]}>
                      {formatDate(h.recorded_at)}
                    </Text>
                    <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                      <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: colors.tint }]} />
                    </View>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={[styles.historyPrice, { color: colors.text }]}>
                      {formatCurrency(h.price)}
                    </Text>
                    {change !== 0 && (
                      <Text style={[styles.priceChange, { color: change > 0 ? '#ff4444' : '#4CAF50' }]}>
                        {`${change > 0 ? '↑' : '↓'} ${formatCurrency(Math.abs(change))}`}
                      </Text>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
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
  closeText: { fontSize: 16 },
  itemInfo: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: { fontSize: 16, fontWeight: '500' },
  currentPrice: { fontSize: 18, fontWeight: 'bold' },
  loader: { marginTop: 60 },
  list: { padding: 20 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 16,
  },
  historyLeft: { flex: 1 },
  historyDate: { fontSize: 13, marginBottom: 6 },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  historyRight: { alignItems: 'flex-end' },
  historyPrice: { fontSize: 17, fontWeight: '600' },
  priceChange: { fontSize: 12, marginTop: 2 },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: { fontSize: 16, textAlign: 'center', lineHeight: 26, opacity: 0.7 },
});
