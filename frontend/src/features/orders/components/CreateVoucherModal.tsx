'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useCreateVoucher } from '@/features/orders/hooks/useVouchers';
import { CreateVoucherDTO } from '@/features/orders/types/voucher';
import { formatCurrency } from '@/lib/utils';

export function CreateVoucherModal() {
  const [isOpen, setIsOpen] = useState(false);
  const createMutation = useCreateVoucher();

  const [formData, setFormData] = useState<CreateVoucherDTO>(() => ({
    code: '',
    type: 'FIXED_AMOUNT',
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    quantity: 1,
    usageLimitPerUser: 1,
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      expiryDate: new Date(formData.expiryDate).toISOString()
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({
          code: '',
          type: 'FIXED_AMOUNT',
          discountValue: 0,
          minOrderValue: 0,
          maxDiscount: 0,
          quantity: 1,
          usageLimitPerUser: 1,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10 px-4 text-sm font-semibold shadow-xs" onClick={() => setIsOpen(true)}>
        <PlusCircle className="w-4 h-4" />
        Tạo mã giảm giá
      </Button>
      <DialogContent className="sm:max-w-[480px] bg-card border-border rounded-2xl shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-heading font-bold text-foreground">Tạo mã giảm giá mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-xs font-semibold text-foreground">Mã giảm giá (VD: SALE10K, MEGA50)</Label>
            <Input
              id="code"
              placeholder="Nhập mã viết liền không dấu"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
              required
              className="uppercase bg-background border-border rounded-xl text-foreground text-sm h-10 focus-visible:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Loại mã</Label>
              <Select
                value={formData.type}
                onValueChange={(val: any) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger className="bg-background border-border rounded-xl text-foreground text-sm h-10">
                  {formData.type === 'FIXED_AMOUNT' ? 'Giảm tiền cố định' : 'Giảm theo %'}
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="FIXED_AMOUNT" className="rounded-lg cursor-pointer">Giảm tiền cố định</SelectItem>
                  <SelectItem value="PERCENTAGE" className="rounded-lg cursor-pointer">Giảm theo %</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Mức giảm {formData.type === 'PERCENTAGE' ? '(%)' : '(đ)'}</Label>
              <Input
                type="number"
                min="1"
                required
                value={formData.discountValue || ''}
                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                className="bg-background border-border rounded-xl text-foreground text-sm h-10 focus-visible:ring-primary"
              />
              {formData.type === 'FIXED_AMOUNT' && Number(formData.discountValue) > 0 && (
                <p className="text-[11px] text-primary font-medium flex items-center gap-1">
                  Giảm: <strong className="font-bold">{formatCurrency(formData.discountValue)}</strong>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Đơn hàng tối thiểu (đ)</Label>
            <Input
              type="number"
              min="0"
              value={formData.minOrderValue || ''}
              onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
              className="bg-background border-border rounded-xl text-foreground text-sm h-10 focus-visible:ring-primary"
            />
            {Number(formData.minOrderValue) > 0 && (
              <p className="text-[11px] text-primary font-medium flex items-center gap-1">
                Đơn từ: <strong className="font-bold">{formatCurrency(formData.minOrderValue)}</strong>
              </p>
            )}
          </div>

          {formData.type === 'PERCENTAGE' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Mức giảm tối đa (đ) - Bỏ trống nếu không giới hạn</Label>
              <Input
                type="number"
                min="0"
                value={formData.maxDiscount || ''}
                onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                className="bg-background border-border rounded-xl text-foreground text-sm h-10 focus-visible:ring-primary"
              />
              {Number(formData.maxDiscount) > 0 && (
                <p className="text-[11px] text-primary font-medium flex items-center gap-1">
                  Tối đa: <strong className="font-bold">{formatCurrency(formData.maxDiscount)}</strong>
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Số lượng mã</Label>
              <Input
                type="number"
                min="1"
                required
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="bg-background border-border rounded-xl text-foreground text-sm h-10 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Số lần dùng / Người</Label>
              <Input
                type="number"
                min="1"
                required
                value={formData.usageLimitPerUser || ''}
                onChange={(e) => setFormData({ ...formData, usageLimitPerUser: Number(e.target.value) })}
                className="bg-background border-border rounded-xl text-foreground text-sm h-10 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Hạn sử dụng</Label>
            <Input
              type="datetime-local"
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="bg-background border-border rounded-xl text-foreground text-sm h-10 focus-visible:ring-primary"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl border-border text-foreground hover:bg-accent h-9 px-4 text-xs font-medium">
              Hủy
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !formData.code} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 text-xs font-semibold shadow-xs">
              {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo mã'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
