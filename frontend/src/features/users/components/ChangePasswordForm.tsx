'use client';

import { useState } from 'react';
import { useProfile, useChangePassword, useSetPassword } from '@/features/users/hooks/useUsers';
import { LockKeyhole, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { extractError } from '@/lib/utils';

export function ChangePasswordForm() {
  const { data: profile } = useProfile();
  const changePasswordMutation = useChangePassword();
  const setPasswordMutation = useSetPassword();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreatingPassword, setIsCreatingPassword] = useState(false);

  const isPasswordUnset = profile?.hasPassword === false;

  const handleSetInitialPassword = () => {
    if (!newPassword) {
      toast.error('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setPasswordMutation.mutate(
      { newPassword },
      {
        onSuccess: () => {
          toast.success('Thiết lập mật khẩu thành công!');
          setNewPassword('');
          setConfirmPassword('');
          setIsCreatingPassword(false);
        },
        onError: (error) => {
          toast.error('Lỗi: ' + extractError(error));
        }
      }
    );
  };

  const handleChangePassword = () => {
    if (!newPassword || !confirmPassword || !oldPassword) {
      toast.error('Vui lòng điền đầy đủ các trường');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }
    if (oldPassword === newPassword) {
      toast.error('Mật khẩu mới không được trùng với mật khẩu cũ');
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword: oldPassword, newPassword },
      {
        onSuccess: () => {
          toast.success('Đổi mật khẩu thành công!');
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: (error) => {
          toast.error('Lỗi: ' + extractError(error));
        }
      }
    );
  };

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <LockKeyhole className="w-5 h-5 text-primary" /> Bảo mật tài khoản
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Bảo vệ tài khoản của bạn bằng cách sử dụng mật khẩu mạnh.
        </p>
      </div>

      <div className="mb-6 p-4 rounded-xl border border-border bg-muted/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {isPasswordUnset ? (
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                Mật khẩu đăng nhập:{' '}
                {isPasswordUnset ? (
                  <span className="text-amber-500 font-bold">Chưa thiết lập</span>
                ) : (
                  <span className="text-emerald-500 font-bold">Đã thiết lập</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isPasswordUnset
                  ? 'Tài khoản đăng nhập qua mạng xã hội, chưa có mật khẩu trực tiếp.'
                  : 'Bạn có thể đổi mật khẩu bất cứ lúc nào.'}
              </p>
            </div>
          </div>
          {isPasswordUnset && !isCreatingPassword && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreatingPassword(true)}
              className="rounded-lg text-xs font-semibold shrink-0 border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
            >
              Bấm để tạo mật khẩu
            </Button>
          )}
        </div>
      </div>

      {isPasswordUnset ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Mật khẩu mới</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              className="bg-background/50 border-border h-11 rounded-xl focus-visible:ring-primary transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Xác nhận mật khẩu mới</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-background/50 border-border h-11 rounded-xl focus-visible:ring-primary transition-colors"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              className="rounded-xl px-8 h-11 font-bold w-full md:w-auto shadow-sm hover:shadow-md transition-all gap-2"
              onClick={handleSetInitialPassword}
              disabled={setPasswordMutation.isPending || !newPassword || !confirmPassword}
            >
              <KeyRound className="w-4 h-4" />
              {setPasswordMutation.isPending ? 'Đang xử lý...' : 'Thiết lập mật khẩu'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Mật khẩu cũ</label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-background/50 border-border h-11 rounded-xl focus-visible:ring-primary transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Mật khẩu mới</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-background/50 border-border h-11 rounded-xl focus-visible:ring-primary transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Xác nhận mật khẩu mới</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-background/50 border-border h-11 rounded-xl focus-visible:ring-primary transition-colors"
            />
          </div>

          <div className="pt-2">
            <Button
              className="rounded-xl px-8 h-11 font-bold w-full md:w-auto shadow-sm hover:shadow-md transition-all"
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending || !oldPassword || !newPassword || !confirmPassword}
            >
              {changePasswordMutation.isPending ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
