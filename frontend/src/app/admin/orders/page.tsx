'use client';

import { useState, useEffect } from 'react';
import { useAdminOrders } from '@/features/admin/hooks/useAdminOrders';
import { Order } from '@/features/orders/types/order';
import { formatCurrency, downloadCSV } from '@/lib/utils';
import { normalizePageResponse } from '@/lib/pagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Package, Clock } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

import { OrderListSkeleton } from '@/components/ui/loading-skeletons';

export default function AdminOrdersPage() {
  const [page, setPage] = useState(0);
  const size = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: ordersData, isLoading } = useAdminOrders(page, size, debouncedSearchTerm);

  const normalized = normalizePageResponse(ordersData);
  const orders: Order[] = normalized.content;
  const totalPages = normalized.totalPages;
  const totalElements = normalized.totalElements;

  if (isLoading) {
    return <OrderListSkeleton title="Quản lý Đơn hàng" subtitle="Đang tải danh sách đơn hàng..." />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">Chờ thanh toán</Badge>;
      case 'PAID':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Đã thanh toán (Escrow)</Badge>;
      case 'SHIPPED':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">Đang giao hàng</Badge>;
      case 'DISPUTED':
        return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Đang khiếu nại</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Đã hoàn thành</Badge>;
      case 'CANCELED':
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-[24px] glass border border-blue-500/20">
            <ShoppingBag className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Quản lý Đơn hàng</h1>
            <p className="text-muted-foreground text-sm">Tổng cộng <span className="font-bold text-foreground">{totalElements}</span> đơn hàng</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-[24px] border-primary/20 text-primary hover:bg-primary/10"
            onClick={() => {
              const exportData = orders.map(o => ({
                'Mã ĐH': o.id,
                'Sản phẩm': o.productTitle,
                'Người Mua': o.buyerName,
                'Người Bán': o.sellerName,
                'Tổng tiền': o.totalAmount,
                'Phí sàn': o.platformFee || 0,
                'Trạng thái': o.status,
                'Ngày tạo': new Date(o.createdAt).toLocaleString('vi-VN')
              }));
              downloadCSV(exportData, `DonHang_${new Date().toISOString().split('T')[0]}.csv`);
            }}
            disabled={orders.length === 0}
          >
            Xuất CSV
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Lọc mã đơn, sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full md:w-64 rounded-[24px] bg-background/50 border-border glass"
            />
          </div>
        </div>
      </div>

      <div className="bg-background/50 rounded-[24px] border border-border shadow-lg glass backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="text-xs text-muted-foreground uppercase bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold">Mã ĐH & Sản phẩm</th>
                <th className="px-6 py-4 font-bold">Người mua & Bán</th>
                <th className="px-6 py-4 font-bold">Giá trị</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-right">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-accent transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {order.productImageUrl ? (
                        <img src={order.productImageUrl} alt={order.productTitle} className="w-12 h-12 rounded-[16px] object-cover bg-muted border border-border shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-[16px] bg-muted border border-border flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-foreground max-w-[200px] truncate" title={order.productTitle}>{order.productTitle}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">#{order.id.substring(0, 8).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1.5 text-blue-400 font-medium">
                        <span className="w-10 text-muted-foreground font-normal">Mua:</span> {order.buyerName}
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <span className="w-10 text-muted-foreground font-normal">Bán:</span> {order.sellerName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-primary">{formatCurrency(order.totalAmount)}</div>
                    {order.platformFee !== undefined && order.platformFee !== null && order.status === 'COMPLETED' && (
                      <div className="text-xs text-emerald-400 mt-1 font-medium bg-emerald-500/10 inline-block px-1.5 py-0.5 rounded">
                        + Phí sàn: {formatCurrency(order.platformFee)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-right text-muted-foreground whitespace-nowrap text-xs flex flex-col items-end gap-1">
                    <span className="font-medium text-foreground">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Hệ thống chưa có đơn hàng nào.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-xl"
          >
            Trang trước
          </Button>
          <span className="text-sm font-medium text-neutral-600">
            Trang {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="rounded-xl"
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}
