'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForgotPassword } from '@/features/auth/hooks/useAuthMutations';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/features/auth/schemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { extractError } from '@/lib/utils';
import { BrandWordmark } from '@/components/layout/BrandWordmark';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const mutation = useForgotPassword();

  const onSubmit = (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    mutation.mutate(data.email, {
      onSuccess: (_, variables) => {
        toast.success('Mã OTP đã được gửi đến email của bạn!');
        router.push(`/reset-password?email=${encodeURIComponent(variables)}`);
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
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=1200")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/85" />

        <div className="relative z-10">
          <BrandWordmark className="hover:opacity-90" />
        </div>

        <div className="relative z-10 mb-10">
          <div className="bg-card/90 border border-border p-8 rounded-2xl shadow-xl max-w-md">
            <Lock className="text-primary w-8 h-8 mb-4" />
            <p className="text-xl font-medium text-foreground leading-snug mb-2">
              "Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại quyền truy cập tài khoản một cách an toàn và nhanh chóng."
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="w-full max-w-[400px] relative z-10">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandWordmark />
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-foreground mb-1">
              Quên mật khẩu?
            </h1>
            <p className="text-muted-foreground text-sm">Nhập email đăng ký để nhận mã OTP khôi phục</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Địa chỉ Email</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                {...register('email')}
                className={`h-11 bg-background text-sm rounded-xl ${errors.email ? 'border-destructive ring-1 ring-destructive/30' : ''}`}
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold shadow-xs transition-all mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Gửi mã OTP <ArrowRight size={16} className="ml-1.5" /></>
              )}
            </Button>
          </form>

          <div className="text-center mt-8">
            <p className="text-muted-foreground text-sm">
              Nhớ mật khẩu rồi?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
