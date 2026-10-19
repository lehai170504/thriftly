import React, { useState } from 'react';
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
import { ArrowLeft, Heart, MessageSquare, ShieldCheck, Share2, Sparkles } from 'lucide-react-native';
import { api } from '../../lib/api';
import { Colors } from '../../constants/theme';
import { Product } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { formatVND } from '../../utils/format';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { isAuthenticated } = useAuth();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });

  const buyNowMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/orders/buy-now/${id}`, { quantity: '1' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('Thành công', 'Đặt hàng Mua ngay thành công! Vui lòng thanh toán đơn hàng.', [
        { text: 'Xem đơn hàng', onPress: () => router.push('/(tabs)/orders') },
        { text: 'Ở lại', style: 'cancel' },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Lỗi đặt hàng', err.response?.data?.message || 'Không thể tạo đơn hàng mua ngay');
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/products/${id}/favorite`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể cập nhật yêu thích');
    },
  });

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login' as any);
      return;
    }
    Alert.alert('Xác nhận mua ngay', `Bạn có muốn mua sản phẩm này với giá ${formatVND(product?.price || 0)}?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Mua ngay', onPress: () => buyNowMutation.mutate() },
    ]);
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login' as any);
      return;
    }
    favoriteMutation.mutate();
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
        <Text style={[styles.errorText, { color: colors.text }]}>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isAuction = product.sellType === 'AUCTION';
  const displayPrice = isAuction
    ? product.auctionDetails?.currentBid || product.price
    : product.price;

  const imagesList = product.images && product.images.length > 0
    ? product.images
    : [product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'];

  const mainImageUri = imagesList[selectedImageIndex] || imagesList[0];

  const sellerAvatarUri =
    product.seller?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.navRight}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            activeOpacity={0.7}
          >
            <Share2 size={18} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={handleToggleFavorite}
            activeOpacity={0.7}
          >
            <Heart size={18} color={product.isFavorited ? '#ef4444' : colors.text} fill={product.isFavorited ? '#ef4444' : 'none'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: mainImageUri }}
            style={styles.mainImage}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          {isAuction && (
            <View style={styles.auctionBadge}>
              <Sparkles size={14} color="#ffffff" />
              <Text style={styles.auctionBadgeText}>Đang đấu giá</Text>
            </View>
          )}
        </View>

        {imagesList.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailList}>
            {imagesList.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedImageIndex(idx)}
                style={[
                  styles.thumbnailWrapper,
                  selectedImageIndex === idx && styles.thumbnailActive,
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImage} contentFit="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.detailsContainer}>
          <Text style={styles.price}>{formatVND(displayPrice)}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{product.title}</Text>

          <View style={[styles.conditionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.conditionItem}>
              <Text style={[styles.conditionLabel, { color: colors.textSecondary }]}>Tình trạng</Text>
              <Text style={[styles.conditionValue, { color: colors.text }]}>
                {product.condition === 'LIKE_NEW' ? 'Như mới' : product.condition === 'NEW' ? 'Mới 100%' : 'Tốt'}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.conditionItem}>
              <Text style={[styles.conditionLabel, { color: colors.textSecondary }]}>Danh mục</Text>
              <Text style={[styles.conditionValue, { color: colors.text }]}>
                {product.category?.name || 'Khác'}
              </Text>
            </View>
          </View>

          <View style={[styles.sellerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image
              source={{ uri: sellerAvatarUri }}
              style={styles.sellerAvatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <View style={styles.sellerInfo}>
              <Text style={[styles.sellerName, { color: colors.text }]}>{product.seller?.name}</Text>
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color={Colors.primary} />
                <Text style={styles.verifiedText}>Đã xác minh uy tín</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Mô tả sản phẩm</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {product.description || 'Chưa có mô tả cho sản phẩm này.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.chatButton, { borderColor: colors.border }]} activeOpacity={0.7}>
          <MessageSquare size={18} color={colors.text} />
          <Text style={[styles.chatButtonText, { color: colors.text }]}>Chat</Text>
        </TouchableOpacity>

        {isAuction ? (
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => router.push(`/auction/${product.id}` as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.buyButtonText}>Vào phòng đấu giá</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.buyButton, buyNowMutation.isPending && { opacity: 0.7 }]}
            onPress={handleBuyNow}
            disabled={buyNowMutation.isPending}
            activeOpacity={0.8}
          >
            {buyNowMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buyButtonText}>Mua ngay</Text>
            )}
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
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageWrapper: {
    width: '100%',
    height: 380,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  auctionBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  auctionBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  detailsContainer: {
    padding: 16,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 16,
  },
  conditionCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  conditionItem: {
    flex: 1,
    alignItems: 'center',
  },
  conditionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  conditionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: '100%',
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buyButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonText: {
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
  thumbnailList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: Colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});
