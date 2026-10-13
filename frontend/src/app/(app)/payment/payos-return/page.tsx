'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock3, XCircle, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { usePaymentIntentStatus, useVerifyPayOSPayment } from '@/features/wallet/hooks/useWallet';

function PayOSReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<'loading' | 'processing' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xác thực giao dịch...');

  const query = searchParams.toString();
  const orderCode = searchParams.get('orderCode') || '';
  const { data: res, error, isLoading } = useVerifyPayOSPayment(query);
  const intent = usePaymentIntentStatus(orderCode, !!res?.success);

  useEffect(() => {
    if (!query) {
      setStatus('error');
      setMessage('Không tìm thấy thông tin giao dịch');
      return;
    }
    if (isLoading) {
      setStatus('loading');
      setMessage('Đang xác thực giao dịch...');
      return;
    }
    if (error) {
      setStatus('error');
      setMessage((error as any).response?.data?.message || 'Có lỗi xảy ra khi xác thực giao dịch');
      return;
    }
    if (res) {
      if (res.success) {
        setStatus('processing');
        setMessage(res.message || 'PayOS đã tiếp nhận giao dịch. Số dư sẽ được cập nhật sau khi hệ thống xác nhận webhook.');
        void queryClient.invalidateQueries({ queryKey: ['wallet'] });
      } else {
        setStatus('error');
        setMessage(res.message || 'Giao dịch thất bại');
      }
    }
  }, [query, res, error, isLoading, queryClient]);

  useEffect(() => {
    if (!intent.data) return;
    if (intent.data.status === 'SUCCESS') {
      setStatus('success');
      setMessage('Thanh toán đã được xác nhận và số dư ví đã được cập nhật.');
      void queryClient.invalidateQueries({ queryKey: ['wallet'] });
    } else if (intent.data.status === 'FAILED' || intent.data.status === 'CANCELLED') {
      setStatus('error');
      setMessage('Giao dịch không hoàn tất. Ví của bạn không bị cộng tiền.');
    }
  }, [intent.data, queryClient]);

  return (
    <div className="w-full max-w-md bg-background/50 rounded-[24px] shadow-xl border border-border glass p-8 text-center space-y-6">

      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <h2 className="text-xl font-bold text-foreground">Đang xử lý giao dịch</h2>
          <p className="text-muted-foreground text-sm">Vui lòng không đóng trình duyệt trong lúc này...</p>
        </div>
      )}

      {status === 'processing' && (
        <div className="flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-400 mb-2">
            <Clock3 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Đang xác nhận thanh toán</h2>
          <p className="text-muted-foreground text-sm">{message}</p>
          <p className="text-xs text-muted-foreground">
            Không cần thanh toán lại. Nếu số dư chưa đổi, vui lòng chờ một lát rồi kiểm tra lại ví.
          </p>
          <Button
            className="w-full mt-4 rounded-[24px] h-12 font-bold"
            onClick={() => router.push('/wallet')}
          >
            Quay về Ví điện tử
          </Button>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-2">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Thanh toán thành công</h2>
          <p className="text-muted-foreground text-sm">{message}</p>
          <Button
            className="w-full mt-4 rounded-[24px] h-12 font-bold"
            onClick={() => router.push('/wallet')}
          >
            Xem Ví điện tử
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-400 mb-2">
            <XCircle className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Giao dịch thất bại</h2>
          <p className="text-muted-foreground text-sm">{message}</p>
          <Button
            variant="outline"
            className="w-full mt-4 rounded-[24px] h-12 font-bold text-foreground"
            onClick={() => router.push('/wallet')}
          >
            Quay lại
          </Button>
        </div>
      )}
    </div>
  );
}

export default function PayOSReturnPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <h2 className="text-xl font-bold text-foreground">Đang tải...</h2>
        </div>
      }>
        <PayOSReturnContent />
      </Suspense>
    </div>
  );
}
