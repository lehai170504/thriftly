import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Gavel, Clock, Flame } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { Product } from '../../types';
import { formatVND, formatRelativeTime } from '../../utils/format';

interface AuctionCardProps {
  item: Product;
  onPress: (id: string) => void;
  colors: {
    card: string;
    border: string;
    text: string;
    textSecondary: string;
  };
}

export const AuctionCard = memo(function AuctionCard({
  item,
  onPress,
  colors,
}: AuctionCardProps) {
  const currentBid = item.auctionDetails?.currentBid || item.price;
  const bidCount = item.auctionDetails?.bidCount || 0;
  const imageUri =
    item.imageUrl ||
    item.images?.[0] ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';

  const timeDisplay = item.auctionDetails?.endTime
    ? formatRelativeTime(item.auctionDetails.endTime)
    : 'Đang diễn ra';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.85}
      onPress={() => onPress(item.id)}
    >
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <View style={styles.cardContent}>
        <View style={styles.badgeRow}>
          <View style={styles.liveBadge}>
            <Flame size={12} color="#ffffff" />
            <Text style={styles.liveBadgeText}>Đang đấu giá</Text>
          </View>
          <View style={styles.timeBadge}>
            <Clock size={12} color={colors.textSecondary} />
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {timeDisplay}
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.bidRow}>
          <View>
            <Text style={[styles.bidLabel, { color: colors.textSecondary }]}>Giá hiện tại</Text>
            <Text style={styles.bidAmount}>{formatVND(currentBid)}</Text>
          </View>
          <View style={styles.bidCountBadge}>
            <Gavel size={14} color={Colors.primary} />
            <Text style={styles.bidCountText}>{bidCount} lượt trả</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  liveBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 20,
  },
  bidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    paddingTop: 10,
  },
  bidLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  bidAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  bidCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bidCountText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
