'use client';

import { useAdminProducts, useDeleteAdminProduct, useForceCancelAdminProduct } from '@/features/admin/hooks/useAdminProducts';
import { Package, Search, MoreHorizontal, Trash2, Eye, PowerOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { normalizePageResponse } from '@/lib/pagination';

export default function AdminProductsPage() {
  const [page, setPage] = useState(0);
  const size = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: productsData, isLoading } = useAdminProducts(page, size, debouncedSearchTerm);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [forceCancelModalOpen, setForceCancelModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const deleteMutation = useDeleteAdminProduct();
  const forceCancelMutation = useForceCancelAdminProduct();

  const handleDelete = () => {
    if (!selectedProductId) return;
    deleteMutation.mutate(selectedProductId, {
      onSuccess: () => {
        toast.success('Đã khóa và ẩn sản phẩm vi phạm thành công');
        setDeleteModalOpen(false);
        setSelectedProductId(null);
      },
      onError: () => toast.error('Không thể xóa sản phẩm. Vui lòng thử lại.')
    });
  };

  const handleForceCancel = () => {
    if (!selectedProductId) return;
    forceCancelMutation.mutate(selectedProductId, {
      onSuccess: () => {
        toast.success('Đã hủy phiên đấu giá và hoàn cọc thành công');
        setForceCancelModalOpen(false);
        setSelectedProductId(null);
      },
      onError: () => toast.error('Không thể hủy phiên đấu giá. Vui lòng thử lại.')
    });
  };

  const normalized = normalizePageResponse(productsData);
  const products = normalized.content;
  const totalPages = normalized.totalPages;
  const totalElements = normalized.totalElements;

  if (isLoading) return <div className="p-8 text-center text-neutral-500 font-medium">Đang tải danh sách sản phẩm...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-[24px] glass border border-primary/20">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">Sản phẩm đăng bán</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Tìm thấy <span className="font-bold text-foreground">{totalElements}</span> sản phẩm trong hệ thống
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 w-full bg-background/50 border-border rounded-[24px] glass"
          />
        </div>
      </div>

      <div className="bg-background/50 rounded-[24px] border border-border shadow-lg glass backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="bg-muted text-muted-foreground border-b border-border uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-5 py-4">Sản phẩm</th>
                <th className="px-5 py-4">Phân loại</th>
                <th className="px-5 py-4">Giá bán</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4">Người bán</th>
                <th className="px-5 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    <Package className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-accent transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[16px] bg-muted border border-border shrink-0 overflow-hidden">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-foreground max-w-[250px] truncate">{product.title}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">#{product.id.substring(0, 8).toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground/80">
                      {product.categoryName || 'Không xác định'}
                    </td>
                    <td className="px-5 py-4 font-bold text-primary">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-5 py-4">
                      {product.status === 'ACTIVE' && <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Đang bán</Badge>}
                      {product.status === 'SOLD' && <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Đã bán</Badge>}
                      {product.status === 'HIDDEN' && <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Đã ẩn/Khóa</Badge>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-foreground">@{product.sellerName}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">ID: {product.sellerId?.substring(0, 8).toUpperCase()}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center hover:bg-accent hover:text-accent-foreground rounded-full transition-colors mx-auto outline-none">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-background border-border text-foreground glass">
                          <DropdownMenuItem
                            className="cursor-pointer font-medium text-red-600 focus:text-red-700 focus:bg-red-50"
                            onClick={() => {
                              setSelectedProductId(product.id);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Khóa vi phạm
                          </DropdownMenuItem>
                          {product.sellType === 'AUCTION' && product.isLive && (
                            <DropdownMenuItem
                              className="cursor-pointer font-bold text-red-600 focus:text-red-700 focus:bg-red-50"
                              onClick={() => {
                                setSelectedProductId(product.id);
                                setForceCancelModalOpen(true);
                              }}
                            >
                              <PowerOff className="mr-2 h-4 w-4" /> Hủy đấu giá (Force Cancel)
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-border flex items-center justify-between bg-muted">
            <div className="text-sm text-muted-foreground font-medium">
              Trang {page + 1} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-[24px]"
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-[24px]"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Khóa/Ẩn sản phẩm vi phạm"
        description="Bạn có chắc chắn muốn khóa và ẩn sản phẩm này khỏi hệ thống? Người dùng sẽ không thể nhìn thấy sản phẩm này nữa."
        onConfirm={handleDelete}
        confirmText="Khóa sản phẩm"
        cancelText="Hủy"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDialog
        isOpen={forceCancelModalOpen}
        onOpenChange={setForceCancelModalOpen}
        title="BUỘC HỦY PHIÊN ĐẤU GIÁ KHẨN CẤP"
        description="Hành động này sẽ KẾT THÚC NGAY LẬP TỨC phiên đấu giá và HOÀN TRẢ TOÀN BỘ tiền cọc của những người tham gia. Bạn có chắc chắn muốn hủy phiên đấu giá này không?"
        onConfirm={handleForceCancel}
        confirmText="Xác nhận Hủy Đấu Giá"
        cancelText="Bỏ qua"
        variant="destructive"
        isLoading={forceCancelMutation.isPending}
      />
    </div>
  );
}
