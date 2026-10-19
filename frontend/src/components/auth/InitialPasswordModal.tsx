'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { extractError } from '@/lib/utils';
import { useSetPassword } from '@/features/users/hooks/useUsers';

interface InitialPasswordModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function InitialPasswordModal({ isOpen, onComplete, onSkip }: InitialPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const setPasswordMutation = useSetPassword();

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
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
          toast.success('Thiết lập mật khẩu thành công! Giờ bạn có thể đăng nhập bằng email & mật khẩu.');
          onComplete();
        },
        onError: (error) => {
          toast.error(extractError(error, 'Không thể thiết lập mật khẩu'));
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onSkip(); }}>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-card border-border shadow-xl">
        <DialogHeader className="space-y-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto sm:mx-0">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Tạo mật khẩu để đăng nhập trực tiếp bằng Email &amp; Mật khẩu
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Bạn đã đăng nhập bằng tài khoản Google. Hãy thiết lập mật khẩu riêng để có thể chủ động đăng nhập trực tiếp trên mọi thiết bị bất cứ lúc nào.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSetPassword} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Nhập mật khẩu mới</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Ít nhất 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={setPasswordMutation.isPending}
                className="pr-10 h-11 rounded-xl bg-background border-border"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Nhập lại mật khẩu</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={setPasswordMutation.isPending}
                className="pr-10 h-11 rounded-xl bg-background border-border"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              disabled={setPasswordMutation.isPending}
              className="flex-1 h-11 rounded-xl font-medium"
            >
              Để sau / Bỏ qua
            </Button>
            <Button
              type="submit"
              disabled={setPasswordMutation.isPending}
              className="flex-1 h-11 rounded-xl font-bold gap-2 shadow-sm"
            >
              {setPasswordMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              {setPasswordMutation.isPending ? 'Đang lưu...' : 'Thiết lập mật khẩu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
