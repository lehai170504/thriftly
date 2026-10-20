import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Heart, Sparkles, MapPin, Tag } from 'lucide-react-native';
import { Colors, Shadows } from '../../constants/theme';
import { Product } from '../../types';
import { formatVND } from '../../utils/format';

interface ProductCardProps {
  item: Product;
  onPress: (id: string) => void;
  colors: {
    card: string;
    border: string;
    text: string;
    textSecondary: string;
    background?: string;
  };
}

export const ProductCard = memo(function ProductCard({
  item,
  onPress,
  colors,
}: ProductCardProps) {
  const isAuction = item.sellType === 'AUCTION';
  const displayPrice = isAuction
    ? item.auctionDetails?.currentBid || item.price
    : item.price;

  const imageUri =
    item.imageUrl ||
    item.images?.[0] ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';

  return (
    <TouchableOpacity
      style={[
        styles.productCard,
        Shadows.sm,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      activeOpacity={0.88}
      onPress={() => onPress(item.id)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.productImage}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />
        <View style={styles.badgeOverlay}>
          {isAuction ? (
            <View style={styles.auctionBadge}>
              <Sparkles size={11} color="#ffffff" />
              <Text style={styles.auctionBadgeText}>ĐẤU GIÁ</Text>
            </View>
          ) : (
            <View style={styles.buyNowBadge}>
              <Tag size={10} color="#047857" />
              <Text style={styles.buyNowBadgeText}>MUA NGAY</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.favoriteButton}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Heart
              size={15}
              color={item.isFavorited ? '#ef4444' : '#475569'}
              fill={item.isFavorited ? '#ef4444' : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {item.condition ? (
          <View style={styles.conditionTag}>
            <Text style={styles.conditionText}>{item.condition}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.productInfo}>
        <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.pricePrefix}>Giá {isAuction ? 'khởi điểm' : 'bán'}</Text>
          <Text style={styles.productPrice}>{formatVND(displayPrice)}</Text>
        </View>

        <View style={styles.sellerRow}>
          <Text style={[styles.sellerName, { color: colors.textSecondary }]} numberOfLines={1}>
            @{item.seller?.name || item.seller?.username || 'thriftly'}
          </Text>
          {item.location ? (
            <View style={styles.locationContainer}>
              <MapPin size={10} color={colors.textSecondary} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.location.split(',')[0]}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  productCard: {
    flex: 1,
    margin: 5,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: '#f1f5f9',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  auctionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ea580c',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 3.5,
  },
  auctionBadgeText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buyNowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 7.5,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 3.5,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  buyNowBadgeText: {
    color: '#047857',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    padding: 6,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  conditionTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  conditionText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  productInfo: {
    padding: 11,
    justifyContent: 'space-between',
    flex: 1,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    minHeight: 36,
    marginBottom: 6,
  },
  priceContainer: {
    marginBottom: 8,
  },
  pricePrefix: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  sellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f1f5f9',
    gap: 4,
  },
  sellerName: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    maxWidth: '45%',
  },
  locationText: {
    fontSize: 10,
    fontWeight: '400',
  },
});
