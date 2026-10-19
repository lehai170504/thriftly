import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UploadCloud, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../lib/api';
import { Colors } from '../../constants/theme';
import { Category } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function SellScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { isAuthenticated } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sellType, setSellType] = useState<'FIXED_PRICE' | 'AUCTION'>('FIXED_PRICE');
  const [condition, setCondition] = useState('LIKE_NEW');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState('Hà Nội');
  const [auctionDurationDays, setAuctionDurationDays] = useState(3);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const pickAndUploadImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsUploading(true);

        const formData = new FormData();
        const uriParts = asset.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('file', {
          uri: asset.uri,
          name: `upload_${Date.now()}.${fileType}`,
          type: `image/${fileType}`,
        } as any);

        const uploadRes = await api.post('/media/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadRes.data?.url) {
          setUploadedImages((prev) => [...prev, uploadRes.data.url]);
        }
      }
    } catch (err: any) {
      Alert.alert('Lỗi tải ảnh', err.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/products', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      Alert.alert('Thành công', 'Sản phẩm của bạn đã được đăng thành công!', [
        { text: 'OK', onPress: () => router.push('/(tabs)') },
      ]);
      setTitle('');
      setDescription('');
      setPrice('');
      setUploadedImages([]);
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể đăng sản phẩm');
    },
  });

  const handleSubmit = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login' as any);
      return;
    }

    if (!title.trim() || !price || !categoryId) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ tiêu đề, giá và chọn danh mục');
      return;
    }

    const imagesToSubmit =
      uploadedImages.length > 0
        ? uploadedImages
        : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'];

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      sellType,
      condition,
      categoryId,
      location,
      images: imagesToSubmit,
      imageUrl: imagesToSubmit[0],
      auctionDurationDays: sellType === 'AUCTION' ? auctionDurationDays : undefined,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.heading, { color: colors.text }]}>Đăng tin bán</Text>

        <View style={styles.sellTypeRow}>
          <TouchableOpacity
            style={[
              styles.sellTypeButton,
              sellType === 'FIXED_PRICE'
                ? styles.sellTypeActive
                : { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setSellType('FIXED_PRICE')}
          >
            <Text
              style={[
                styles.sellTypeText,
                sellType === 'FIXED_PRICE' ? styles.sellTypeTextActive : { color: colors.textSecondary },
              ]}
            >
              Giá cố định
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sellTypeButton,
              sellType === 'AUCTION'
                ? styles.sellTypeActive
                : { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setSellType('AUCTION')}
          >
            <Text
              style={[
                styles.sellTypeText,
                sellType === 'AUCTION' ? styles.sellTypeTextActive : { color: colors.textSecondary },
              ]}
            >
              Đấu giá
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageList}>
            {uploadedImages.map((uri, idx) => (
              <View key={idx} style={styles.imageThumbWrapper}>
                <Image source={{ uri }} style={styles.imageThumb} contentFit="cover" />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => handleRemoveImage(idx)}
                >
                  <X size={14} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.imageUploader, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={pickAndUploadImage}
              disabled={isUploading}
              activeOpacity={0.7}
            >
              {isUploading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <UploadCloud size={28} color={Colors.primary} />
                  <Text style={[styles.uploaderText, { color: colors.textSecondary }]}>Thêm ảnh</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Tiêu đề món đồ *</Text>
          <TextInput
            placeholder="Ví dụ: Áo khoác dạ vintage dáng dài..."
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            {sellType === 'AUCTION' ? 'Giá khởi điểm (VNĐ) *' : 'Giá bán (VNĐ) *'}
          </Text>
          <TextInput
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />
        </View>

        {sellType === 'AUCTION' && (
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Thời hạn đấu giá</Text>
            <View style={styles.conditionRow}>
              {[1, 3, 5, 7].map((days) => {
                const isSelected = auctionDurationDays === days;
                return (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.condChip,
                      isSelected ? styles.condChipActive : { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    onPress={() => setAuctionDurationDays(days)}
                  >
                    <Text style={[styles.condChipText, isSelected ? styles.condChipTextActive : { color: colors.textSecondary }]}>
                      {days} ngày
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Khu vực bán</Text>
          <TextInput
            placeholder="Hà Nội, TP.HCM..."
            placeholderTextColor={colors.textSecondary}
            value={location}
            onChangeText={setLocation}
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Danh mục *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories?.map((c) => {
              const isSelected = categoryId === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.catChip,
                    isSelected ? styles.catChipActive : { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => setCategoryId(c.id)}
                >
                  <Text style={[styles.catChipText, isSelected ? styles.catChipTextActive : { color: colors.textSecondary }]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Tình trạng</Text>
          <View style={styles.conditionRow}>
            {[
              { id: 'LIKE_NEW', label: 'Như mới' },
              { id: 'GOOD', label: 'Tốt' },
              { id: 'FAIR', label: 'Chấp nhận được' },
            ].map((cond) => {
              const isSelected = condition === cond.id;
              return (
                <TouchableOpacity
                  key={cond.id}
                  style={[
                    styles.condChip,
                    isSelected ? styles.condChipActive : { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => setCondition(cond.id)}
                >
                  <Text style={[styles.condChipText, isSelected ? styles.condChipTextActive : { color: colors.textSecondary }]}>
                    {cond.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Mô tả chi tiết</Text>
          <TextInput
            placeholder="Mô tả độ mới, kích thước, khuyết điểm nếu có..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
            ]}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, createMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Đăng bán ngay</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  sellTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sellTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  sellTypeActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sellTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sellTypeTextActive: {
    color: '#ffffff',
  },
  imageSection: {
    marginBottom: 16,
  },
  imageList: {
    gap: 10,
    alignItems: 'center',
  },
  imageThumbWrapper: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUploader: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  uploaderText: {
    fontSize: 11,
    fontWeight: '500',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  catChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  catChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  conditionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  condChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  condChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  condChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  condChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
