'use client';

import { useState } from 'react';
import { CreateVoucherRequest } from '@/features/admin/types/admin';
import { useAdminVouchers } from '@/features/admin/hooks/useAdminVouchers';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { extractError } from '@/lib/utils';
import { NativeSelect } from '@/components/ui/native-select';

interface VoucherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoucherFormModal({ isOpen, onClose }: VoucherFormModalProps) {
  const { createVoucher } = useAdminVouchers();

  const [formData, setFormData] = useState<CreateVoucherRequest>(() => ({
    code: '',
    type: 'PERCENTAGE',
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: undefined,
    quantity: 100,
    usageLimitPerUser: 1,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T23:59',
  }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVoucher.mutateAsync(formData);
      toast.success('Tạo mã giảm giá thành công');
      onClose();
    } catch (error) {
      toast.error(extractError(error, 'Có lỗi xảy ra'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] bg-card border-border rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tạo Mã Giảm Giá Mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Mã code</label>
              <Input
                type="text"
                required
                className="uppercase"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="VD: FREESHIP"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Loại giảm giá</label>
              <NativeSelect
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT' })}
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED_AMOUNT">Tiền mặt (VNĐ)</option>
              </NativeSelect>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Giá trị giảm</label>
              <Input
                type="number"
                required
                min="1"
                value={formData.discountValue || ''}
                onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
              />
            </div>

            {formData.type === 'PERCENTAGE' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold">Giảm tối đa (VNĐ)</label>
                <Input
                  type="number"
                  value={formData.maxDiscount || ''}
                  onChange={e => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                  placeholder="Không giới hạn"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold">Đơn tối thiểu (VNĐ)</label>
              <Input
                type="number"
                required
                min="0"
                value={formData.minOrderValue || ''}
                onChange={e => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Số lượng phát hành</label>
              <Input
                type="number"
                required
                min="1"
                value={formData.quantity || ''}
                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold">Hạn sử dụng</label>
              <Input
                type="datetime-local"
                required
                value={formData.expiryDate}
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={createVoucher.isPending}>
              {createVoucher.isPending ? 'Đang tạo...' : 'Lưu Mã Giảm Giá'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
