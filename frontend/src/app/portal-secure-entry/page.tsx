'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin, useVerify2Fa } from '@/features/auth/hooks/useAuthMutations';
import { loginSchema, LoginFormData } from '@/features/auth/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ShieldCheck, ArrowLeft, TerminalSquare } from 'lucide-react';
import { toast } from 'sonner';
import { extractError } from '@/lib/utils';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'LOGIN' | 'OTP'>('LOGIN');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    const pendingFromHash = new URLSearchParams(window.location.hash.slice(1)).get('email');
    if (pendingFromHash) {
      setPendingEmail(pendingFromHash);
      setStep('OTP');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN' || user.role === 'STAFF') {
        router.replace('/admin');
      } else {
        router.replace('/products');
      }
    }
  }, [user, router]);

  const { register, handleSubmit, control, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const loginMutation = useLogin();
  const verify2FaMutation = useVerify2Fa();

  const onSubmit = (data: LoginFormData) => {
    setIsLoading(true);
    loginMutation.mutate(data, {
      onSuccess: (responseData) => {
        if (responseData.requires2FA) {
          toast.info('Yêu cầu xác thực đã được tạo. Hãy kiểm tra email và thư mục Spam để nhận mã OTP.');
          setPendingEmail(responseData.email);
          setStep('OTP');
          setIsLoading(false);
          return;
        }

        if (responseData.role !== 'ADMIN' && responseData.role !== 'STAFF') {
          toast.error('Truy cập bị từ chối: Tài khoản không có quyền Admin/Staff!');
          setIsLoading(false);
          return;
        }
        toast.success('Đăng nhập Quản trị thành công!');
        login(responseData);
      },
      onError: (error: any) => {
        toast.error('Đăng nhập thất bại: ' + extractError(error));
        setIsLoading(false);
      }
    });
  };

  const onVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Vui lòng nhập đúng 6 số OTP');
      return;
    }
    setIsLoading(true);
    verify2FaMutation.mutate({ email: pendingEmail, otp }, {
      onSuccess: (responseData) => {
        toast.success('Xác thực thành công!');
        login(responseData);
      },
      onError: (error: any) => {
        toast.error('Xác thực thất bại: ' + extractError(error));
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Column - Branding/Illustration */}
      <div className="hidden lg:flex flex-1 flex-col bg-zinc-950 text-zinc-50 relative overflow-hidden items-center justify-center p-12">
        {/* Abstract shapes */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-md text-xs font-medium text-zinc-300 mb-4 mx-auto">
            <TerminalSquare className="w-4 h-4 text-primary" />
            Hệ thống Quản trị & Điều hành v2.0
          </div>

          <h2 className="text-4xl lg:text-5xl font-heading font-bold leading-tight tracking-tight text-white">
            Quản lý sàn thương mại điện tử <span className="text-primary">thông minh</span> & <span className="text-primary">hiệu quả</span>.
          </h2>

          <p className="text-lg text-zinc-400 font-medium max-w-xl mx-auto leading-relaxed">
            Công cụ mạnh mẽ giúp bạn theo dõi doanh thu, xử lý khiếu nại, và đảm bảo hệ thống vận hành trơn tru mỗi ngày.
          </p>
        </div>

        {/* Dashboard Mockup Placeholder */}
        <div className="mt-16 w-full max-w-3xl rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-2 shadow-2xl relative z-10 -rotate-2 hover:rotate-0 transition-transform duration-500">
          <div className="rounded-lg bg-zinc-950 border border-zinc-800 h-64 w-full flex flex-col overflow-hidden">
            <div className="h-10 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="flex-1 p-6 flex gap-4">
              <div className="w-1/4 h-full flex flex-col gap-3">
                <div className="h-4 w-full bg-zinc-800 rounded-md"></div>
                <div className="h-4 w-3/4 bg-zinc-800 rounded-md"></div>
                <div className="h-4 w-5/6 bg-zinc-800 rounded-md"></div>
              </div>
              <div className="flex-1 h-full flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="h-20 flex-1 bg-zinc-800 rounded-lg"></div>
                  <div className="h-20 flex-1 bg-zinc-800 rounded-lg"></div>
                  <div className="h-20 flex-1 bg-primary/20 rounded-lg border border-primary/30"></div>
                </div>
                <div className="flex-1 w-full bg-zinc-800 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center px-8 sm:px-16 md:px-24 border-l border-border shadow-2xl z-10 bg-background relative">
        <div className="absolute top-8 right-8">
          <a href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Quay lại cửa hàng <ArrowLeft className="w-4 h-4 rotate-180" />
          </a>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="flex flex-col gap-2 mb-10">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">
              {step === 'LOGIN' ? 'Admin Portal' : 'Xác thực 2 lớp'}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              {step === 'LOGIN' ? 'Đăng nhập để quản lý hệ thống Thriftly.' : `Kiểm tra email ${pendingEmail} và thư mục Spam để nhận mã xác nhận (OTP).`}
            </p>
          </div>

          {step === 'LOGIN' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-foreground">Email hoặc Username</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="email"
                      placeholder="admin@thriftly.com"
                      {...field}
                      value={field.value || ''}
                      className={`h-11 bg-background border-border rounded-lg ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                  )}
                />
                {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-semibold text-foreground">Mật khẩu</Label>
                </div>
                <div className="relative">
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        value={field.value || ''}
                        className={`h-11 pr-10 bg-background border-border rounded-lg ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                    )}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    shape="pill"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
                {errors.password && <p className="text-red-500 text-xs font-medium">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-lg mt-4 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
              </Button>
            </form>
          ) : (
            <form onSubmit={onVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="otp" className="font-semibold text-foreground">Mã OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Nhập 6 số OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="h-11 bg-background border-border rounded-lg text-center tracking-widest text-lg font-bold"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-foreground hover:bg-foreground/90 text-background font-semibold rounded-lg mt-4 transition-all active:scale-[0.98]"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? 'Đang xác minh...' : 'Xác nhận'}
              </Button>
              <div className="text-center mt-4">
                <Button
                  variant="link"
                  type="button"
                  onClick={() => {
                    setStep('LOGIN');
                    setOtp('');
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Quay lại đăng nhập
                </Button>
              </div>
            </form>
          )}

          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground font-medium">
              &copy; 2026 Thriftly OS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
