import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Gavel } from 'lucide-react-native';
import { api } from '../../lib/api';
import { Colors } from '../../constants/theme';
import { Product, PageResponse } from '../../types';
import { AuctionCard } from '../../components/common/AuctionCard';
import { EmptyState } from '../../components/common/EmptyState';

export default function AuctionsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [activeTab, setActiveTab] = useState<'HAPPENING' | 'SCHEDULED'>('HAPPENING');

  const {
    data: auctionsPage,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<PageResponse<Product>>({
    queryKey: ['auctions'],
    queryFn: async () => {
      const res = await api.get('/products/search', {
        params: {
          sellType: 'AUCTION',
          page: 0,
          size: 50,
          sortBy: 'createdAt',
          direction: 'desc',
        },
      });
      return res.data;
    },
    staleTime: 30 * 1000,
  });

  const auctions = useMemo(() => {
    const list = auctionsPage?.content || [];
    const now = Date.now();
    return list.filter((item) => {
      if (!item.auctionDetails) return activeTab === 'HAPPENING';
      const start = item.auctionDetails.startTime ? new Date(item.auctionDetails.startTime).getTime() : now;
      const end = item.auctionDetails.endTime ? new Date(item.auctionDetails.endTime).getTime() : now + 1;
      if (activeTab === 'HAPPENING') {
        return start <= now && end > now;
      } else {
        return start > now;
      }
    });
  }, [auctionsPage?.content, activeTab]);

  const handlePressAuction = useCallback(
    (id: string) => {
      router.push(`/auction/${id}` as any);
    },
    [router]
  );

  const renderAuctionItem = useCallback(
    ({ item }: { item: Product }) => (
      <AuctionCard item={item} onPress={handlePressAuction} colors={colors} />
    ),
    [handlePressAuction, colors]
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Đấu giá trực tiếp</Text>
        <View style={[styles.tabSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'HAPPENING' && styles.tabItemActive]}
            onPress={() => setActiveTab('HAPPENING')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabItemText,
                activeTab === 'HAPPENING' ? styles.tabItemTextActive : { color: colors.textSecondary },
              ]}
            >
              Đang diễn ra
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'SCHEDULED' && styles.tabItemActive]}
            onPress={() => setActiveTab('SCHEDULED')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabItemText,
                activeTab === 'SCHEDULED' ? styles.tabItemTextActive : { color: colors.textSecondary },
              ]}
            >
              Sắp bắt đầu
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={auctions}
          keyExtractor={keyExtractor}
          renderItem={renderAuctionItem}
          contentContainerStyle={styles.list}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={Platform.OS !== 'web'}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Gavel size={48} color={colors.textSecondary} />}
              title="Chưa có phiên đấu giá nào"
              subtitle="Các phiên đấu giá mới sẽ liên tục được cập nhật tại đây"
              textColor={colors.text}
              subtextColor={colors.textSecondary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  tabSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: Colors.primary,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabItemTextActive: {
    color: '#ffffff',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
