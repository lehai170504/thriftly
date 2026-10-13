package com.ecommerce.thriftauction.features.order.domain;

import com.ecommerce.thriftauction.features.voucher.entity.Voucher;
import com.ecommerce.thriftauction.features.voucher.entity.VoucherType;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

public class OrderPricingCalculator {

    public record PricingBreakdown(
            BigDecimal totalProductPrice,
            BigDecimal shippingFee,
            BigDecimal productDiscount,
            BigDecimal shippingDiscount,
            BigDecimal totalDiscount,
            BigDecimal finalPrice) {
    }

    public static void validateVoucher(
            Voucher voucher,
            BigDecimal totalProductPrice,
            String productSellerId,
            long usageCount,
            LocalDateTime now) {
        if (voucher.getExpiryDate() != null && voucher.getExpiryDate().isBefore(now)) {
            throw new RuntimeException("Voucher đã hết hạn");
        }
        if (voucher.getQuantity() <= 0) {
            throw new RuntimeException("Voucher đã hết lượt sử dụng");
        }
        if (voucher.getMinOrderValue() != null && totalProductPrice.compareTo(voucher.getMinOrderValue()) < 0) {
            throw new RuntimeException("Chưa đạt giá trị đơn hàng tối thiểu");
        }
        if (voucher.getSeller() != null && !voucher.getSeller().getId().equals(productSellerId)) {
            throw new RuntimeException("Voucher này không áp dụng cho gian hàng này");
        }
        if (usageCount >= voucher.getUsageLimitPerUser()) {
            throw new RuntimeException("Bạn đã dùng hết lượt cho voucher này");
        }
    }

    public static PricingBreakdown calculate(
            BigDecimal totalProductPrice,
            BigDecimal shippingFee,
            Voucher voucher) {
        BigDecimal productDiscount = BigDecimal.ZERO;
        BigDecimal shippingDiscount = BigDecimal.ZERO;

        if (voucher != null) {
            if (voucher.getType() == VoucherType.FIXED_AMOUNT) {
                productDiscount = voucher.getDiscountValue() != null ? voucher.getDiscountValue() : BigDecimal.ZERO;
            } else if (voucher.getType() == VoucherType.PERCENTAGE) {
                BigDecimal discountVal = voucher.getDiscountValue() != null ? voucher.getDiscountValue()
                        : BigDecimal.ZERO;
                productDiscount = totalProductPrice.multiply(discountVal)
                        .divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP);
                if (voucher.getMaxDiscount() != null && productDiscount.compareTo(voucher.getMaxDiscount()) > 0) {
                    productDiscount = voucher.getMaxDiscount();
                }
            } else if (voucher.getType() == VoucherType.FREE_SHIPPING) {
                shippingDiscount = shippingFee;
                if (voucher.getMaxDiscount() != null && shippingDiscount.compareTo(voucher.getMaxDiscount()) > 0) {
                    shippingDiscount = voucher.getMaxDiscount();
                }
            }

            if (productDiscount.compareTo(totalProductPrice) > 0) {
                productDiscount = totalProductPrice;
            }
            if (shippingDiscount.compareTo(shippingFee) > 0) {
                shippingDiscount = shippingFee;
            }
        }

        BigDecimal totalDiscount = productDiscount.add(shippingDiscount);
        BigDecimal initialTotal = totalProductPrice.add(shippingFee);
        BigDecimal finalPrice = initialTotal.subtract(totalDiscount);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            finalPrice = BigDecimal.ZERO;
        }

        return new PricingBreakdown(
                totalProductPrice,
                shippingFee,
                productDiscount,
                shippingDiscount,
                totalDiscount,
                finalPrice);
    }
}
