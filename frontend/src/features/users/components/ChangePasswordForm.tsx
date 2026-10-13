'use client';

import { useState } from 'react';
import { useChangePassword } from '@/features/users/hooks/useUsers';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { extractError } from '@/lib/utils';

export function ChangePasswordForm() {
  const changePasswordMutation = useChangePassword();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }

    if (oldPassword === newPassword) {
      toast.error('Mật khẩu mới không được trùng với mật khẩu cũ');
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword: oldPassword, newPassword: newPassword },
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
    </div>
  );
}
