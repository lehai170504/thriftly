import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import {
  Wallet,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Heart,
  User as UserIcon,
  Edit3,
  X,
  CreditCard,
  Lock,
} from 'lucide-react-native';
import { api } from '../../lib/api';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { formatVND } from '../../utils/format';

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { user, isAuthenticated, logout, refreshUser } = useAuth();

  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState('100000');
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [editFullName, setEditFullName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');

  const [isSetPasswordModalVisible, setIsSetPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [changePasswordNew, setChangePasswordNew] = useState('');
  const [changePasswordConfirm, setChangePasswordConfirm] = useState('');
  const [passwordActionLoading, setPasswordActionLoading] = useState(false);

  const handleSetPasswordSubmit = async () => {
    if (!newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setPasswordActionLoading(true);
    try {
      await api.post('/users/me/set-password', { newPassword });
      await refreshUser();
      setIsSetPasswordModalVisible(false);
      setNewPassword('');
      setConfirmNewPassword('');
      Alert.alert('Thành công', 'Thiết lập mật khẩu thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : null);
      Alert.alert('Lỗi', msg || 'Không thể thiết lập mật khẩu');
    } finally {
      setPasswordActionLoading(false);
    }
  };

  const handleChangePasswordSubmit = async () => {
    if (!oldPassword || !changePasswordNew || !changePasswordConfirm) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường');
      return;
    }
    if (changePasswordNew.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (changePasswordNew !== changePasswordConfirm) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
      return;
    }
    if (oldPassword === changePasswordNew) {
      Alert.alert('Lỗi', 'Mật khẩu mới không được trùng với mật khẩu cũ');
      return;
    }

    setPasswordActionLoading(true);
    try {
      await api.put('/users/me/password', { currentPassword: oldPassword, newPassword: changePasswordNew });
      setIsChangePasswordModalVisible(false);
      setOldPassword('');
      setChangePasswordNew('');
      setChangePasswordConfirm('');
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
    } catch (err: any) {
      const msg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : null);
      Alert.alert('Lỗi', msg || 'Không thể đổi mật khẩu');
    } finally {
      setPasswordActionLoading(false);
    }
  };

  const { data: walletData, isLoading: isWalletLoading, refetch: refetchWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await api.get('/wallets/me');
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 10 * 1000,
  });

  const payOsMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await api.post('/payment/payos/create-payment', { amount });
      return res.data;
    },
    onSuccess: async (data: any) => {
      setIsDepositModalVisible(false);
      const checkoutUrl = data?.checkoutUrl;
      if (checkoutUrl) {
        await WebBrowser.openBrowserAsync(checkoutUrl);
        refetchWallet();
        refreshUser();
      } else {
        Alert.alert('Lỗi', 'Không thể tạo đường link thanh toán PayOS');
      }
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể tạo yêu cầu nạp tiền');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put('/users/me', payload);
      return res.data;
    },
    onSuccess: () => {
      setIsEditProfileVisible(false);
      refreshUser();
      Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
    },
    onError: (err: any) => {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể cập nhật hồ sơ');
    },
  });

  const handleDepositSubmit = () => {
    const amount = Number(depositAmount);
    if (!amount || amount < 10000) {
      Alert.alert('Số tiền không hợp lệ', 'Số tiền nạp tối thiểu là 10.000 VNĐ');
      return;
    }
    payOsMutation.mutate(amount);
  };

  const handleUpdateProfileSubmit = () => {
    if (!editFullName.trim()) {
      Alert.alert('Lỗi', 'Họ tên không được để trống');
      return;
    }
    updateProfileMutation.mutate({
      fullName: editFullName.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
    });
  };

  const balance = walletData?.balance ?? user?.balance ?? 0;
  const userAvatarUri =
    user?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Tài khoản</Text>

        {isAuthenticated && user ? (
          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image
              source={{ uri: userAvatarUri }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
              <View style={styles.verifiedRow}>
                <ShieldCheck size={14} color={Colors.primary} />
                <Text style={styles.verifiedText}>Tài khoản đã xác thực</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editIconBtn}
              onPress={() => {
                setEditFullName(user?.name || '');
                setEditPhone(user?.phone || '');
                setEditAddress(user?.address || '');
                setIsEditProfileVisible(true);
              }}
            >
              <Edit3 size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.guestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.guestIcon}>
              <UserIcon size={32} color={Colors.primary} />
            </View>
            <Text style={[styles.guestTitle, { color: colors.text }]}>Chào mừng bạn đến với Thriftly</Text>
            <Text style={[styles.guestSubtitle, { color: colors.textSecondary }]}>
              Đăng nhập để mua bán, tham gia đấu giá và quản lý ví
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/(auth)/login' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Đăng nhập / Đăng ký</Text>
            </TouchableOpacity>
          </View>
        )}

        {isAuthenticated && (
          <View style={[styles.walletCard, { borderColor: colors.border }]}>
            <View style={styles.walletHeader}>
              <View style={styles.walletTitleRow}>
                <Wallet size={20} color={Colors.primary} />
                <Text style={styles.walletTitle}>Số dư ví Thriftly</Text>
              </View>
              <TouchableOpacity
                style={styles.topUpButton}
                onPress={() => setIsDepositModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.topUpButtonText}>Nạp ví (PayOS)</Text>
              </TouchableOpacity>
            </View>
            {isWalletLoading ? (
              <ActivityIndicator color={Colors.primary} style={{ alignSelf: 'flex-start', marginVertical: 4 }} />
            ) : (
              <Text style={styles.walletBalance}>{formatVND(balance)}</Text>
            )}
          </View>
        )}

        <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push('/(tabs)/orders' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <CreditCard size={20} color={colors.textSecondary} />
              <Text style={[styles.menuText, { color: colors.text }]}>Quản lý đơn hàng mua & bán</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {isAuthenticated && (
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                if (user?.hasPassword === false) {
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setIsSetPasswordModalVisible(true);
                } else {
                  setOldPassword('');
                  setChangePasswordNew('');
                  setChangePasswordConfirm('');
                  setIsChangePasswordModalVisible(true);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <Lock size={20} color={user?.hasPassword === false ? '#f59e0b' : colors.textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuText, { color: colors.text }]}>Mật khẩu đăng nhập</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      marginTop: 2,
                      color: user?.hasPassword === false ? '#f59e0b' : colors.textSecondary,
                      fontWeight: user?.hasPassword === false ? '600' : '400',
                    }}
                  >
                    {user?.hasPassword === false
                      ? 'Chưa thiết lập (Bấm để tạo mật khẩu)'
                      : 'Đã thiết lập (Bấm để đổi mật khẩu)'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <ShieldCheck size={20} color={colors.textSecondary} />
              <Text style={[styles.menuText, { color: colors.text }]}>Chính sách & Bảo vệ người mua</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {isAuthenticated && (
            <TouchableOpacity style={styles.menuItem} onPress={logout} activeOpacity={0.7}>
              <View style={styles.menuLeft}>
                <LogOut size={20} color="#ef4444" />
                <Text style={[styles.menuText, { color: '#ef4444' }]}>Đăng xuất</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isDepositModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDepositModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Nạp tiền ví Thriftly</Text>
              <TouchableOpacity onPress={() => setIsDepositModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Thanh toán an toàn qua Cổng PayOS (Quét mã VietQR)
            </Text>

            <View style={styles.quickAmountRow}>
              {[50000, 100000, 200000, 500000].map((amt) => {
                const isSelected = depositAmount === String(amt);
                return (
                  <TouchableOpacity
                    key={amt}
                    style={[
                      styles.quickAmountBtn,
                      isSelected ? styles.quickAmountBtnActive : { borderColor: colors.border },
                    ]}
                    onPress={() => setDepositAmount(String(amt))}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        isSelected ? styles.quickAmountTextActive : { color: colors.textSecondary },
                      ]}
                    >
                      {formatVND(amt)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              placeholder="Nhập số tiền khác (VNĐ)"
              placeholderTextColor={colors.textSecondary}
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
              style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setIsDepositModalVisible(false)}
              >
                <Text style={{ color: colors.textSecondary }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.primary }]}
                onPress={handleDepositSubmit}
                disabled={payOsMutation.isPending}
              >
                {payOsMutation.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={{ color: '#ffffff', fontWeight: '700' }}>Tạo mã thanh toán</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isEditProfileVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditProfileVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Cập nhật thông tin</Text>
              <TouchableOpacity onPress={() => setIsEditProfileVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Họ và tên</Text>
              <TextInput
                placeholder="Nguyễn Văn A"
                placeholderTextColor={colors.textSecondary}
                value={editFullName}
                onChangeText={setEditFullName}
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Số điện thoại</Text>
              <TextInput
                placeholder="0912345678"
                placeholderTextColor={colors.textSecondary}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Địa chỉ giao hàng</Text>
              <TextInput
                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                placeholderTextColor={colors.textSecondary}
                value={editAddress}
                onChangeText={setEditAddress}
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setIsEditProfileVisible(false)}
              >
                <Text style={{ color: colors.textSecondary }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.primary }]}
                onPress={handleUpdateProfileSubmit}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={{ color: '#ffffff', fontWeight: '700' }}>Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isSetPasswordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSetPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Thiết lập mật khẩu đăng nhập</Text>
              <TouchableOpacity onPress={() => setIsSetPasswordModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Thiết lập mật khẩu trực tiếp để đăng nhập bằng Email &amp; Mật khẩu.
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Mật khẩu mới</Text>
              <TextInput
                placeholder="Ít nhất 6 ký tự"
                placeholderTextColor={colors.textSecondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Xác nhận mật khẩu</Text>
              <TextInput
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor={colors.textSecondary}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setIsSetPasswordModalVisible(false)}
                disabled={passwordActionLoading}
              >
                <Text style={{ color: colors.textSecondary }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.primary }]}
                onPress={handleSetPasswordSubmit}
                disabled={passwordActionLoading}
              >
                {passwordActionLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={{ color: '#ffffff', fontWeight: '700' }}>Thiết lập mật khẩu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isChangePasswordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsChangePasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Đổi mật khẩu tài khoản</Text>
              <TouchableOpacity onPress={() => setIsChangePasswordModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Mật khẩu hiện tại</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Mật khẩu mới</Text>
              <TextInput
                placeholder="Ít nhất 6 ký tự"
                placeholderTextColor={colors.textSecondary}
                value={changePasswordNew}
                onChangeText={setChangePasswordNew}
                secureTextEntry
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Xác nhận mật khẩu mới</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={changePasswordConfirm}
                onChangeText={setChangePasswordConfirm}
                secureTextEntry
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setIsChangePasswordModalVisible(false)}
                disabled={passwordActionLoading}
              >
                <Text style={{ color: colors.textSecondary }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.primary }]}
                onPress={handleChangePasswordSubmit}
                disabled={passwordActionLoading}
              >
                {passwordActionLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={{ color: '#ffffff', fontWeight: '700' }}>Đổi mật khẩu</Text>
                )}
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 6,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  editIconBtn: {
    padding: 8,
  },
  guestCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  guestIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  guestTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  guestSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  walletCard: {
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  topUpButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  topUpButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  walletBalance: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  menuSection: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
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
    fontSize: 17,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 13,
  },
  quickAmountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountBtn: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickAmountBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickAmountTextActive: {
    color: '#ffffff',
  },
  modalInputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
});
