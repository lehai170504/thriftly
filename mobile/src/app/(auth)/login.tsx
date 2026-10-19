import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, KeyRound } from 'lucide-react-native';
import { api } from '../../lib/api';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';

export default function LoginModal() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { login } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [isFirstLoginModalVisible, setIsFirstLoginModalVisible] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [initialPassword, setInitialPassword] = useState('');
  const [confirmInitialPassword, setConfirmInitialPassword] = useState('');
  const [settingPasswordLoading, setSettingPasswordLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    if (mode === 'REGISTER' && (!username.trim() || !fullName.trim())) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên tài khoản và họ tên');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'LOGIN') {
        const res = await api.post('/auth/login', {
          email: email.trim(),
          password,
        });
        await login(res.data);
        router.back();
      } else {
        const res = await api.post('/auth/register', {
          username: username.trim(),
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim(),
        });
        await login(res.data);
        Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
        router.back();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : null);
      Alert.alert(mode === 'LOGIN' ? 'Đăng nhập thất bại' : 'Đăng ký thất bại', msg || 'Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const redirectUrl = Linking.createURL('/auth/callback');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=default-google-client-id&response_type=id_token&scope=openid%20profile%20email&redirect_uri=${encodeURIComponent(
        redirectUrl
      )}&nonce=${Math.random().toString(36).substring(2)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      let token = '';
      if (result.type === 'success' && result.url) {
        const hashMatch = result.url.match(/id_token=([^&]+)/);
        if (hashMatch) {
          token = hashMatch[1];
        }
      }

      if (!token) {
        Alert.prompt
          ? Alert.prompt(
            'Đăng nhập Google',
            'Nhập Google ID Token hoặc chọn Tiếp tục để đăng nhập thử nghiệm:',
            [
              { text: 'Hủy', style: 'cancel' },
              {
                text: 'Đăng nhập',
                onPress: async (inputToken?: string) => {
                  if (inputToken && inputToken.trim()) {
                    await verifyAndProceedGoogleLogin(inputToken.trim());
                  }
                },
              },
            ],
            'plain-text'
          )
          : Alert.alert('Thông báo', 'Không thể kết nối dịch vụ Google OAuth');
        return;
      }

      await verifyAndProceedGoogleLogin(token);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể đăng nhập bằng Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const verifyAndProceedGoogleLogin = async (credential: string) => {
    try {
      setGoogleLoading(true);
      const res = await api.post('/auth/google-login', { credential });
      if (res.data.hasPassword === false) {
        setPendingUser(res.data);
        setIsFirstLoginModalVisible(true);
        return;
      }
      await login(res.data);
      router.back();
    } catch (err: any) {
      const msg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : null);
      Alert.alert('Đăng nhập Google thất bại', msg || 'Vui lòng kiểm tra lại');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSkipSetPassword = async () => {
    if (pendingUser) {
      await login(pendingUser);
    }
    setIsFirstLoginModalVisible(false);
    setPendingUser(null);
    router.back();
  };

  const handleConfirmSetPassword = async () => {
    if (!initialPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
      return;
    }
    if (initialPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (initialPassword !== confirmInitialPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setSettingPasswordLoading(true);
    try {
      await api.post('/users/me/set-password', { newPassword: initialPassword });
      if (pendingUser) {
        await login({ ...pendingUser, hasPassword: true });
      }
      setIsFirstLoginModalVisible(false);
      setPendingUser(null);
      Alert.alert('Thành công', 'Thiết lập mật khẩu thành công!');
      router.back();
    } catch (err: any) {
      const msg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : null);
      Alert.alert('Lỗi', msg || 'Không thể thiết lập mật khẩu');
    } finally {
      setSettingPasswordLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {mode === 'LOGIN' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.tabSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabButton, mode === 'LOGIN' && styles.tabButtonActive]}
            onPress={() => setMode('LOGIN')}
          >
            <Text style={[styles.tabText, mode === 'LOGIN' ? styles.tabTextActive : { color: colors.textSecondary }]}>
              Đăng nhập
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, mode === 'REGISTER' && styles.tabButtonActive]}
            onPress={() => setMode('REGISTER')}
          >
            <Text style={[styles.tabText, mode === 'REGISTER' ? styles.tabTextActive : { color: colors.textSecondary }]}>
              Đăng ký
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.brandTitle, { color: colors.text }]}>
          {mode === 'LOGIN' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
        </Text>
        <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
          {mode === 'LOGIN'
            ? 'Đăng nhập để tham gia đấu giá và mua sắm đồ cũ chất lượng cao.'
            : 'Đăng ký ngay để bắt đầu đấu giá và kết nối với cộng đồng.'}
        </Text>

        {mode === 'REGISTER' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Tên tài khoản</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <UserIcon size={18} color={colors.textSecondary} />
                <TextInput
                  placeholder="username"
                  placeholderTextColor={colors.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Họ và tên</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <UserIcon size={18} color={colors.textSecondary} />
                <TextInput
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor={colors.textSecondary}
                  value={fullName}
                  onChangeText={setFullName}
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
            </View>
          </>
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Mail size={18} color={colors.textSecondary} />
            <TextInput
              placeholder="example@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { color: colors.text }]}
            />
          </View>
        </View>

        {mode === 'REGISTER' && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Số điện thoại</Text>
            <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Phone size={18} color={colors.textSecondary} />
              <TextInput
                placeholder="0912345678"
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={[styles.input, { color: colors.text }]}
              />
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Mật khẩu</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Lock size={18} color={colors.textSecondary} />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, { color: colors.text }]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {mode === 'LOGIN' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>HOẶC</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleGoogleLogin}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <View style={styles.googleButtonContent}>
              <View style={styles.googleIconBadge}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={[styles.googleButtonText, { color: colors.text }]}>
                Đăng nhập với Google
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isFirstLoginModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleSkipSetPassword}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalIconCircle}>
              <ShieldCheck size={28} color={Colors.primary} />
            </View>

            <Text style={[styles.modalHeading, { color: colors.text }]}>
              Tạo mật khẩu để đăng nhập trực tiếp bằng Email &amp; Mật khẩu
            </Text>

            <Text style={[styles.modalSubheading, { color: colors.textSecondary }]}>
              Bạn đã đăng nhập lần đầu bằng Google. Bạn có thể thiết lập mật khẩu ngay bây giờ để thuận tiện đăng nhập sau này.
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nhập mật khẩu mới</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Lock size={18} color={colors.textSecondary} />
                <TextInput
                  placeholder="Ít nhất 6 ký tự"
                  placeholderTextColor={colors.textSecondary}
                  value={initialPassword}
                  onChangeText={setInitialPassword}
                  secureTextEntry
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nhập lại mật khẩu</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Lock size={18} color={colors.textSecondary} />
                <TextInput
                  placeholder="Xác nhận mật khẩu"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmInitialPassword}
                  onChangeText={setConfirmInitialPassword}
                  secureTextEntry
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={[styles.modalActionBtn, styles.modalSkipBtn, { borderColor: colors.border }]}
                onPress={handleSkipSetPassword}
                disabled={settingPasswordLoading}
              >
                <Text style={[styles.modalSkipBtnText, { color: colors.textSecondary }]}>Để sau / Bỏ qua</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtn, styles.modalConfirmBtn]}
                onPress={handleConfirmSetPassword}
                disabled={settingPasswordLoading}
              >
                {settingPasswordLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Thiết lập mật khẩu</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  placeholder: {
    width: 34,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  tabSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  googleButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ea4335',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  googleButtonText: {
    fontSize: 15,
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
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  modalSubheading: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  modalInputGroup: {
    marginBottom: 12,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalActionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSkipBtn: {
    borderWidth: 1,
  },
  modalSkipBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    backgroundColor: Colors.primary,
  },
  modalConfirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
