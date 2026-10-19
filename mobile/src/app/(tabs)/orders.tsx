import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, CheckCircle2, AlertTriangle, Truck, CreditCard, RotateCcw, X } from 'lucide-react-native';
import { api } from '../../lib/api';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { formatVND } from '../../utils/format';
import { EmptyState } from '../../components/common/EmptyState';

export default function OrdersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { isAuthenticated, refreshUser } = useAuth();

  const [roleTab, setRoleTab] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [actionModal, setActionModal] = useState<{
    visible: boolean;
    type: 'SHIP' | 'DISPUTE' | null;
    orderId: string | null;
    inputValue: string;
  }>({
    visible: false,
    type: null,
    orderId: null,
    inputValue: '',
  });

  const {
    data: ordersData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['orders', roleTab],
    queryFn: async () => {
      const endpoint = roleTab === 'BUYER' ? '/orders/me' : '/orders/sales';
      const res = await api.get(endpoint, {
        params: { page: 0, size: 50 },
      });
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 15 * 1000,
  });

  const orders = useMemo(() => {
    const list = Array.isArray(ordersData) ? ordersData : ordersData?.content || [];
    if (selectedStatus === 'ALL') return list;
    return list.filter((item: any) => item.status === selectedStatus);
  }, [ordersData, selectedStatus]);

  const payMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.post(`/orders/${orderId}/pay`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      refreshUser();
      Alert.alert('Thành công', 'Thanh toán đơn hàng thành công, tiền đã được chuyển vào quỹ tạm giữ Escrow.');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể thanh toán đơn hàng. Vui lòng kiểm tra số dư ví.');
    },
  });

  const confirmReceiptMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.post(`/orders/${orderId}/confirm-receipt`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('Thành công', 'Đã xác nhận nhận hàng. Tiền đã được giải ngân cho người bán.');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể xác nhận nhận hàng');
    },
  });

  const shipMutation = useMutation({
    mutationFn: async ({ orderId, trackingCode }: { orderId: string; trackingCode: string }) => {
      const res = await api.post(`/orders/${orderId}/ship`, { trackingCode });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setActionModal({ visible: false, type: null, orderId: null, inputValue: '' });
      Alert.alert('Thành công', 'Đã cập nhật mã vận đơn thành công!');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể cập nhật mã vận chuyển');
    },
  });

  const disputeMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      const res = await api.post(`/orders/${orderId}/dispute`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setActionModal({ visible: false, type: null, orderId: null, inputValue: '' });
      Alert.alert('Đã gửi khiếu nại', 'Hệ thống đã tiếp nhận yêu cầu khiếu nại của bạn.');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể gửi khiếu nại');
    },
  });

  const confirmReturnMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.post(`/orders/${orderId}/confirm-return`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('Thành công', 'Đã xác nhận nhận hàng hoàn. Hệ thống đã hoàn tiền cho người mua.');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể xác nhận hoàn tiền');
    },
  });

  const handleModalSubmit = () => {
    if (!actionModal.orderId || !actionModal.inputValue.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung');
      return;
    }
    if (actionModal.type === 'SHIP') {
      shipMutation.mutate({
        orderId: actionModal.orderId,
        trackingCode: actionModal.inputValue.trim(),
      });
    } else if (actionModal.type === 'DISPUTE') {
      disputeMutation.mutate({
        orderId: actionModal.orderId,
        reason: actionModal.inputValue.trim(),
      });
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'Chờ thanh toán';
      case 'PAID_ESCROW':
        return 'Đã thanh toán (Tạm giữ)';
      case 'SHIPPED':
        return 'Đang vận chuyển';
      case 'DELIVERED':
        return 'Đã giao tới';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'DISPUTED':
        return 'Đang khiếu nại';
      case 'RETURNING':
        return 'Đang hoàn trả';
      case 'RETURNED':
        return 'Đã hoàn hàng';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const renderOrderItem = useCallback(
    ({ item }: { item: any }) => {
      const isBuyer = roleTab === 'BUYER';
      const status = item.status;

      return (
        <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.orderHeader}>
            <Text style={[styles.orderId, { color: colors.textSecondary }]}>
              Mã: #{item.id?.substring(0, 8)}
            </Text>
            <View
              style={[
                styles.statusBadge,
                status === 'COMPLETED' && styles.statusCompleted,
                status === 'PAID_ESCROW' && styles.statusEscrow,
                status === 'DISPUTED' && styles.statusDisputed,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  status === 'COMPLETED' && styles.statusTextCompleted,
                  status === 'DISPUTED' && styles.statusTextDisputed,
                ]}
              >
                {getStatusText(status)}
              </Text>
            </View>
          </View>

          <Text style={[styles.orderProductTitle, { color: colors.text }]} numberOfLines={2}>
            {item.productTitle || item.product?.title || 'Sản phẩm giao dịch'}
          </Text>

          {item.trackingCode ? (
            <View style={styles.trackingRow}>
              <Truck size={14} color={Colors.primary} />
              <Text style={[styles.trackingText, { color: colors.textSecondary }]}>
                Mã vận đơn: {item.trackingCode}
              </Text>
            </View>
          ) : null}

          <View style={styles.orderFooter}>
            <Text style={styles.orderTotal}>
              {formatVND(item.totalAmount || item.price || 0)}
            </Text>

            <View style={styles.actionsContainer}>
              {isBuyer && status === 'PENDING_PAYMENT' && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionPrimary]}
                  onPress={() => payMutation.mutate(item.id)}
                  disabled={payMutation.isPending}
                >
                  <CreditCard size={14} color="#ffffff" />
                  <Text style={styles.actionBtnText}>Thanh toán</Text>
                </TouchableOpacity>
              )}

              {isBuyer && (status === 'SHIPPED' || status === 'DELIVERED') && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionPrimary]}
                  onPress={() => confirmReceiptMutation.mutate(item.id)}
                  disabled={confirmReceiptMutation.isPending}
                >
                  <CheckCircle2 size={14} color="#ffffff" />
                  <Text style={styles.actionBtnText}>Đã nhận hàng</Text>
                </TouchableOpacity>
              )}

              {isBuyer && (status === 'SHIPPED' || status === 'DELIVERED') && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionDanger]}
                  onPress={() =>
                    setActionModal({
                      visible: true,
                      type: 'DISPUTE',
                      orderId: item.id,
                      inputValue: '',
                    })
                  }
                >
                  <AlertTriangle size={14} color="#ffffff" />
                  <Text style={styles.actionBtnText}>Khiếu nại</Text>
                </TouchableOpacity>
              )}

              {!isBuyer && status === 'PAID_ESCROW' && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionPrimary]}
                  onPress={() =>
                    setActionModal({
                      visible: true,
                      type: 'SHIP',
                      orderId: item.id,
                      inputValue: '',
                    })
                  }
                >
                  <Truck size={14} color="#ffffff" />
                  <Text style={styles.actionBtnText}>Giao hàng</Text>
                </TouchableOpacity>
              )}

              {!isBuyer && status === 'RETURNING' && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionPrimary]}
                  onPress={() => confirmReturnMutation.mutate(item.id)}
                  disabled={confirmReturnMutation.isPending}
                >
                  <RotateCcw size={14} color="#ffffff" />
                  <Text style={styles.actionBtnText}>Nhận hàng hoàn</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      );
    },
    [roleTab, colors, payMutation, confirmReceiptMutation, confirmReturnMutation]
  );

  const keyExtractor = useCallback((item: any) => item.id, []);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <Package size={56} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Đăng nhập để xem đơn hàng</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Theo dõi tiến độ giao hàng và lịch sử đơn hàng của bạn
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/login' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Đơn hàng</Text>
        <View style={[styles.tabSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabItem, roleTab === 'BUYER' && styles.tabItemActive]}
            onPress={() => setRoleTab('BUYER')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabItemText,
                roleTab === 'BUYER' ? styles.tabItemTextActive : { color: colors.textSecondary },
              ]}
            >
              Đơn mua
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, roleTab === 'SELLER' && styles.tabItemActive]}
            onPress={() => setRoleTab('SELLER')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabItemText,
                roleTab === 'SELLER' ? styles.tabItemTextActive : { color: colors.textSecondary },
              ]}
            >
              Đơn bán
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
            { id: 'PAID_ESCROW', label: 'Đã thanh toán' },
            { id: 'SHIPPED', label: 'Đang giao' },
            { id: 'COMPLETED', label: 'Hoàn thành' },
            { id: 'DISPUTED', label: 'Khiếu nại' },
          ]}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.statusChipsList}
          renderItem={({ item }) => {
            const isSelected = selectedStatus === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.statusChip,
                  isSelected
                    ? styles.statusChipActive
                    : { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => setSelectedStatus(item.id)}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    isSelected ? styles.statusChipTextActive : { color: colors.textSecondary },
                  ]}
                >
                  {item.label}
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
          data={orders}
          keyExtractor={keyExtractor}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.list}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
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
              icon={<Package size={48} color={colors.textSecondary} />}
              title="Chưa có đơn hàng nào"
              subtitle="Lịch sử các giao dịch mua và bán sẽ xuất hiện tại đây"
              textColor={colors.text}
              subtextColor={colors.textSecondary}
            />
          }
        />
      )}

      <Modal
        visible={actionModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModal({ visible: false, type: null, orderId: null, inputValue: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {actionModal.type === 'SHIP' ? 'Cập nhật mã vận đơn' : 'Lý do khiếu nại'}
              </Text>
              <TouchableOpacity
                onPress={() => setActionModal({ visible: false, type: null, orderId: null, inputValue: '' })}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder={actionModal.type === 'SHIP' ? 'Nhập mã vận đơn (VD: GHN-12345)' : 'Mô tả chi tiết lỗi...'}
              placeholderTextColor={colors.textSecondary}
              value={actionModal.inputValue}
              onChangeText={(text) => setActionModal((prev) => ({ ...prev, inputValue: text }))}
              style={[
                styles.modalInput,
                { color: colors.text, borderColor: colors.border },
                actionModal.type === 'DISPUTE' && styles.modalTextArea,
              ]}
              multiline={actionModal.type === 'DISPUTE'}
              numberOfLines={actionModal.type === 'DISPUTE' ? 3 : 1}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setActionModal({ visible: false, type: null, orderId: null, inputValue: '' })}
              >
                <Text style={{ color: colors.textSecondary }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.primary }]}
                onPress={handleModalSubmit}
              >
                <Text style={{ color: '#ffffff', fontWeight: '700' }}>Xác nhận</Text>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
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
  statusChipsList: {
    gap: 8,
    paddingVertical: 4,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 12,
  },
  statusBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusEscrow: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
  },
  statusCompleted: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
  },
  statusDisputed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusText: {
    fontSize: 11,
    color: '#d97706',
    fontWeight: '600',
  },
  statusTextCompleted: {
    color: '#059669',
  },
  statusTextDisputed: {
    color: '#ef4444',
  },
  orderProductTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  trackingText: {
    fontSize: 12,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionPrimary: {
    backgroundColor: Colors.primary,
  },
  actionDanger: {
    backgroundColor: '#ef4444',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
