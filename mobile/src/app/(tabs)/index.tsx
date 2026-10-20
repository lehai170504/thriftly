import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, PackageOpen, X } from 'lucide-react-native';
import { api } from '../../lib/api';
import { Colors, Shadows } from '../../constants/theme';
import { Product, Category, PageResponse } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { ProductCard } from '../../components/common/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';

export default function ExploreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const [filterSellType, setFilterSellType] = useState<string>('ALL');
  const [filterCondition, setFilterCondition] = useState<string>('ALL');
  const [filterMinPrice, setFilterMinPrice] = useState<string>('');
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>('');
  const [filterSortBy, setFilterSortBy] = useState<string>('createdAt');
  const [filterDirection, setFilterDirection] = useState<'asc' | 'desc'>('desc');

  const [appliedFilters, setAppliedFilters] = useState({
    sellType: 'ALL',
    condition: 'ALL',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    direction: 'desc' as 'asc' | 'desc',
  });

  const debouncedSearch = useDebounce(searchInput, 350);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: productsPage,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<PageResponse<Product>>({
    queryKey: ['products', { search: debouncedSearch, category: selectedCategory, ...appliedFilters }],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: 0,
        size: 30,
        sortBy: appliedFilters.sortBy,
        direction: appliedFilters.direction,
      };
      if (debouncedSearch.trim()) params.query = debouncedSearch.trim();
      if (selectedCategory) params.categoryIds = [selectedCategory];
      if (appliedFilters.sellType !== 'ALL') params.sellType = appliedFilters.sellType;
      if (appliedFilters.condition !== 'ALL') params.condition = appliedFilters.condition;
      if (appliedFilters.minPrice) params.minPrice = Number(appliedFilters.minPrice);
      if (appliedFilters.maxPrice) params.maxPrice = Number(appliedFilters.maxPrice);

      const res = await api.get('/products/search', { params });
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  const products = useMemo(() => productsPage?.content || [], [productsPage?.content]);

  const hasActiveFilters = useMemo(() => {
    return (
      appliedFilters.sellType !== 'ALL' ||
      appliedFilters.condition !== 'ALL' ||
      appliedFilters.minPrice !== '' ||
      appliedFilters.maxPrice !== '' ||
      appliedFilters.sortBy !== 'createdAt'
    );
  }, [appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      sellType: filterSellType,
      condition: filterCondition,
      minPrice: filterMinPrice,
      maxPrice: filterMaxPrice,
      sortBy: filterSortBy,
      direction: filterDirection,
    });
    setIsFilterModalVisible(false);
  };

  const handleResetFilters = () => {
    setFilterSellType('ALL');
    setFilterCondition('ALL');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterSortBy('createdAt');
    setFilterDirection('desc');
    setAppliedFilters({
      sellType: 'ALL',
      condition: 'ALL',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      direction: 'desc',
    });
    setIsFilterModalVisible(false);
  };

  const handlePressProduct = useCallback(
    (id: string) => {
      router.push(`/product/${id}` as any);
    },
    [router]
  );

  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard item={item} onPress={handlePressProduct} colors={colors} />
    ),
    [handlePressProduct, colors]
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.topSection}>
        <View style={styles.brandRow}>
          <View>
            <Text style={[styles.brandTitle, { color: colors.text }]}>
              Thriftly<Text style={{ color: Colors.primary }}>.</Text>
            </Text>
            <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
              Khám phá đồ cũ tuyển chọn chất lượng
            </Text>
          </View>
        </View>

        <View style={styles.header}>
          <View
            style={[
              styles.searchBar,
              Shadows.sm,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              placeholder="Tìm kiếm đồ cũ, thương hiệu..."
              placeholderTextColor={colors.textSecondary}
              value={searchInput}
              onChangeText={setSearchInput}
              style={[styles.searchInput, { color: colors.text }]}
              returnKeyType="search"
            />
            {searchInput.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchInput('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              Shadows.sm,
              { backgroundColor: colors.surface, borderColor: colors.border },
              hasActiveFilters && styles.filterButtonActive,
            ]}
            onPress={() => setIsFilterModalVisible(true)}
            activeOpacity={0.7}
          >
            <SlidersHorizontal size={18} color={hasActiveFilters ? '#ffffff' : Colors.primary} />
            {hasActiveFilters ? <View style={styles.filterDot} /> : null}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesList}
          initialNumToRender={6}
          ListHeaderComponent={
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === null
                  ? styles.categoryChipActive
                  : { backgroundColor: colors.surface, borderColor: colors.border },
                selectedCategory === null && Shadows.sm,
              ]}
              onPress={() => setSelectedCategory(null)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === null
                    ? styles.categoryTextActive
                    : { color: colors.textSecondary },
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  isSelected
                    ? styles.categoryChipActive
                    : { backgroundColor: colors.surface, borderColor: colors.border },
                  isSelected && Shadows.sm,
                ]}
                onPress={() => setSelectedCategory(isSelected ? null : item.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected ? styles.categoryTextActive : { color: colors.textSecondary },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={keyExtractor}
          renderItem={renderProductItem}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS !== 'web'}
          ListHeaderComponent={
            products.length > 0 ? (
              <View style={styles.listHeaderRow}>
                <Text style={[styles.listHeaderTitle, { color: colors.text }]}>
                  {selectedCategory
                    ? categories?.find((c) => c.id === selectedCategory)?.name || 'Sản phẩm'
                    : 'Tất cả sản phẩm hiện có'}
                </Text>
                <View style={styles.listCountBadge}>
                  <Text style={styles.listCountText}>{products.length} món</Text>
                </View>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<PackageOpen size={36} color={Colors.primary} />}
              title="Không tìm thấy sản phẩm nào"
              subtitle="Thử tìm kiếm với từ khóa khác hoặc xóa bớt tiêu chí lọc."
              textColor={colors.text}
              subtextColor={colors.textSecondary}
              actionText={hasActiveFilters || searchInput ? 'Đặt lại bộ lọc' : undefined}
              onActionPress={() => {
                setSearchInput('');
                handleResetFilters();
              }}
            />
          }
        />
      )}

      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Bộ lọc tìm kiếm</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <X size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupTitle, { color: colors.text }]}>Hình thức bán</Text>
                <View style={styles.chipRow}>
                  {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'FIXED_PRICE', label: 'Giá cố định' },
                    { id: 'AUCTION', label: 'Đấu giá' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.chip,
                        filterSellType === item.id ? styles.chipActive : { borderColor: colors.border },
                      ]}
                      onPress={() => setFilterSellType(item.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filterSellType === item.id ? styles.chipTextActive : { color: colors.textSecondary },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupTitle, { color: colors.text }]}>Tình trạng</Text>
                <View style={styles.chipRow}>
                  {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'NEW', label: 'Mới 100%' },
                    { id: 'LIKE_NEW', label: 'Như mới' },
                    { id: 'GOOD', label: 'Tốt' },
                    { id: 'FAIR', label: 'Chấp nhận được' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.chip,
                        filterCondition === item.id ? styles.chipActive : { borderColor: colors.border },
                      ]}
                      onPress={() => setFilterCondition(item.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filterCondition === item.id ? styles.chipTextActive : { color: colors.textSecondary },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupTitle, { color: colors.text }]}>Khoảng giá (VNĐ)</Text>
                <View style={styles.priceRow}>
                  <TextInput
                    placeholder="Tối thiểu"
                    placeholderTextColor={colors.textSecondary}
                    value={filterMinPrice}
                    onChangeText={setFilterMinPrice}
                    keyboardType="numeric"
                    style={[styles.priceInput, { borderColor: colors.border, color: colors.text }]}
                  />
                  <Text style={{ color: colors.textSecondary }}>-</Text>
                  <TextInput
                    placeholder="Tối đa"
                    placeholderTextColor={colors.textSecondary}
                    value={filterMaxPrice}
                    onChangeText={setFilterMaxPrice}
                    keyboardType="numeric"
                    style={[styles.priceInput, { borderColor: colors.border, color: colors.text }]}
                  />
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={[styles.filterGroupTitle, { color: colors.text }]}>Sắp xếp theo</Text>
                <View style={styles.chipRow}>
                  {[
                    { label: 'Mới nhất', sortBy: 'createdAt', direction: 'desc' as const },
                    { label: 'Giá tăng dần', sortBy: 'price', direction: 'asc' as const },
                    { label: 'Giá giảm dần', sortBy: 'price', direction: 'desc' as const },
                  ].map((item, idx) => {
                    const isSelected =
                      filterSortBy === item.sortBy && filterDirection === item.direction;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.chip,
                          isSelected ? styles.chipActive : { borderColor: colors.border },
                        ]}
                        onPress={() => {
                          setFilterSortBy(item.sortBy);
                          setFilterDirection(item.direction);
                        }}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected ? styles.chipTextActive : { color: colors.textSecondary },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.footerBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={handleResetFilters}
              >
                <Text style={[styles.footerBtnText, { color: colors.textSecondary }]}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerBtn, { backgroundColor: Colors.primary }]}
                onPress={handleApplyFilters}
              >
                <Text style={[styles.footerBtnText, { color: '#ffffff' }]}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  brandRow: {
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  brandSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: '400',
  },
  header: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  categoriesSection: {
    paddingVertical: 10,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8.5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 12,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  listCountBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  listCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  productList: {
    paddingHorizontal: 11,
    paddingBottom: 28,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalBody: {
    padding: 22,
    gap: 22,
  },
  filterGroup: {
    gap: 10,
  },
  filterGroupTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
