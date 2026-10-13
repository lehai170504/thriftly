'use client';

import { useMySales, useConfirmReturnReceived } from '@/features/orders/hooks/useOrders';
import { Order } from '@/features/orders/api/orderApi';
import { extractError } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Package, Star } from 'lucide-react';
import Link from 'next/link';
import { OrderListSkeleton } from '@/components/ui/loading-skeletons';
import { InvoiceGenerator } from '@/features/orders/components/InvoiceGenerator';
import { toast } from 'sonner';
import { PageHeader } from '@/components/patterns/page-header';
import { EmptyState } from '@/components/patterns/state-panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { DateTime, EntityId, Money, NumberText } from '@/components/ui/typography';

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
    <div className="page-container min-h-[60vh] space-y-6 py-8">
      <PageHeader title="Đơn bán của tôi" description="Quản lý các sản phẩm bạn đã bán và theo dõi trạng thái đơn hàng" />

      {!sales || sales.length === 0 ? (
        <EmptyState title="Chưa có đơn bán nào" description="Bạn chưa bán được sản phẩm nào trên hệ thống." icon={<Package className="size-8" />} />
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
                <div className="mb-1 text-xs text-muted-foreground">Mã ĐH: <EntityId value={order.id} /></div>
                <h3 className="text-base font-semibold text-foreground mb-1.5 line-clamp-1">
                  <Link href={`/products/${order.productId}`} className="hover:text-primary transition-colors">
                    {order.productTitle}
                  </Link>
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                  <span>Người mua: <strong className="text-foreground font-medium">{order.buyerName}</strong></span>
                  <span>•</span>
                  <DateTime value={order.createdAt} />
                  <span>•</span>
                  <span className="font-semibold text-warning">SL: <NumberText value={order.quantity || 1} /></span>
                </div>
                <Money value={order.totalAmount} className="text-lg font-bold text-primary" />
                {order.trackingCode && (
                  <div className="mt-2 text-xs text-foreground bg-muted/60 px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 border border-border/50">
                    <Package className="w-3.5 h-3.5 text-muted-foreground" /> Mã vận đơn: <span className="font-semibold font-mono">{order.trackingCode}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start md:items-end gap-2.5 w-full md:w-auto min-w-[180px] border-t md:border-t-0 pt-3 md:pt-0 border-border/40">
                <StatusBadge domain="order" status={order.status} />

                {order.status === 'RETURNING' && (
                  <Button
                    size="sm"
                    onClick={() => handleConfirmReturn(order.id)}
                    loading={isConfirmingReturn}
                    className="w-full"
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
                  <div className="mt-1 flex w-full flex-col gap-1 rounded-md border border-warning/30 bg-warning/10 p-3">
                    <div className="flex items-center gap-1 text-xs font-semibold text-warning">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{order.reviewRating} sao</span>
                      <span className="ml-auto text-xs text-muted-foreground">Đánh giá người mua</span>
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
