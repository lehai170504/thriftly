/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister, useGoogleLogin, useFacebookLogin } from '@/features/auth/hooks/useAuthMutations';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { registerSchema, RegisterFormData } from '@/features/auth/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { extractError } from '@/lib/utils';
import { BrandWordmark } from '@/components/layout/BrandWordmark';

export default function RegisterPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        router.replace('/admin');
      } else {
        router.replace('/products');
      }
    }
  }, [user, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const registerMutation = useRegister();
  const googleLoginMutation = useGoogleLogin();
  const facebookLoginMutation = useFacebookLogin();

  const onRegister = (data: RegisterFormData) => {
    setIsLoading(true);
    registerMutation.mutate(data, {
      onSuccess: (responseData) => {
        toast.success('Đăng ký thành công! Đang tự động đăng nhập...');
        login(responseData);
      },
      onError: (error: any) => {
        toast.error('Đăng ký thất bại: ' + extractError(error));
        setIsLoading(false);
      }
    });
  };

  const onGoogleLoginSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      googleLoginMutation.mutate(credentialResponse.credential, {
        onSuccess: (responseData) => {
          toast.success('Đăng nhập Google thành công!');
          login(responseData);
          router.push('/products');
        },
        onError: (error: any) => {
          toast.error('Đăng nhập Google thất bại: ' + extractError(error));
        }
      });
    }
  };

  const onGoogleLoginError = () => {
    toast.error('Không thể kết nối với Google.');
  };

  const onFacebookLoginSuccess = (response: any) => {
    if (response.accessToken) {
      facebookLoginMutation.mutate(response.accessToken, {
        onSuccess: (responseData) => {
          toast.success('Đăng nhập Facebook thành công!');
          login(responseData);
          router.push('/products');
        },
        onError: (error: any) => {
          toast.error('Đăng nhập Facebook thất bại: ' + extractError(error));
        }
      });
    }
  };

  const onFacebookLoginError = () => {
    toast.error('Đăng nhập Facebook thất bại.');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="dark hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-muted/40">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/70 to-black/85" />

        <div className="relative z-10">
          <BrandWordmark className="hover:opacity-90" />
        </div>

        <div className="relative z-10 mb-10">
          <div className="bg-card/90 border border-border p-8 rounded-2xl shadow-xl max-w-md">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">Gia nhập cộng đồng</Badge>
            <p className="text-xl font-medium text-foreground leading-snug mb-6">
              "Bắt đầu hành trình săn những món đồ độc lạ và tiết kiệm với Thriftly ngay hôm nay."
            </p>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border border-border object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="User 1" />
                <img className="w-8 h-8 rounded-full border border-border object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="User 2" />
                <img className="w-8 h-8 rounded-full border border-border object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64" alt="User 3" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">+10k thành viên mua bán</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden overflow-y-auto">
        <div className="w-full max-w-[400px] relative z-10 my-auto py-6">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandWordmark />
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-foreground mb-1">
              Tạo tài khoản mới
            </h1>
            <p className="text-muted-foreground text-sm">Đăng ký để khám phá và mua bán đồ cũ chất lượng</p>
          </div>

          <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
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

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Tên đăng nhập</Label>
              <Input
                placeholder="tennguoidung"
                {...register('username')}
                className={`h-11 bg-background text-sm rounded-xl ${errors.username ? 'border-destructive ring-1 ring-destructive/30' : ''}`}
              />
              {errors.username && <p className="text-destructive text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register('password')}
                    className={`h-11 bg-background text-sm pr-9 rounded-xl ${errors.password ? 'border-destructive ring-1 ring-destructive/30' : ''}`}
                  />
                  <Button type="button" variant="ghost" size="icon" shape="pill" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground h-7 w-7">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Xác nhận</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className={`h-11 bg-background text-sm pr-9 rounded-xl ${errors.confirmPassword ? 'border-destructive ring-1 ring-destructive/30' : ''}`}
                  />
                  <Button type="button" variant="ghost" size="icon" shape="pill" aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground h-7 w-7">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold shadow-xs transition-all mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Bắt đầu ngay"
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center justify-center space-x-3">
            <div className="h-[1px] bg-border flex-1"></div>
            <span className="text-xs font-medium text-muted-foreground px-2">HOẶC ĐĂNG KÝ VỚI</span>
            <div className="h-[1px] bg-border flex-1"></div>
          </div>

          <div className="flex flex-col gap-2.5 justify-center w-full [&>div]:w-full [&>div]:flex [&>div]:justify-center">
            <GoogleLogin
              onSuccess={onGoogleLoginSuccess}
              onError={onGoogleLoginError}
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
              shape="rectangular"
            />
            <FacebookLogin
              appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''}
              onSuccess={onFacebookLoginSuccess}
              onFail={onFacebookLoginError}
              render={({ onClick }) => (
                <Button
                  onClick={onClick}
                  type="button"
                  variant="outline"
                  className="w-full h-10 border-border text-foreground hover:bg-accent rounded-xl font-medium text-sm shadow-2xs"
                >
                  <svg className="mr-2 w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  Tiếp tục với Facebook
                </Button>
              )}
            />
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground text-sm">
              Đã có tài khoản?{' '}
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
