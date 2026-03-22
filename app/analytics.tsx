import { formatCurrency } from '@/lib/currency';
import { Colors } from '@/constants/Colors';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 40;

export default function AnalyticsScreen() {
  const { items, shoppingLists } = useData();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
    labelColor: () => colors.text,
    barPercentage: 0.6,
    decimalPlaces: 2,
  };

  // Top 5 most expensive items
  const top5Items = useMemo(() => {
    return [...items]
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);
  }, [items]);

  const barData = useMemo(() => ({
    labels: top5Items.map(i => i.name.slice(0, 8)),
    datasets: [{ data: top5Items.map(i => i.price) }],
  }), [top5Items]);

  // Spending by category (pie chart)
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach(item => {
      const cat = item.description || 'Uncategorized';
      map[cat] = (map[cat] || 0) + item.price;
    });

    const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    return Object.entries(map).slice(0, 6).map(([name, value], i) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      color: COLORS[i % COLORS.length],
      legendFontColor: colors.text,
      legendFontSize: 12,
    }));
  }, [items, colors.text]);

  // Summary stats
  const avgPrice = items.length > 0
    ? items.reduce((s, i) => s + i.price, 0) / items.length
    : 0;

  const totalValue = items.reduce((s, i) => s + i.price, 0);

  const topCategory = useMemo(() => {
    if (categoryData.length === 0) return 'None';
    return categoryData.sort((a, b) => b.value - a.value)[0].name;
  }, [categoryData]);

  const recurringCount = items.filter(i => i.is_recurring).length;

  const isEmpty = items.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.tint }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Data Yet</Text>
            <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
              Add items to your library to see analytics.
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.summaryNumber, { color: colors.tint }]}>{items.length}</Text>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>Total Items</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.summaryNumber, { color: colors.tint }]}>{formatCurrency(avgPrice)}</Text>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>Avg Price</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.summaryNumber, { color: colors.tint }]}>{formatCurrency(totalValue)}</Text>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>Library Value</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.summaryNumber, { color: '#FF9800' }]}>{recurringCount}</Text>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>Recurring</Text>
              </View>
            </View>

            {/* Top 5 Items Bar Chart */}
            {top5Items.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Top 5 Most Expensive</Text>
                <View style={[styles.chartCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <BarChart
                    data={barData}
                    width={screenWidth - 32}
                    height={200}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    yAxisLabel="$"
                    yAxisSuffix=""
                    showValuesOnTopOfBars
                  />
                </View>
              </>
            )}

            {/* Category Pie Chart */}
            {categoryData.length > 1 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending by Category</Text>
                <View style={[styles.chartCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <PieChart
                    data={categoryData}
                    width={screenWidth - 32}
                    height={200}
                    chartConfig={chartConfig}
                    accessor="value"
                    backgroundColor="transparent"
                    paddingLeft="15"
                  />
                </View>
              </>
            )}

            {/* Top category callout */}
            <View style={[styles.insightCard, { backgroundColor: colors.tint + '15', borderColor: colors.tint }]}>
              <Text style={[styles.insightTitle, { color: colors.tint }]}>💡 Insight</Text>
              <Text style={[styles.insightText, { color: colors.text }]}>
                Your largest spending category is <Text style={{ fontWeight: 'bold' }}>{topCategory}</Text>.{' '}
                You have {shoppingLists.length} shopping list{shoppingLists.length !== 1 ? 's' : ''} with a combined value of{' '}
                {formatCurrency(shoppingLists.reduce((s, l) => s + (l.items || []).reduce((t, i) => t + i.item.price * (i.quantity || 1), 0), 0))}.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
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
  content: { padding: 20, paddingBottom: 60 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 14, marginTop: 8 },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  summaryNumber: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  summaryLabel: { fontSize: 13, textAlign: 'center' },
  chartCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  chart: { borderRadius: 8 },
  insightCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  insightTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  insightText: { fontSize: 15, lineHeight: 22 },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { fontSize: 16, textAlign: 'center', opacity: 0.7, lineHeight: 24 },
});
