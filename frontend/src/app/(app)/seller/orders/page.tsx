'use client';

import { useMySales, useConfirmReturnReceived } from '@/features/orders/hooks/useOrders';
import { Order } from '@/features/orders/api/orderApi';
import { extractError, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Store, Star } from 'lucide-react';
import Link from 'next/link';
import { OrderListSkeleton } from '@/components/ui/loading-skeletons';
import { InvoiceGenerator } from '@/features/orders/components/InvoiceGenerator';
import { toast } from 'sonner';

export default function SellerOrdersPage() {
  const { data: salesData, isLoading } = useMySales();
  const sales: Order[] = (salesData as any)?.content || [];

  const { mutate: confirmReturn, isPending: isConfirmingReturn } = useConfirmReturnReceived();

  const handleConfirmReturn = (orderId: string) => {
    confirmReturn(orderId, {
      onSuccess: () => {
        toast.success('Đã xác nhận nhận hàng trả! Hệ thống đang hoàn tiền cho người mua.');
      },
      onError: (error) => {
        toast.error(extractError(error, 'Có lỗi xảy ra.'));
      }
    });
  };

  if (isLoading) {
    return <OrderListSkeleton />;
  }

  return (
    <div className="container px-4 sm:px-6 py-8 max-w-5xl mx-auto space-y-6 min-h-[60vh]">
      <div className="flex items-center gap-3.5 mb-6">
        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
          <Store className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Đơn bán của tôi</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Quản lý các sản phẩm bạn đã bán và theo dõi trạng thái đơn hàng</p>
        </div>
      </div>

      {!sales || sales.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-muted/20">
          <div className="w-16 h-16 bg-muted/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50">
            <Package className="w-8 h-8 text-muted-foreground/60" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Chưa có đơn bán nào</h3>
          <p className="text-sm text-muted-foreground">Bạn chưa bán được sản phẩm nào trên hệ thống.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((order) => (
            <div key={order.id} className="bg-card p-5 rounded-2xl border border-border/80 shadow-xs flex flex-col md:flex-row gap-5 items-start md:items-center transition-all hover:border-primary/30">
              {order.productImageUrl ? (
                <img src={order.productImageUrl} alt={order.productTitle} className="w-20 h-20 rounded-xl object-cover bg-muted border border-border flex-shrink-0" />
              ) : (
                <img src={`https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200&h=200&seed=${order.productId}`} alt={order.productTitle} className="w-20 h-20 rounded-xl object-cover bg-muted border border-border flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground mb-1 font-mono">Mã ĐH: #{order.id.substring(0, 8).toUpperCase()}</div>
                <h3 className="text-base font-semibold text-foreground mb-1.5 line-clamp-1">
                  <Link href={`/products/${order.productId}`} className="hover:text-primary transition-colors">
                    {order.productTitle}
                  </Link>
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                  <span>Người mua: <strong className="text-foreground font-medium">{order.buyerName}</strong></span>
                  <span>•</span>
                  <span>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                  <span>•</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">SL: {order.quantity || 1}</span>
                </div>
                <div className="text-lg font-bold text-primary">{formatCurrency(order.totalAmount)}</div>
                {order.trackingCode && (
                  <div className="mt-2 text-xs text-foreground bg-muted/60 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 border border-border/50">
                    <Package className="w-3.5 h-3.5 text-muted-foreground" /> Mã vận đơn: <span className="font-semibold font-mono">{order.trackingCode}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start md:items-end gap-2.5 w-full md:w-auto min-w-[180px] border-t md:border-t-0 pt-3 md:pt-0 border-border/40">
                {order.status === 'PENDING_PAYMENT' && <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 rounded-full px-3">Người mua chờ thanh toán</Badge>}
                {order.status === 'PAID' && <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 rounded-full px-3">Chờ lấy hàng (Đã Escrow)</Badge>}
                {order.status === 'SHIPPED' && <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 rounded-full px-3">Đang giao hàng</Badge>}
                {order.status === 'DELIVERED' && <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 rounded-full px-3">Đã giao (Chờ xác nhận)</Badge>}
                {order.status === 'DISPUTED' && <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 rounded-full px-3">Đang khiếu nại</Badge>}
                {order.status === 'COMPLETED' && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 rounded-full px-3">Đã hoàn thành</Badge>}
                {order.status === 'RETURNING' && <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 rounded-full px-3">Chờ nhận hàng trả</Badge>}
                {order.status === 'RETURNED' && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 rounded-full px-3">Đã nhận hàng trả</Badge>}
                {order.status === 'CANCELED' && <Badge variant="outline" className="bg-muted text-muted-foreground border-border rounded-full px-3">Đã hủy</Badge>}

                {order.status === 'RETURNING' && (
                  <Button
                    size="sm"
                    onClick={() => handleConfirmReturn(order.id)}
                    disabled={isConfirmingReturn}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-medium"
                  >
                    <Package className="w-4 h-4 mr-1.5" />
                    Xác nhận nhận hàng trả
                  </Button>
                )}

                {order.status === 'COMPLETED' && (
                  <div className="w-full mt-1">
                    <InvoiceGenerator order={order} buttonVariant="outline" buttonSize="sm" className="w-full rounded-xl" />
                  </div>
                )}

                {order.status === 'COMPLETED' && order.isReviewed && (
                  <div className="w-full mt-1 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{order.reviewRating} sao</span>
                      <span className="text-muted-foreground text-[11px] ml-auto">Đánh giá người mua</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
