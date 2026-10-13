'use client';

import { useState, useEffect } from 'react';
import { useAdminOrders } from '@/features/admin/hooks/useAdminOrders';
import { Order } from '@/features/orders/types/order';
import { downloadCSV } from '@/lib/utils';
import { normalizePageResponse } from '@/lib/pagination';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

import { OrderListSkeleton } from '@/components/ui/loading-skeletons';
import { PageHeader } from '@/components/patterns/page-header';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { DateTime, EntityId, Money, NumberText } from '@/components/ui/typography';

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

  const columns: DataTableColumn<Order>[] = [
    {
      key: 'product',
      header: 'Đơn hàng & sản phẩm',
      cell: (order) => <div className="flex items-center gap-3">{order.productImageUrl ? <img src={order.productImageUrl} alt="" className="size-12 shrink-0 rounded-md border border-border object-cover" /> : <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted"><Package className="size-5 text-muted-foreground" /></div>}<div className="min-w-0"><div className="max-w-52 truncate font-semibold text-foreground" title={order.productTitle}>{order.productTitle}</div><EntityId value={order.id} className="mt-1 block text-xs text-muted-foreground" /></div></div>,
    },
    {
      key: 'people',
      header: 'Người mua / bán',
      cell: (order) => <div className="space-y-1 text-xs"><p><span className="text-muted-foreground">Mua:</span> {order.buyerName}</p><p><span className="text-muted-foreground">Bán:</span> {order.sellerName}</p></div>,
    },
    {
      key: 'value',
      header: 'Giá trị',
      align: 'right',
      cell: (order) => <div><Money value={order.totalAmount} className="font-bold text-foreground" />{order.platformFee != null && order.status === 'COMPLETED' && <p className="mt-1 text-xs text-success">Phí sàn: <Money value={order.platformFee} /></p>}</div>,
    },
    { key: 'status', header: 'Trạng thái', cell: (order) => <StatusBadge domain="order" status={order.status} /> },
    { key: 'createdAt', header: 'Ngày tạo', align: 'right', cell: (order) => <DateTime value={order.createdAt} className="text-xs text-muted-foreground" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý đơn hàng"
        description={<>Tổng cộng <NumberText value={totalElements} /> đơn hàng</>}
        actions={<>
          <Button
            variant="outline"
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
              className="w-full pl-9 md:w-64"
              aria-label="Lọc đơn hàng"
            />
          </div>
        </>}
      />

      <DataTable rows={orders} columns={columns} getRowKey={(order) => order.id} emptyTitle="Hệ thống chưa có đơn hàng nào" />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
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
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}
