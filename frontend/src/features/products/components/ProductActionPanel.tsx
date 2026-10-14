'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MissingInfoModal } from '@/features/checkout/components/MissingInfoModal';
import { Ticket, Clock, Gavel, Video, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/features/products/types/product';
import { useProductCheckout } from '@/features/products/hooks/useProductCheckout';
import { useDeleteProduct } from '@/features/products/hooks/useProducts';
import { useStartLiveSession } from '@/features/live/hooks/useLive';

interface ProductActionPanelProps {
  product: Product;
  user: any;
  isSeller: boolean;
}

export function ProductActionPanel({ product, user, isSeller }: ProductActionPanelProps) {
  const router = useRouter();
  const deleteMutation = useDeleteProduct();
  const { mutate: startLiveSession, isPending: isStartingLive } = useStartLiveSession();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBuyConfirmOpen, setIsBuyConfirmOpen] = useState(false);
  const [isLiveConfirmOpen, setIsLiveConfirmOpen] = useState(false);

  const {
    isMissingInfoModalOpen, setIsMissingInfoModalOpen, voucherCode, setVoucherCode,
    purchaseQuantity, setPurchaseQuantity,
    availableVouchers, previewData, isPreviewing, handleApplyVoucher,
    handleBuyNow, handleMissingInfoSuccess, buyNowMutation, setPendingAction
  } = useProductCheckout(product, user, isSeller);

  const handleDelete = () => {
    deleteMutation.mutate(product.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        router.push('/products');
      }
    });
  };

  const proceedStartLive = () => {
    startLiveSession(product.id, {
      onSuccess: () => router.push(`/auctions/${product.id}`)
    });
  };

  const handleStartLive = () => {
    if (!user?.phone || !user?.address) {
      setPendingAction(() => proceedStartLive);
      setIsMissingInfoModalOpen(true);
      return;
    }
    proceedStartLive();
  };

  return (
    <div className="mt-auto">
      {!isSeller && (
        <>
          {product.sellType === 'BUY_NOW' ? (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Số lượng</span>
                <div className="flex items-center bg-background border border-border rounded-md">
                  <button
                    className="px-3 py-1.5 hover:bg-muted text-foreground transition-colors border-r border-border"
                    onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                    disabled={purchaseQuantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{purchaseQuantity}</span>
                  <button
                    className="px-3 py-1.5 hover:bg-muted text-foreground transition-colors border-l border-border"
                    onClick={() => setPurchaseQuantity(Math.min(product.quantity || 1, purchaseQuantity + 1))}
                    disabled={purchaseQuantity >= (product.quantity || 1)}
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">{product.quantity || 0} sản phẩm có sẵn</span>
              </div>

              {/* Vouchers Section */}
              {availableVouchers && availableVouchers.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-primary flex items-center gap-1">
                      <Ticket className="w-4 h-4" />
                      Mã giảm giá của Shop
                    </h4>
                    <span className="text-xs text-muted-foreground font-medium bg-background px-2 py-0.5 rounded-full border border-border">Cuộn ngang</span>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden">
                    {availableVouchers.map((v: any) => (
                      <div key={v.id} className="min-w-[220px] sm:min-w-[250px] flex-shrink-0 snap-start flex flex-col justify-between bg-background border-2 border-dashed border-primary/20 p-3 rounded-xl relative">
                        {/* Decorative ticket cutouts */}
                        <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-primary/5 rounded-full border-r-2 border-primary/20"></div>
                        <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-primary/5 rounded-full border-l-2 border-primary/20"></div>

                        <div className="flex flex-col pl-3 pr-3">
                          <span className="font-bold text-primary text-sm uppercase tracking-wide">{v.code}</span>
                          <span className="text-xs text-muted-foreground mt-1 leading-tight">
                            Giảm {v.type === 'PERCENTAGE' ? `${v.discountValue}%` : formatCurrency(v.discountValue)}
                            {v.minOrderValue ? ` cho đơn từ ${formatCurrency(v.minOrderValue)}` : ''}
                          </span>
                        </div>

                        <div className="mt-3 pl-3 pr-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-8 text-xs font-semibold bg-primary/5 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all"
                            onClick={() => {
                              setVoucherCode(v.code);
                              handleApplyVoucher(v.code);
                            }}
                          >
                            Lưu & Áp dụng
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã ưu đãi"
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value);
                  }}
                  className="bg-background rounded-md h-12 flex-1"
                />
                <Button
                  variant="secondary"
                  onClick={() => handleApplyVoucher()}
                  disabled={!voucherCode || buyNowMutation.isPending}
                  className="h-12 px-6 rounded-md font-medium"
                >
                  Áp dụng
                </Button>
              </div>

              {/* Checkout Breakdown */}
              {previewData && (
                <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tiền hàng</span>
                    <span>{formatCurrency(previewData.totalProductPrice)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Phí vận chuyển (GHN)</span>
                    <span>{formatCurrency(previewData.shippingFee)}</span>
                  </div>
                  {previewData.productDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Giảm giá sản phẩm</span>
                      <span>-{formatCurrency(previewData.productDiscount)}</span>
                    </div>
                  )}
                  {previewData.shippingDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Miễn phí vận chuyển</span>
                      <span>-{formatCurrency(previewData.shippingDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold text-base">
                    <span>Tổng thanh toán</span>
                    <span className="text-primary">{formatCurrency(previewData.finalPrice)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-border">
                <Button
                  onClick={() => setIsBuyConfirmOpen(true)}
                  disabled={buyNowMutation.isPending || isPreviewing || product.status !== 'ACTIVE' || (product.quantity || 0) <= 0}
                  className="w-full h-12 text-base font-medium rounded-md bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                >
                  {buyNowMutation.isPending || isPreviewing ? 'Đang xử lý...' : ((product.quantity || 0) > 0 ? 'Mua ngay' : 'Hết hàng')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-xl flex items-center justify-between border border-border">
                <div className="flex items-center text-primary font-medium text-sm">
                  <Clock className="w-5 h-5 mr-2" />
                  {product.auctionEndTime ? `Hạn: ${new Date(product.auctionEndTime).toLocaleString()}` : 'Chưa rõ thời gian'}
                </div>
              </div>
              <Link href={`/auctions/${product.id}`} className="block">
                <Button className="w-full h-14 text-lg font-medium rounded-md bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                  <Gavel className="mr-2 w-5 h-5" /> Tham gia đấu giá
                </Button>
              </Link>
            </div>
          )}
        </>
      )}

      {isSeller && (
        <div className="flex flex-row flex-wrap gap-3 mt-6 pt-6 border-t border-border">
          {product.sellType === 'AUCTION' && (
            <Button
              variant="default"
              className="px-6 h-10 rounded-md font-medium text-sm bg-red-600 hover:bg-red-700 text-white uppercase"
              onClick={product.isLive ? () => router.push(`/auctions/${product.id}`) : () => setIsLiveConfirmOpen(true)}
              disabled={!product.isLive && isStartingLive}
            >
              <Video className="mr-2 w-4 h-4" />
              {product.isLive ? 'Vào phòng Live' : isStartingLive ? 'Đang tạo phòng Live...' : 'Bắt đầu Livestream'}
            </Button>
          )}
          <Button
            variant="outline"
            className="px-6 h-10 rounded-md font-medium text-sm text-destructive border-destructive hover:bg-destructive/10 uppercase"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 w-4 h-4" /> Xóa sản phẩm
          </Button>
        </div>
      )}

      <MissingInfoModal
        isOpen={isMissingInfoModalOpen}
        onOpenChange={setIsMissingInfoModalOpen}
        onSuccess={handleMissingInfoSuccess}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa Sản Phẩm"
        description={
          <>Bạn có chắc chắn muốn xóa sản phẩm <strong>"{product.title}"</strong> không? Thao tác này không thể hoàn tác.</>
        }
        onConfirm={handleDelete}
        cancelText="Hủy"
        confirmText="Xóa"
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={isBuyConfirmOpen}
        onOpenChange={setIsBuyConfirmOpen}
        title="Xác nhận mua hàng"
        description={
          <>Bạn có chắc chắn muốn mua sản phẩm <strong>"{product.title}"</strong> không? Thao tác này sẽ tạo đơn hàng mới.</>
        }
        onConfirm={() => {
          setIsBuyConfirmOpen(false);
          handleBuyNow();
        }}
        cancelText="Hủy"
        confirmText="Đồng ý mua"
      />

      <ConfirmDialog
        isOpen={isLiveConfirmOpen}
        onOpenChange={setIsLiveConfirmOpen}
        title="Bắt đầu Livestream"
        description={
          <>Bạn sắp bắt đầu phiên đấu giá trực tiếp cho sản phẩm <strong>"{product.title}"</strong>. Bạn đã sẵn sàng chưa?</>
        }
        onConfirm={() => {
          setIsLiveConfirmOpen(false);
          handleStartLive();
        }}
        cancelText="Chưa"
        confirmText="Bắt đầu ngay"
      />
    </div>
  );
}
