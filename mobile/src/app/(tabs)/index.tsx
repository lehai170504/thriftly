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
import { Search, SlidersHorizontal, PackageOpen, X, Check } from 'lucide-react-native';
import { api } from '../../lib/api';
import { Colors } from '../../constants/theme';
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
      <View style={styles.header}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            placeholder="Tìm kiếm đồ cũ, thương hiệu..."
            placeholderTextColor={colors.textSecondary}
            value={searchInput}
            onChangeText={setSearchInput}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
            hasActiveFilters && styles.filterButtonActive,
          ]}
          onPress={() => setIsFilterModalVisible(true)}
          activeOpacity={0.7}
        >
          <SlidersHorizontal size={18} color={hasActiveFilters ? '#ffffff' : Colors.primary} />
        </TouchableOpacity>
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
              ]}
              onPress={() => setSelectedCategory(null)}
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
                ]}
                onPress={() => setSelectedCategory(isSelected ? null : item.id)}
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
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<PackageOpen size={48} color={colors.textSecondary} />}
              title="Không tìm thấy sản phẩm nào"
              subtitle="Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc"
              textColor={colors.text}
              subtextColor={colors.textSecondary}
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
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoriesSection: {
    paddingVertical: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  productList: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 20,
    gap: 20,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  footerBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
