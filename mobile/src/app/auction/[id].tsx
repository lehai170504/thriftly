import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock, Flame, ShieldCheck, History, Wallet } from 'lucide-react-native';
import { Client } from '@stomp/stompjs';
import { api } from '../../lib/api';
import { storage } from '../../lib/storage';
import { Colors } from '../../constants/theme';
import { Product, BidItem } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { formatVND } from '../../utils/format';

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { isAuthenticated, refreshUser } = useAuth();

  const [selectedBidIncrement, setSelectedBidIncrement] = useState<number>(50000);
  const [timeLeftText, setTimeLeftText] = useState<string>('--:--');
  const [liveBids, setLiveBids] = useState<BidItem[]>([]);
  const stompClientRef = useRef<Client | null>(null);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 10 * 1000,
  });

  const { data: depositStatus, refetch: refetchDeposit } = useQuery<boolean>({
    queryKey: ['deposit-status', id],
    queryFn: async () => {
      const res = await api.get(`/auctions/${id}/deposit-status`);
      return !!res.data;
    },
    enabled: !!id && isAuthenticated,
  });

  const { data: bidsHistory } = useQuery<BidItem[]>({
    queryKey: ['auction-bids', id],
    queryFn: async () => {
      const res = await api.get(`/auctions/${id}/bids`);
      return res.data || [];
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (bidsHistory) {
      setLiveBids(bidsHistory);
    }
  }, [bidsHistory]);

  useEffect(() => {
    if (!product?.auctionDetails?.endTime) return;

    const interval = setInterval(() => {
      const end = new Date(product.auctionDetails!.endTime).getTime();
      const diff = end - Date.now();

      if (diff <= 0) {
        setTimeLeftText('Đã kết thúc');
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (days > 0) {
        setTimeLeftText(`${days}d ${hours}h ${minutes}m`);
      } else {
        const hStr = hours < 10 ? `0${hours}` : `${hours}`;
        const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const sStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
        setTimeLeftText(`${hStr}:${mStr}:${sStr}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [product?.auctionDetails?.endTime]);

  useEffect(() => {
    if (!id) return;

    const rawWsUrl = process.env.EXPO_PUBLIC_WS_URL;
    let wsUrl = '';
    if (rawWsUrl) {
      const baseWs = rawWsUrl.replace(/\/$/, '').replace(/\/ws$/, '');
      wsUrl = `${baseWs}/ws/auction`;
    } else {
      let baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://thrift-swap.onrender.com/api/v1';
      baseUrl = baseUrl.replace('/api/v1', '');
      wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws/auction';
    }

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        client.subscribe(`/topic/auction/${id}`, (message) => {
          try {
            const data = JSON.parse(message.body);
            if (data?.bidAmount) {
              setLiveBids((prev) => [data, ...prev]);
              queryClient.invalidateQueries({ queryKey: ['product', id] });
            }
          } catch {
          }
        });
      },
    });

    storage.getItem('session_cookie').then((cookie) => {
      if (cookie) {
        client.connectHeaders = { Cookie: cookie };
      }
      client.activate();
      stompClientRef.current = client;
    });

    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [id, queryClient]);

  const depositMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/auctions/${id}/deposit`);
      return res.data;
    },
    onSuccess: () => {
      refetchDeposit();
      refreshUser();
      Alert.alert('Thành công', 'Đặt cọc thành công! Bạn có thể bắt đầu đấu giá sản phẩm này.');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi đặt cọc', err.response?.data?.message || 'Không thể đặt cọc. Vui lòng kiểm tra số dư ví.');
    },
  });

  const currentBid = product?.auctionDetails?.currentBid || product?.price || 0;
  const nextMinBid = currentBid + selectedBidIncrement;

  const handlePlaceBid = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login' as any);
      return;
    }

    if (!depositStatus) {
      Alert.alert(
        'Yêu cầu đặt cọc',
        'Bạn cần đặt cọc trước khi tham gia đấu giá sản phẩm này. Số tiền cọc sẽ được hoàn lại nếu bạn không trúng thầu.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đặt cọc ngay', onPress: () => depositMutation.mutate() },
        ]
      );
      return;
    }

    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: '/app/auction/bid',
        body: JSON.stringify({
          auctionSessionId: id,
          bidAmount: nextMinBid,
        }),
      });
      Alert.alert('Thành công', `Đã gửi giá thầu ${formatVND(nextMinBid)}!`);
    } else {
      Alert.alert('Lỗi kết nối', 'Đang kết nối lại phòng đấu giá trực tiếp, vui lòng thử lại sau giây lát.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Không tìm thấy phiên đấu giá</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const imageUri =
    product.imageUrl ||
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Phòng đấu giá trực tiếp</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.productImage}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <View style={styles.liveTag}>
            <Flame size={14} color="#ffffff" />
            <Text style={styles.liveTagText}>Đang diễn ra</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{product.title}</Text>

          <View style={[styles.auctionDashboard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.timerRow}>
              <Clock size={16} color={Colors.primary} />
              <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>Thời gian còn lại:</Text>
              <Text style={styles.timerCountdown}>{timeLeftText}</Text>
            </View>

            <View style={styles.bidHighlight}>
              <Text style={[styles.currentBidLabel, { color: colors.textSecondary }]}>GIÁ ĐẤU HIỆN TẠI</Text>
              <Text style={styles.currentBidAmount}>{formatVND(currentBid)}</Text>
              <Text style={[styles.bidCount, { color: colors.textSecondary }]}>
                {liveBids.length || product.auctionDetails?.bidCount || 0} lượt đặt giá
              </Text>
            </View>

            {isAuthenticated && (
              <View style={styles.depositNoticeRow}>
                <ShieldCheck size={14} color={depositStatus ? Colors.primary : '#d97706'} />
                <Text
                  style={[
                    styles.depositNoticeText,
                    { color: depositStatus ? Colors.primary : '#d97706' },
                  ]}
                >
                  {depositStatus ? 'Đã đặt cọc - Đủ điều kiện ra giá' : 'Chưa đặt cọc cho phiên này'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.bidStepSection}>
            <Text style={[styles.sectionSubtitle, { color: colors.text }]}>Chọn mức tăng giá:</Text>
            <View style={styles.stepButtonsRow}>
              {[20000, 50000, 100000, 200000].map((step) => {
                const isSelected = selectedBidIncrement === step;
                return (
                  <TouchableOpacity
                    key={step}
                    style={[
                      styles.stepButton,
                      isSelected
                        ? styles.stepButtonActive
                        : { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    onPress={() => setSelectedBidIncrement(step)}
                  >
                    <Text
                      style={[
                        styles.stepButtonText,
                        isSelected ? styles.stepButtonTextActive : { color: colors.textSecondary },
                      ]}
                    >
                      +{formatVND(step)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <History size={16} color={colors.text} />
              <Text style={[styles.sectionSubtitle, { color: colors.text }]}>Lịch sử đặt giá</Text>
            </View>

            {liveBids.length === 0 ? (
              <Text style={[styles.emptyHistoryText, { color: colors.textSecondary }]}>
                Chưa có lượt đặt giá nào. Hãy là người đầu tiên!
              </Text>
            ) : (
              liveBids.slice(0, 5).map((item, index) => (
                <View
                  key={item.id || index}
                  style={[
                    styles.bidHistoryItem,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.bidHistoryLeft}>
                    <Text style={[styles.bidderName, { color: colors.text }]}>
                      {item.bidderFullName || item.bidderUsername || 'Người tham gia'}
                    </Text>
                    <Text style={[styles.bidTime, { color: colors.textSecondary }]}>
                      {item.bidTime ? new Date(item.bidTime).toLocaleTimeString('vi-VN') : 'Vừa xong'}
                    </Text>
                  </View>
                  <Text style={styles.bidHistoryAmount}>{formatVND(item.bidAmount)}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {!depositStatus && isAuthenticated ? (
          <TouchableOpacity
            style={[styles.depositButton, depositMutation.isPending && { opacity: 0.7 }]}
            onPress={() => depositMutation.mutate()}
            disabled={depositMutation.isPending}
          >
            {depositMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Wallet size={18} color="#ffffff" />
                <Text style={styles.placeBidButtonText}>Đặt cọc để tham gia</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.placeBidButton} onPress={handlePlaceBid} activeOpacity={0.8}>
            <Text style={styles.placeBidButtonText}>Đặt giá {formatVND(nextMinBid)}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  liveTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  liveTagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  auctionDashboard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerLabel: {
    fontSize: 13,
  },
  timerCountdown: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  bidHighlight: {
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  currentBidLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  currentBidAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    marginVertical: 4,
  },
  bidCount: {
    fontSize: 12,
  },
  depositNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  depositNoticeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bidStepSection: {
    gap: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  stepButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepButtonTextActive: {
    color: '#ffffff',
  },
  historySection: {
    gap: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyHistoryText: {
    fontSize: 13,
    paddingVertical: 10,
  },
  bidHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  bidHistoryLeft: {
    gap: 2,
  },
  bidderName: {
    fontSize: 13,
    fontWeight: '600',
  },
  bidTime: {
    fontSize: 11,
  },
  bidHistoryAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  depositButton: {
    backgroundColor: '#d97706',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeBidButton: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeBidButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 12,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
