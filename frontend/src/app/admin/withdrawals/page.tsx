'use client';

import { AdminTransactionResponse } from '@/features/admin/types/admin';
import { useAdminWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from '@/features/admin/hooks/useAdminWithdrawals';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { normalizePageResponse } from '@/lib/pagination';
import { PageHeader } from '@/components/patterns/page-header';
import { EmptyState, LoadingState } from '@/components/patterns/state-panel';
import { Badge } from '@/components/ui/badge';
import { DateTime, Money, NumberText } from '@/components/ui/typography';

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

  if (isLoading) return <LoadingState title="Đang tải danh sách rút tiền…" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Duyệt rút tiền"
        description={<>Tổng cộng <NumberText value={totalElements} /> yêu cầu</>}
        actions={<div className="flex items-center gap-4">
          <Badge tone="warning"><NumberText value={withdrawals.length} /> yêu cầu</Badge>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Lọc User hoặc nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:w-64"
              aria-label="Lọc yêu cầu rút tiền"
            />
          </div>
        </div>}
      />

      {withdrawals.length === 0 ? (
        <EmptyState title="Không có yêu cầu đang chờ" description="Hiện không có yêu cầu rút tiền nào đang chờ duyệt." icon={<CheckCircle2 className="size-9 text-success" />} />
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
                    <p className="text-xs text-muted-foreground">Yêu cầu lúc: <DateTime value={req.createdAt} /></p>
                  </div>
                </div>
                <div className="text-right">
                  <Money value={req.amount} className="text-2xl font-bold text-warning" />
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/10 p-4 text-foreground">
                      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-info" />
                      <div>
                        <p className="mb-1 text-sm font-bold text-info">Thông tin chuyển khoản:</p>
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
                      className="w-full"
                      size="lg"
                      onClick={() => handleApprove(req.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Đã chuyển khoản (Duyệt)
                    </Button>
                    <Button
                      className="w-full"
                      size="lg"
                      variant="destructive"
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
