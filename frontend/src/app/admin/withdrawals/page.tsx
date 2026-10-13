'use client';

import { AdminTransactionResponse } from '@/features/admin/types/admin';
import { useAdminWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from '@/features/admin/hooks/useAdminWithdrawals';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Banknote, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { normalizePageResponse } from '@/lib/pagination';

export default function AdminWithdrawalsPage() {
  const [page, setPage] = useState(0);
  const size = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'destructive' | 'default';
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => { },
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: withdrawalsData, isLoading } = useAdminWithdrawals(page, size, debouncedSearchTerm);

  const { content: withdrawals, totalPages, totalElements } = normalizePageResponse<AdminTransactionResponse>(withdrawalsData);

  const approveMutation = useApproveWithdrawal();
  const rejectMutation = useRejectWithdrawal();

  const handleApprove = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận chuyển khoản',
      description: 'Bạn đã CHUYỂN KHOẢN cho User này chưa? Bấm OK sẽ trừ tiền trong ví của họ vĩnh viễn!',
      onConfirm: () => {
        approveMutation.mutate(id, {
          onSuccess: () => {
            toast.success('Đã duyệt yêu cầu rút tiền thành công!');
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          },
          onError: () => toast.error('Có lỗi xảy ra khi duyệt'),
        });
      },
      variant: 'destructive'
    });
  };

  const handleReject = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Từ chối yêu cầu',
      description: 'Từ chối yêu cầu này? Tiền sẽ được hoàn lại vào ví của User.',
      onConfirm: () => {
        rejectMutation.mutate(id, {
          onSuccess: () => {
            toast.success('Đã từ chối và hoàn tiền lại cho user!');
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          },
          onError: () => toast.error('Có lỗi xảy ra khi từ chối'),
        });
      },
      variant: 'destructive'
    });
  };

  if (isLoading) return <div className="p-8 text-center text-neutral-500 font-medium">Đang tải danh sách rút tiền...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 rounded-[24px] glass border border-orange-500/20">
            <Banknote className="w-7 h-7 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Duyệt Rút Tiền</h1>
            <p className="text-muted-foreground text-sm">Tổng cộng <span className="font-bold text-foreground">{totalElements}</span> yêu cầu</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-[24px] font-bold flex items-center gap-2 text-sm whitespace-nowrap">
            <Clock className="w-4 h-4" />
            {withdrawals.length} Yêu cầu
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Lọc User hoặc nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full md:w-64 rounded-[24px] bg-background/50 border-border glass"
            />
          </div>
        </div>
      </div>

      {withdrawals.length === 0 ? (
        <Card className="border-dashed bg-background/50 border-border glass rounded-[24px]">
          <CardContent className="py-16 text-center text-muted-foreground flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500/30 mb-4" />
            <h3 className="text-xl font-bold text-foreground">Tuyệt vời!</h3>
            <p>Hiện không có yêu cầu rút tiền nào đang chờ duyệt.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {withdrawals.map((req) => (
            <Card key={req.id} className="overflow-hidden bg-background/50 border-border glass rounded-[24px] shadow-lg">
              <div className="bg-orange-500/5 p-4 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center border border-border text-orange-400 font-bold">
                    {req.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">User: {req.username}</h3>
                    <p className="text-xs text-muted-foreground">Yêu cầu lúc: {new Date(req.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-400">
                    {formatCurrency(req.amount)}
                  </p>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 p-4 rounded-[24px]">
                      <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold mb-1 text-blue-400">Thông tin chuyển khoản:</p>
                        <p className="text-lg font-mono tracking-tight bg-background/50 border-border glass px-3 py-2 rounded-xl inline-block mb-2 text-foreground">
                          {req.description}
                        </p>
                        <p className="text-xs opacity-80">
                          * Admin vui lòng copy thông tin trên để chuyển khoản thủ công cho User qua App Ngân hàng.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[200px] justify-center">
                    <Button
                      className="w-full h-12 text-md font-bold rounded-[24px]"
                      onClick={() => handleApprove(req.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Đã chuyển khoản (Duyệt)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20 rounded-[24px]"
                      onClick={() => handleReject(req.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Từ chối & Hoàn tiền
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-[24px]"
          >
            Trang trước
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Trang {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="rounded-[24px]"
          >
            Trang sau
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onOpenChange={(isOpen) => setConfirmDialog((prev) => ({ ...prev, isOpen }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
        isLoading={approveMutation.isPending || rejectMutation.isPending}
      />
    </div>
  );
}
