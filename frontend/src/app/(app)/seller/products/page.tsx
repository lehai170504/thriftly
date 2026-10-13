'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useSellerProducts, useDeleteProduct, useBoostProduct, useRestartAuction } from '@/features/products/hooks/useProducts';
import { Package, Search, Trash2, ArrowUpCircle, RefreshCcw, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { EditProductModal } from '@/features/products/components/EditProductModal';
import { Product } from '@/features/products/types/product';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CreateProductModal } from '@/features/products/components/CreateProductModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/patterns/page-header';
import { EmptyState, LoadingState } from '@/components/patterns/state-panel';
import { Badge } from '@/components/ui/badge';
import { Money, NumberText } from '@/components/ui/typography';

export default function SellerProductsPage() {
  const { user } = useAuth();
  const { data: products, isLoading } = useSellerProducts(user?.username || '');
  const deleteMutation = useDeleteProduct();
  const [searchQuery, setSearchQuery] = useState('');

  const [isBoostDialogOpen, setIsBoostDialogOpen] = useState(false);
  const [productToBoost, setProductToBoost] = useState<string | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setProductToDelete(null);
        }
      });
    }
  };

  const boostMutation = useBoostProduct();

  const handleBoostClick = (id: string) => {
    setProductToBoost(id);
    setIsBoostDialogOpen(true);
  };

  const handleConfirmBoost = () => {
    if (productToBoost) {
      boostMutation.mutate(productToBoost, {
        onSuccess: () => {
          setIsBoostDialogOpen(false);
          setProductToBoost(null);
        }
      });
    }
  };

  const restartMutation = useRestartAuction();
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false);
  const [productToRestart, setProductToRestart] = useState<string | null>(null);

  const handleRestartClick = (id: string) => {
    setProductToRestart(id);
    setIsRestartDialogOpen(true);
  };

  const handleConfirmRestart = () => {
    if (productToRestart) {
      restartMutation.mutate(productToRestart, {
        onSuccess: () => {
          setIsRestartDialogOpen(false);
          setProductToRestart(null);
        }
      });
    }
  };

  const filteredProducts = products?.filter((product: Product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingState title="Đang tải sản phẩm của bạn…" />;
  }

  return (
    <div className="page-container min-h-[60vh] space-y-6 py-8">
      <PageHeader
        title="Sản phẩm của tôi"
        description="Quản lý kho hàng và các sản phẩm bạn đang bán"
        actions={<div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm tên sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-64 rounded-xl"
            />
          </div>
        </div>}
      />

      {!filteredProducts || filteredProducts.length === 0 ? (
        <EmptyState
          title="Chưa có sản phẩm nào"
          description={searchQuery ? 'Không tìm thấy sản phẩm nào phù hợp với từ khóa của bạn.' : 'Bạn chưa đăng bán sản phẩm nào trên hệ thống. Hãy bắt đầu ngay!'}
          icon={<Package className="size-8" />}
          action={!searchQuery ? <CreateProductModal /> : undefined}
        />
      ) : (
        <div className="bg-card rounded-2xl shadow-xs border border-border/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-muted/60 border-b border-border/60">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sản phẩm</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loại hình</th>
                  <th className="text-right py-3.5 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Giá</th>
                  <th className="text-right py-3.5 px-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredProducts.map((product: Product) => (
                  <tr key={product.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden flex-shrink-0 border border-border/60">
                          <img
                            src={product.imageUrl || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100&h=100&seed=${product.id}`}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link href={`/products/${product.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1">
                            {product.title}
                          </Link>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <Badge tone="neutral">{product.categoryName}</Badge>
                            {product.sellType === 'BUY_NOW' && (
                              <Badge tone="warning">Kho: <NumberText value={product.quantity || 1} /></Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <Badge tone={product.sellType === 'AUCTION' ? 'brand' : 'success'}>
                        {product.sellType === 'AUCTION' ? 'Đấu giá' : 'Mua ngay'}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="font-semibold text-sm text-foreground">
                        {product.sellType === 'AUCTION' && product.currentHighestBid && product.currentHighestBid > product.price ? (
                          <div className="flex flex-col items-end">
                            <Money value={product.currentHighestBid} />
                            <span className="text-xs font-medium text-primary">Giá hiện tại</span>
                          </div>
                        ) : (
                          <Money value={product.price} />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EditProductModal product={product} />

                        <DropdownMenu>
                          <DropdownMenuTrigger aria-label={`Thao tác với ${product.title}`} className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md border border-border/50 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl bg-card border-border shadow-md p-1">
                            {product.boostedUntil && new Date(product.boostedUntil) > new Date() ? (
                              <DropdownMenuItem disabled className="text-emerald-500 text-xs font-medium py-2 rounded-lg">
                                <ArrowUpCircle className="w-4 h-4 mr-2" /> Đang nổi bật
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer text-xs font-medium text-amber-600 dark:text-amber-400 focus:bg-amber-500/10 py-2 rounded-lg"
                                onClick={() => handleBoostClick(product.id)}
                              >
                                <ArrowUpCircle className="w-4 h-4 mr-2" /> Đẩy tin (20k/ngày)
                              </DropdownMenuItem>
                            )}

                            {product.sellType === 'AUCTION' && product.status === 'HIDDEN' && (
                              <DropdownMenuItem
                                className="cursor-pointer text-xs font-medium text-blue-600 dark:text-blue-400 focus:bg-blue-500/10 py-2 rounded-lg"
                                onClick={() => handleRestartClick(product.id)}
                              >
                                <RefreshCcw className="w-4 h-4 mr-2" /> Đấu giá lại
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              className="cursor-pointer text-xs font-medium text-red-600 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600 py-2 rounded-lg"
                              onClick={() => handleDeleteClick(product.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Xóa sản phẩm
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isBoostDialogOpen}
        onOpenChange={setIsBoostDialogOpen}
        title="Đẩy tin sản phẩm"
        description="Phí đẩy tin là 20.000 VNĐ cho 1 ngày. Sản phẩm của bạn sẽ được ưu tiên hiển thị ở các trang tìm kiếm. Bạn có chắc chắn muốn đẩy tin sản phẩm này?"
        confirmText="Đẩy tin ngay"
        cancelText="Hủy"
        onConfirm={handleConfirmBoost}
        isLoading={boostMutation.isPending}
        variant="default"
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa sản phẩm"
        description="Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác này không thể hoàn tác."
        confirmText="Xóa sản phẩm"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
      <ConfirmDialog
        isOpen={isRestartDialogOpen}
        onOpenChange={setIsRestartDialogOpen}
        title="Đấu giá lại sản phẩm"
        description="Bạn có chắc chắn muốn mở lại phiên đấu giá cho sản phẩm này? Phiên đấu giá mới sẽ kéo dài 7 ngày kể từ bây giờ với giá khởi điểm đã thiết lập."
        confirmText="Đấu giá lại"
        cancelText="Hủy"
        onConfirm={handleConfirmRestart}
        isLoading={restartMutation.isPending}
        variant="default"
      />
    </div>
  );
}
