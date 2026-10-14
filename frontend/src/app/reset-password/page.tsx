'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResetPassword } from '@/features/auth/hooks/useAuthMutations';
import { resetPasswordSchema, ResetPasswordFormData } from '@/features/auth/schemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { extractError } from '@/lib/utils';
import { BrandWordmark } from '@/components/layout/BrandWordmark';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const mutation = useResetPassword();

  const onSubmit = (data: ResetPasswordFormData) => {
    setIsLoading(true);
    mutation.mutate({
      email: defaultEmail,
      otp: data.otp,
      newPassword: data.newPassword
    }, {
      onSuccess: () => {
        toast.success('Mật khẩu của bạn đã được đặt lại thành công!');
        router.push('/login');
      },
      onError: (error: any) => {
        toast.error('Có lỗi xảy ra: ' + extractError(error));
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="dark hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-muted/40">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=1200")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/85" />
        <div className="relative z-10">
          <BrandWordmark className="hover:opacity-90" />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="w-full max-w-[400px] relative z-10">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandWordmark />
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-foreground mb-1">
              Đặt lại mật khẩu
            </h1>
            <p className="text-muted-foreground text-sm">Mã OTP đã gửi đến: <strong className="text-foreground">{defaultEmail}</strong></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Mã xác nhận (OTP)</Label>
              <Input
                placeholder="Nhập mã 6 số"
                maxLength={6}
                {...register('otp')}
                className={`h-11 bg-background text-sm text-center tracking-widest font-bold text-lg rounded-xl ${errors.otp ? 'border-destructive ring-1 ring-destructive/30' : ''}`}
              />
              {errors.otp && <p className="text-destructive text-xs mt-1 text-center">{errors.otp.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register('newPassword')}
                  className={`h-11 bg-background text-sm pr-9 rounded-xl ${errors.newPassword ? 'border-destructive ring-1 ring-destructive/30' : ''}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  shape="pill"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground h-7 w-7"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {errors.newPassword && <p className="text-destructive text-xs mt-1">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={`h-11 bg-background text-sm pr-9 rounded-xl ${errors.confirmPassword ? 'border-destructive ring-1 ring-destructive/30' : ''}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  shape="pill"
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground h-7 w-7"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold shadow-xs transition-all mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Đổi mật khẩu <ArrowRight size={16} className="ml-1.5" /></>
              )}
            </Button>
          </form>

          <div className="text-center mt-8">
            <p className="text-muted-foreground text-sm">
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Quay lại đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
