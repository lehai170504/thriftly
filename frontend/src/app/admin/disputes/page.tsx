'use client';

import { useState, useEffect } from 'react';
import { useDisputedOrders, useResolveDispute } from '@/features/orders/hooks/useOrders';
import { Order } from '@/features/orders/types/order';
import { extractError, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ShieldAlert, Check, X, Scale, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { normalizePageResponse } from '@/lib/pagination';

import { OrderListSkeleton } from '@/components/ui/loading-skeletons';

export default function AdminDisputesPage() {
  const [page, setPage] = useState(0);
  const size = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: ordersData, isLoading } = useDisputedOrders(page, size, debouncedSearchTerm);
  const { content: orders, totalPages, totalElements } = normalizePageResponse<Order>(ordersData);

  const resolveMutation = useResolveDispute();

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [winner, setWinner] = useState<'BUYER' | 'SELLER' | null>(null);

  if (isLoading) {
    return <OrderListSkeleton title="Giải quyết khiếu nại" subtitle="Đang tải danh sách khiếu nại..." />;
  }

  const handleOpenResolve = (orderId: string, selectedWinner: 'BUYER' | 'SELLER') => {
    setSelectedOrderId(orderId);
    setWinner(selectedWinner);
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = () => {
    if (!selectedOrderId || !winner) return;

    resolveMutation.mutate(
      { orderId: selectedOrderId, winner },
      {
        onSuccess: () => {
          toast.success('Đã giải quyết khiếu nại thành công!');
          setResolveModalOpen(false);
        },
        onError: (error) => {
          toast.error(extractError(error, 'Có lỗi xảy ra khi giải quyết.'));
        }
      }
    );
  };

  return (
    <div className="space-y-6 min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 rounded-[24px] glass border border-red-500/20">
            <Scale className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Giải quyết Khiếu nại</h1>
            <p className="text-muted-foreground text-sm">Tổng cộng <span className="font-bold text-foreground">{totalElements}</span> khiếu nại</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Lọc mã đơn, người dùng, lý do..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full md:w-64 rounded-[24px] bg-background/50 border-border glass"
          />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center p-12 bg-background/50 rounded-[24px] border border-border glass">
          <ShieldAlert className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Tuyệt vời! Hiện không có đơn hàng nào bị khiếu nại.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-background/50 p-6 rounded-[24px] border border-border glass shadow-lg flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div className="flex items-center gap-4">
                  {order.productImageUrl ? (
                    <img src={order.productImageUrl} alt={order.productTitle} className="w-16 h-16 rounded-[16px] object-cover bg-muted border border-border" />
                  ) : (
                    <img src={`https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200&h=200&seed=${order.productId}`} alt={order.productTitle} className="w-16 h-16 rounded-[16px] object-cover bg-muted border border-border" />
                  )}
                  <div>
                    <div className="text-xs text-muted-foreground font-mono mb-1">Mã ĐH: #{order.id.substring(0, 8).toUpperCase()}</div>
                    <h3 className="font-bold text-foreground">{order.productTitle}</h3>
                    <div className="text-primary font-bold">{formatCurrency(order.totalAmount)}</div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-muted-foreground mb-1">Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                  {order.trackingCode && (
                    <div className="text-foreground bg-muted/80 border border-border px-2 py-1 rounded-[8px] inline-block">
                      Mã vận đơn: <span className="font-mono">{order.trackingCode}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-500/10 p-4 rounded-[24px] border border-red-500/20">
                  <div className="text-sm font-bold text-red-400 mb-2">Thông tin khiếu nại (Từ Người Mua)</div>
                  <div className="text-sm mb-1 text-foreground/80">Người mua: <strong className="text-foreground">{order.buyerName}</strong></div>
                  <div className="bg-background/50 p-3 rounded-[16px] border border-red-500/20 text-sm text-foreground whitespace-pre-wrap glass">
                    "{order.disputeReason || 'Không có lý do rõ ràng'}"
                  </div>
                </div>

                <div className="bg-blue-500/10 p-4 rounded-[24px] border border-blue-500/20">
                  <div className="text-sm font-bold text-blue-400 mb-2">Người Bán</div>
                  <div className="text-sm mb-1 text-foreground/80">Người bán: <strong className="text-foreground">{order.sellerName}</strong></div>
                  <p className="text-xs text-blue-300/80 mt-2">Admin cần liên hệ hoặc kiểm tra bằng chứng trước khi ra quyết định.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  onClick={() => handleOpenResolve(order.id, 'SELLER')}
                  variant="outline"
                  className="rounded-[24px] border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Xử thắng cho Người Bán (Giao tiền)
                </Button>
                <Button
                  onClick={() => handleOpenResolve(order.id, 'BUYER')}
                  className="rounded-[24px] bg-red-600 hover:bg-red-700 text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Xử thắng cho Người Mua (Hoàn tiền)
                </Button>
              </div>
            </div>
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

      {/* Resolve Modal */}
      <ConfirmDialog
        isOpen={resolveModalOpen}
        onOpenChange={setResolveModalOpen}
        title="Xác nhận phán quyết"
        description={
          winner === 'BUYER' ? (
            <span>Bạn đang chọn <strong>Người Mua thắng</strong>. Hệ thống sẽ <strong className="text-red-600">hoàn tiền</strong> (Refund) toàn bộ số tiền Escrow về lại ví của người mua. Giao dịch sẽ bị Hủy bỏ.</span>
          ) : (
            <span>Bạn đang chọn <strong>Người Bán thắng</strong>. Hệ thống sẽ <strong className="text-emerald-600">giải phóng</strong> (Release) số tiền Escrow sang ví của người bán. Giao dịch sẽ Hoàn thành.</span>
          )
        }
        onConfirm={handleConfirmResolve}
        cancelText="Hủy"
        confirmText="Đồng ý thực thi"
        isLoading={resolveMutation.isPending}
        variant={winner === 'BUYER' ? 'destructive' : 'default'}
      />
    </div>
  );
}
