import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Heart, Sparkles } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
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
      style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.85}
      onPress={() => onPress(item.id)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.productImage}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        {isAuction && (
          <View style={styles.auctionBadge}>
            <Sparkles size={12} color="#ffffff" />
            <Text style={styles.auctionBadgeText}>Đấu giá</Text>
          </View>
        )}
        <TouchableOpacity style={styles.favoriteButton} activeOpacity={0.7}>
          <Heart size={16} color={item.isFavorited ? '#ef4444' : '#6b7280'} />
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.productPrice}>{formatVND(displayPrice)}</Text>

        <View style={styles.sellerRow}>
          <Text style={[styles.sellerName, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.seller?.name || 'Người bán'}
          </Text>
          {item.location ? (
            <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.location}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  productCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  auctionBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  auctionBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 6,
    borderRadius: 20,
  },
  productInfo: {
    padding: 10,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  sellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 11,
    flex: 1,
  },
  locationText: {
    fontSize: 10,
  },
});
