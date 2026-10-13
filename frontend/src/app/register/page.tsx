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
import { Badge, Eye, EyeOff, Star } from 'lucide-react';
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
      {/* Left Column - Image Banner */}
      <div className="dark hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200")' }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />

        {/* Content */}
        <div className="relative z-10">
          <BrandWordmark className="hover:opacity-90" />
        </div>

        <div className="relative z-10 mb-10">
          <div className="bg-background/20 backdrop-blur-xl border border-border p-8 rounded-[2rem] shadow-2xl max-w-md">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none mb-4">Gia nhập cộng đồng</Badge>
            <p className="text-2xl font-medium text-foreground leading-snug mb-6 drop-shadow-sm">
              "Bắt đầu hành trình săn những món đồ độc lạ và tiết kiệm với Thriftly ngay hôm nay."
            </p>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                <img className="w-8 h-8 rounded-full border-2 border-border object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="User 1" />
                <img className="w-8 h-8 rounded-full border-2 border-border object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64" alt="User 2" />
                <img className="w-8 h-8 rounded-full border-2 border-border object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64" alt="User 3" />
              </div>
              <p className="text-sm text-foreground/80 font-medium">+10k thành viên</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden overflow-y-auto">
        {/* Mobile Background Elements */}
        <div className="lg:hidden absolute top-0 right-0 -z-10 w-[600px] h-[600px] opacity-20 blur-[120px] rounded-full bg-gradient-to-tr from-primary to-blue-600 translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
        <div className="lg:hidden absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] opacity-20 blur-[120px] rounded-full bg-gradient-to-tr from-blue-600 to-transparent -translate-x-1/2 translate-y-1/3 pointer-events-none"></div>

        <div className="w-full max-w-[420px] relative z-10 my-auto py-8">
          <div className="mb-10 flex justify-center lg:hidden">
            <BrandWordmark />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-foreground mb-2">
              Tạo tài khoản mới
            </h1>
            <p className="text-muted-foreground text-lg">Đăng ký để khám phá vô vàn sản phẩm</p>
          </div>

          <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
            <div className="space-y-2 group">
              <Label className="text-foreground font-semibold group-focus-within:text-primary transition-colors">Địa chỉ Email</Label>
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                {...register('email')}
                className={`h-14 bg-background/50 border-border focus:bg-background text-base rounded-[24px] glass transition-all duration-300 ${errors.email ? 'border-red-500 ring-1 ring-red-500/20' : 'hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
              />
              {errors.email && <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2 group">
              <Label className="text-foreground font-semibold group-focus-within:text-primary transition-colors">Tên hiển thị</Label>
              <Input
                placeholder="Tên độc nhất của bạn"
                {...register('username')}
                className={`h-14 bg-background/50 border-border focus:bg-background text-base rounded-[24px] glass transition-all duration-300 ${errors.username ? 'border-red-500 ring-1 ring-red-500/20' : 'hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
              />
              {errors.username && <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-1">{errors.username.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <Label className="text-foreground font-semibold group-focus-within:text-primary transition-colors">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register('password')}
                    className={`h-14 bg-background/50 border-border focus:bg-background text-base pr-10 rounded-[24px] glass transition-all duration-300 ${errors.password ? 'border-red-500 ring-1 ring-red-500/20' : 'hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-2 group">
                <Label className="text-foreground font-semibold group-focus-within:text-primary transition-colors">Xác nhận</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className={`h-14 bg-background/50 border-border focus:bg-background text-base pr-10 rounded-[24px] glass transition-all duration-300 ${errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500/20' : 'hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10'}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm font-medium animate-in slide-in-from-top-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[24px] shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] text-lg font-bold transition-all hover:-translate-y-0.5 mt-6"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Bắt đầu ngay"
              )}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="h-[1px] bg-muted/80 flex-1"></div>
            <span className="text-sm font-bold text-muted-foreground px-2 tracking-wider">HOẶC ĐĂNG KÝ VỚI</span>
            <div className="h-[1px] bg-muted/80 flex-1"></div>
          </div>

          <div className="mt-6 flex flex-col gap-3 justify-center w-full [&>div]:w-full [&>div]:flex [&>div]:justify-center">
            <GoogleLogin
              onSuccess={onGoogleLoginSuccess}
              onError={onGoogleLoginError}
              theme="filled_black"
              size="large"
              width="100%"
              text="continue_with"
              shape="pill"
            />
            <FacebookLogin
              appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''}
              onSuccess={onFacebookLoginSuccess}
              onFail={onFacebookLoginError}
              render={({ onClick }) => (
                <Button
                  onClick={onClick}
                  type="button"
                  className="w-full h-[40px] bg-[#1877F2] hover:bg-[#1877F2]/90 text-white rounded-full font-medium shadow-sm transition-all"
                >
                  <svg className="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  Tiếp tục với Facebook
                </Button>
              )}
            />
          </div>

          <div className="text-center mt-10">
            <p className="text-muted-foreground font-medium text-base">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
