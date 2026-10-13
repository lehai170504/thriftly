'use client';

import { useState, useMemo } from 'react';
import { useMyOrders, usePayOrder, useConfirmReceipt, useDisputeOrder, useReturnShipped, useHideOrder } from '@/features/orders/hooks/useOrders';
import { Order } from '@/features/orders/api/orderApi';
import { extractError } from '@/lib/utils';
import { ReviewModal } from '@/features/reviews/components/ReviewModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ShoppingBag, Package, CheckCircle, Star, Store, Truck, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { OrderListSkeleton } from '@/components/ui/loading-skeletons';
import { InvoiceGenerator } from '@/features/orders/components/InvoiceGenerator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChatStore } from '@/features/chat/store/useChatStore';
import { PageHeader } from '@/components/patterns/page-header';
import { EmptyState } from '@/components/patterns/state-panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { EntityId, Money } from '@/components/ui/typography';

export default function OrdersPage() {
  const { data: ordersData, isLoading } = useMyOrders();
  const orders = useMemo<Order[]>(() => ordersData?.content || [], [ordersData]);
  const { mutate: payOrder, isPending: isPaying } = usePayOrder();
  const { mutate: confirmReceipt, isPending: isConfirming } = useConfirmReceipt();
  const { mutate: disputeOrder, isPending: isDisputing } = useDisputeOrder();
  const { mutate: hideOrder, isPending: isHiding } = useHideOrder();
  const { openChatWith } = useChatStore();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [hideConfirmOpen, setHideConfirmOpen] = useState(false);
  const [orderToHide, setOrderToHide] = useState<string | null>(null);

  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeOrderId, setDisputeOrderId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  const { mutate: returnShipped, isPending: isReturning } = useReturnShipped();
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [returnTrackingCode, setReturnTrackingCode] = useState('');

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    if (activeTab === 'pending') return orders.filter(o => o.status === 'PENDING_PAYMENT');
    if (activeTab === 'processing') return orders.filter(o => o.status === 'PAID' || o.status === 'RETURNING');
    if (activeTab === 'shipping') return orders.filter(o => o.status === 'SHIPPED' || o.status === 'DELIVERED');
    if (activeTab === 'completed') return orders.filter(o => o.status === 'COMPLETED');
    if (activeTab === 'cancelled') return orders.filter(o => o.status === 'CANCELED' || o.status === 'RETURNED' || o.status === 'DISPUTED');
    return orders;
  }, [orders, activeTab]);

  if (isLoading) {
    return <OrderListSkeleton />;
  }

  const handlePay = (orderId: string) => {
    payOrder(orderId, {
      onSuccess: () => {
        toast.success('Thanh toán bằng ví Escrow thành công! Tiền đã được tạm giữ.');
      },
      onError: (error) => {
        toast.error(extractError(error, 'Thanh toán thất bại. Vui lòng nạp thêm tiền vào ví.'));
      }
    });
  };

  const handleConfirm = (orderId: string) => {
    confirmReceipt(orderId, {
      onSuccess: () => {
        toast.success('Đã xác nhận nhận hàng! Tiền đã được chuyển cho người bán.');
      },
      onError: (error) => {
        toast.error(extractError(error, 'Có lỗi xảy ra khi xác nhận.'));
      }
    });
  };

  const handleOpenDispute = (orderId: string) => {
    setDisputeOrderId(orderId);
    setDisputeReason('');
    setDisputeModalOpen(true);
  };

  const handleOpenReturn = (orderId: string) => {
    setReturnOrderId(orderId);
    setReturnTrackingCode('');
    setReturnModalOpen(true);
  };

  const handleConfirmReturn = () => {
    if (!returnOrderId) return;
    if (!returnTrackingCode.trim()) {
      toast.error('Vui lòng nhập mã vận đơn!');
      return;
    }
    returnShipped({ orderId: returnOrderId, trackingCode: returnTrackingCode }, {
      onSuccess: () => {
        toast.success('Đã cập nhật mã vận đơn trả hàng!');
        setReturnModalOpen(false);
      },
      onError: (error) => {
        toast.error(extractError(error, 'Có lỗi xảy ra.'));
      }
    });
  };

  const handleConfirmDispute = () => {
    if (!disputeOrderId) return;
    if (!disputeReason.trim()) {
      toast.error('Vui lòng nhập lý do khiếu nại!');
      return;
    }
    disputeOrder({ orderId: disputeOrderId, reason: disputeReason }, {
      onSuccess: () => {
        toast.success('Đã gửi khiếu nại thành công!');
        setDisputeModalOpen(false);
      },
      onError: (error) => {
        toast.error(extractError(error, 'Có lỗi xảy ra khi khiếu nại.'));
      }
    });
  };

  const handleOpenReviewModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setReviewModalOpen(true);
  };

  const handleHideOrderClick = (orderId: string) => {
    setOrderToHide(orderId);
    setHideConfirmOpen(true);
  };

  const handleConfirmHide = () => {
    if (!orderToHide) return;
    hideOrder(orderToHide, {
      onSuccess: () => {
        toast.success('Đã xóa đơn hàng khỏi danh sách!');
        setHideConfirmOpen(false);
        setOrderToHide(null);
      },
      onError: (error) => {
        toast.error(extractError(error, 'Có lỗi xảy ra khi xóa đơn.'));
      }
    });
  };

  return (
    <div className="page-container py-8 space-y-6 min-h-[70vh]">
      <PageHeader title="Đơn mua" description="Quản lý và theo dõi các đơn hàng của bạn" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex justify-between bg-muted/50 border border-border rounded-xl p-1 h-auto overflow-x-auto custom-scrollbar">
          <TabsTrigger value="all" className="flex-1 whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium transition-all">Tất cả</TabsTrigger>
          <TabsTrigger value="pending" className="flex-1 whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium transition-all">Chờ thanh toán</TabsTrigger>
          <TabsTrigger value="processing" className="flex-1 whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium transition-all">Đang xử lý</TabsTrigger>
          <TabsTrigger value="shipping" className="flex-1 whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium transition-all">Đang giao</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium transition-all">Hoàn thành</TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-1 whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-medium transition-all">Đã hủy/Trả</TabsTrigger>
        </TabsList>
      </Tabs>

      {!filteredOrders || filteredOrders.length === 0 ? (
        <EmptyState title="Chưa có đơn hàng" description="Các giao dịch của bạn sẽ xuất hiện tại đây." icon={<ShoppingBag className="size-8" />} />
      ) : (
        <div className="space-y-4 mt-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-card border border-border rounded-lg shadow-sm overflow-hidden transition-colors hover:border-primary/20">
              {/* Header */}
              <div className="bg-muted/30 px-5 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground text-sm">{order.sellerName}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[11px] rounded-full ml-2"
                    onClick={() => openChatWith({ id: order.sellerId || order.sellerName || '', username: order.sellerUsername || order.sellerName || '', fullName: order.sellerName, avatar: '' })}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" /> Chat
                  </Button>
                </div>
                <div className="flex items-center">
                  <StatusBadge domain="order" status={order.status} />
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex gap-4 bg-background">
                <div className="w-20 h-20 shrink-0 border border-border rounded-md overflow-hidden bg-muted flex items-center justify-center">
                  {order.productImageUrl ? (
                    <img src={order.productImageUrl} alt={order.productTitle} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-start">
                  <h3 className="text-base text-foreground font-medium line-clamp-2">{order.productTitle}</h3>
                  <div className="text-sm text-muted-foreground mt-1">Phân loại: Mặc định</div>
                  <div className="mt-auto text-sm font-medium text-foreground">x{order.quantity || 1}</div>
                </div>
                <div className="text-right flex flex-col justify-center">
                  <Money value={(order.totalAmount || 0) / (order.quantity || 1)} className="text-primary" />
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground flex flex-col gap-1 w-full sm:w-auto">
                  <span className="text-xs">Mã đơn hàng: <EntityId value={order.id} visibleLength={12} /></span>
                  {order.trackingCode && (
                    <span className="flex items-center gap-1 text-foreground/80"><Truck className="w-4 h-4 text-emerald-500" /> Vận đơn: <strong className="font-mono">{order.trackingCode}</strong></span>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                  <div className="text-sm text-foreground flex items-center">
                    Thành tiền: <Money value={order.totalAmount} className="ml-2 text-xl font-bold text-primary" />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 w-full">
                    {order.status === 'PENDING_PAYMENT' && (
                      <Button onClick={() => handlePay(order.id)} disabled={isPaying} className="min-w-[120px]">
                        Thanh toán ngay
                      </Button>
                    )}

                    {(order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                      <Button onClick={() => handleConfirm(order.id)} disabled={isConfirming} className="min-w-[120px]">
                        <CheckCircle className="w-4 h-4 mr-2" /> Đã nhận hàng
                      </Button>
                    )}

                    {order.status === 'COMPLETED' && !order.isReviewed && (
                      <Button onClick={() => handleOpenReviewModal(order.id)} className="min-w-[120px]">
                        <Star className="w-4 h-4 mr-2" /> Đánh giá
                      </Button>
                    )}

                    {order.status === 'COMPLETED' && (
                      <InvoiceGenerator order={order} buttonVariant="outline" buttonSize="default" className="min-w-[120px]" />
                    )}

                    {(order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                      <Button onClick={() => handleOpenDispute(order.id)} disabled={isDisputing} variant="outline" className="min-w-[120px]">
                        Trả hàng/Hoàn tiền
                      </Button>
                    )}

                    {order.status === 'RETURNING' && (
                      <Button onClick={() => handleOpenReturn(order.id)} disabled={isReturning} className="min-w-[120px]">
                        <Package className="w-4 h-4 mr-2" /> Nhập vận đơn trả
                      </Button>
                    )}

                    {(order.status === 'COMPLETED' || order.status === 'CANCELED' || order.status === 'RETURNED') && (
                      <Button onClick={() => handleHideOrderClick(order.id)} disabled={isHiding} variant="ghost" className="text-muted-foreground hover:text-destructive min-w-[100px]">
                        Xóa đơn
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals... */}
      <ConfirmDialog
        isOpen={disputeModalOpen}
        onOpenChange={setDisputeModalOpen}
        title="Yêu cầu Trả hàng/Hoàn tiền"
        description={
          <div className="text-left mt-2">
            <p className="mb-4 text-muted-foreground">
              Vui lòng cung cấp lý do chính xác. Hệ thống sẽ giữ lại tiền Escrow để chờ admin giải quyết khiếu nại này.
            </p>
            <label className="text-sm font-medium text-foreground mb-2 block">Lý do chi tiết</label>
            <Textarea
              placeholder="Hàng giả, hàng lỗi, không đúng mô tả..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="bg-background border-border rounded-md resize-none"
              rows={3}
            />
          </div>
        }
        onConfirm={handleConfirmDispute}
        cancelText="Hủy"
        confirmText="Gửi yêu cầu"
        isLoading={isDisputing}
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={returnModalOpen}
        onOpenChange={setReturnModalOpen}
        title="Nhập mã vận đơn trả hàng"
        description={
          <div className="text-left mt-2">
            <p className="mb-4 text-muted-foreground">
              Sau khi đã đóng gói và gửi hàng cho đơn vị vận chuyển, vui lòng nhập mã vận đơn vào đây để người bán và hệ thống theo dõi.
            </p>
            <label className="text-sm font-medium text-foreground mb-2 block">Mã vận đơn (Ví dụ: GHN, J&T,...)</label>
            <input
              type="text"
              placeholder="Nhập mã vận đơn..."
              value={returnTrackingCode}
              onChange={(e) => setReturnTrackingCode(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        }
        onConfirm={handleConfirmReturn}
        cancelText="Hủy"
        confirmText="Xác nhận"
        isLoading={isReturning}
      />

      <ConfirmDialog
        isOpen={hideConfirmOpen}
        onOpenChange={setHideConfirmOpen}
        title="Xóa đơn hàng"
        description="Bạn có chắc chắn muốn xóa đơn hàng này khỏi danh sách? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmHide}
        cancelText="Hủy"
        confirmText="Xóa"
        isLoading={isHiding}
        variant="destructive"
      />

      {selectedOrderId && (
        <ReviewModal
          orderId={selectedOrderId}
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedOrderId(null);
          }}
        />
      )}
    </div>
  );
}
