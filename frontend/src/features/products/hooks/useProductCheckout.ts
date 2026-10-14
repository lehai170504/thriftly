import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAvailableVouchers } from '@/features/orders/hooks/useVouchers';
import { useCreateBuyNowOrder, useCheckoutPreview } from '@/features/orders/hooks/useOrders';
import { extractError } from '@/lib/utils';
import { Product } from '@/features/products/types/product';
import { CheckoutPreviewResponse } from '@/features/orders/types/order';
import { useAuth } from '@/contexts/AuthContext';

export function useProductCheckout(product: Product | null | undefined, user: any, isSeller: boolean) {
  const router = useRouter();
  const { openAuthPrompt } = useAuth();
  const buyNowMutation = useCreateBuyNowOrder();
  const previewMutation = useCheckoutPreview();
  const { data: availableVouchers } = useAvailableVouchers(product?.sellerId);

  const [isMissingInfoModalOpen, setIsMissingInfoModalOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string>('');
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [previewData, setPreviewData] = useState<CheckoutPreviewResponse | null>(null);

  useEffect(() => {
    if (product && user && !isSeller) {
      previewMutation.mutate(
        { productId: product.id, voucherCode: appliedVoucherCode, quantity: purchaseQuantity },
        {
          onSuccess: (data) => {
            setPreviewData(data);
          },
          onError: (err) => {
            if (appliedVoucherCode) {
              setAppliedVoucherCode('');
              setVoucherCode('');
              toast.error(extractError(err, 'Mã giảm giá không hợp lệ với đơn hàng này.'));
            }
          }
        }
      );
    }
  }, [product, user, isSeller, previewMutation, appliedVoucherCode, purchaseQuantity]);

  const handleApplyVoucher = (codeParam?: string) => {
    const codeToApply = (codeParam !== undefined ? codeParam : voucherCode).trim();
    if (!codeToApply) {
      setAppliedVoucherCode('');
      return;
    }

    previewMutation.mutate(
      { productId: product!.id, voucherCode: codeToApply, quantity: purchaseQuantity },
      {
        onSuccess: (data) => {
          setAppliedVoucherCode(codeToApply);
          setVoucherCode(codeToApply);
          setPreviewData(data);
          toast.success(data.message || 'Áp dụng mã giảm giá thành công!');
        },
        onError: (err) => {
          toast.error(extractError(err, 'Mã giảm giá không hợp lệ.'));
          setVoucherCode(appliedVoucherCode);
        }
      }
    );
  };

  const proceedWithPurchase = () => {
    if (!product) return;
    buyNowMutation.mutate({ productId: product.id, voucherCode: appliedVoucherCode, quantity: purchaseQuantity }, {
      onSuccess: () => {
        toast.success('Đã đặt hàng thành công! Vui lòng thanh toán.');
        router.push('/orders');
      },
      onError: (err: any) => {
        toast.error(extractError(err, 'Có lỗi xảy ra khi mua hàng.'));
      }
    });
  };

  const handleBuyNow = () => {
    if (!user) {
      openAuthPrompt({
        title: 'Đăng nhập để mua hàng',
        description: 'Vui lòng đăng nhập tài khoản Thriftly để tiếp tục đặt hàng và bảo vệ thanh toán qua ví ký quỹ.',
        redirectUrl: product ? `/products/${product.id}` : '/products'
      });
      return;
    }

    if (isSeller) {
      toast.error('Bạn không thể mua sản phẩm của chính mình!');
      return;
    }

    if (!user.phone || !user.address) {
      setPendingAction(() => proceedWithPurchase);
      setIsMissingInfoModalOpen(true);
      return;
    }

    proceedWithPurchase();
  };

  const handleMissingInfoSuccess = () => {
    setIsMissingInfoModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  return {
    isMissingInfoModalOpen,
    setIsMissingInfoModalOpen,
    voucherCode,
    setVoucherCode,
    appliedVoucherCode,
    purchaseQuantity,
    setPurchaseQuantity,
    availableVouchers,
    previewData,
    isPreviewing: previewMutation.isPending,
    handleApplyVoucher,
    handleBuyNow,
    handleMissingInfoSuccess,
    buyNowMutation,
    setPendingAction,
  };
}
