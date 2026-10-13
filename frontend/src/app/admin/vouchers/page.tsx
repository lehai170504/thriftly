'use client';

import { useState } from 'react';
import { useAdminVouchers } from '@/features/admin/hooks/useAdminVouchers';
import { Plus, Power, PowerOff, Trash2, Tag, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { VoucherFormModal } from '@/features/admin/components/VoucherFormModal';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/patterns/page-header';
import { EmptyState, LoadingState } from '@/components/patterns/state-panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { DateTime, Money, NumberText } from '@/components/ui/typography';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function AdminVouchersPage() {
  const { vouchers, isLoading, toggleStatus, deleteVoucher } = useAdminVouchers();
  const [isCreating, setIsCreating] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    try {
      await toggleStatus.mutateAsync(id);
      toast.success('Cập nhật trạng thái thành công');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!voucherToDelete) return;
    try {
      await deleteVoucher.mutateAsync(voucherToDelete);
      toast.success('Xóa mã giảm giá thành công');
      setVoucherToDelete(null);
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (isLoading) return <LoadingState title="Đang tải danh sách mã giảm giá…" />;

  return (
    <div className="page-container space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Mã giảm giá sàn" description="Quản lý các chiến dịch khuyến mãi toàn hệ thống" actions={<Button
          onClick={() => setIsCreating(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo Mã Mới
        </Button>} />

      <VoucherFormModal isOpen={isCreating} onClose={() => setIsCreating(false)} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vouchers.map(voucher => (
          <div key={voucher.id} className="glass rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300">
            <div className={`p-4 border-b border-border/50 flex justify-between items-center ${voucher.active ? 'bg-primary/5' : 'bg-muted/10'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${voucher.active ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
                  {voucher.type === 'PERCENTAGE' ? <Percent className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight uppercase">{voucher.code}</h3>
                  <StatusBadge domain="voucher" status={voucher.active ? 'ACTIVE' : 'INACTIVE'} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleToggle(voucher.id)}
                  title={voucher.active ? 'Tắt mã này' : 'Bật mã này'}
                  shape="pill"
                  aria-label={voucher.active ? `Tắt mã ${voucher.code}` : `Bật mã ${voucher.code}`}
                >
                  {voucher.active ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setVoucherToDelete(voucher.id)}
                  title="Xóa mã"
                  shape="pill"
                  className="text-destructive"
                  aria-label={`Xóa mã ${voucher.code}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mức giảm:</span>
                <span className="font-bold text-primary">
                  {voucher.type === 'PERCENTAGE'
                    ? <>{voucher.discountValue}% (Tối đa <Money value={voucher.maxDiscount} />)</>
                    : <Money value={voucher.discountValue} />}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đơn tối thiểu:</span>
                <Money value={voucher.minOrderValue} className="font-medium" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số lượng còn lại:</span>
                <span className="font-medium"><NumberText value={voucher.quantity} /> lượt</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hết hạn:</span>
                <DateTime value={voucher.expiryDate} className="font-medium text-destructive" />
              </div>
            </div>
          </div>
        ))}

        {vouchers.length === 0 && (
          <div className="col-span-full"><EmptyState title="Chưa có mã giảm giá nào" description="Hãy tạo mã đầu tiên để bắt đầu chiến dịch." icon={<Tag className="size-8" />} /></div>
        )}
      </div>
      <ConfirmDialog
        isOpen={Boolean(voucherToDelete)}
        onOpenChange={(open) => { if (!open) setVoucherToDelete(null); }}
        title="Xóa mã giảm giá"
        description="Mã giảm giá sẽ bị xóa khỏi hệ thống. Hành động này không thể hoàn tác."
        confirmText="Xóa mã"
        onConfirm={handleDelete}
        isLoading={deleteVoucher.isPending}
        variant="destructive"
      />
    </div>
  );
}
