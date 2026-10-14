'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useVoucherUsages } from '../hooks/useVouchers';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Loader2, Ticket, History } from 'lucide-react';

interface VoucherUsageModalProps {
  voucherId: string;
  voucherCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VoucherUsageModal({ voucherId, voucherCode, isOpen, onClose }: VoucherUsageModalProps) {
  const { data: usages, isLoading } = useVoucherUsages(voucherId, isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-card p-6 rounded-2xl border-border shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-heading font-bold text-foreground">
            <History className="w-5 h-5 text-primary" />
            Lịch sử sử dụng mã: <span className="text-primary font-bold">{voucherCode}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 pt-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground font-medium">Đang tải lịch sử...</p>
            </div>
          ) : !usages || usages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center">
                <Ticket className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium text-lg">Chưa có ai sử dụng mã này</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              {usages.map((usage) => (
                <div key={usage.id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 hover:bg-muted/40 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{usage.username || usage.userUsername || 'Người dùng'}</span>
                      {(usage.email || usage.userEmail) && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{usage.email || usage.userEmail}</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      Sản phẩm: <span className="font-medium text-foreground">{usage.productTitle || usage.orderId}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Thời gian: {format(new Date(usage.usedAt), 'HH:mm dd/MM/yyyy', { locale: vi })}
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end justify-center">
                    <div className="text-sm text-muted-foreground mb-1">Mức giảm:</div>
                    <div className="text-lg font-bold text-emerald-500">
                      - {formatCurrency(usage.discountAmount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
