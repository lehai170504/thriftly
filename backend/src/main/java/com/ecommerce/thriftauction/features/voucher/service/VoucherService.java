package com.ecommerce.thriftauction.features.voucher.service;

import com.ecommerce.thriftauction.features.voucher.dto.VoucherResponse;
import com.ecommerce.thriftauction.features.voucher.entity.Voucher;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ecommerce.thriftauction.features.voucher.dto.CreateVoucherRequest;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import com.ecommerce.thriftauction.features.voucher.dto.VoucherUsageResponse;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherUsageRepository;

@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final UserRepository userRepository;
    private final VoucherUsageRepository voucherUsageRepository;

    @Transactional(readOnly = true)
    public List<VoucherResponse> getAvailableVouchers(String sellerId, String username) {
        User user = null;
        if (username != null) {
            user = userRepository.findByEmail(username).or(() -> userRepository.findByUsername(username)).orElse(null);
        }
        final User finalUser = user;

        List<Voucher> platformVouchers = voucherRepository.findBySellerIsNullAndIsActiveTrue();
        List<Voucher> shopVouchers = sellerId != null ? voucherRepository.findBySellerIdAndIsActiveTrue(sellerId)
                : List.of();

        return Stream.concat(platformVouchers.stream(), shopVouchers.stream())
                .filter(v -> v.getExpiryDate().isAfter(LocalDateTime.now()))
                .filter(v -> v.getQuantity() > 0)
                .filter(v -> {
                    if (finalUser == null)
                        return true;
                    long usageCount = voucherUsageRepository.countByVoucherIdAndUserId(v.getId(), finalUser.getId());
                    return usageCount < v.getUsageLimitPerUser();
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VoucherResponse> getMyVouchers(String email) {
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return voucherRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VoucherResponse createVoucher(CreateVoucherRequest request, String email) {
        if (voucherRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new RuntimeException("Voucher code already exists");
        }

        User seller = null;
        if (email != null) {
            seller = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        Voucher voucher = Voucher.builder()
                .code(request.getCode().toUpperCase())
                .type(request.getType())
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue())
                .maxDiscount(request.getMaxDiscount())
                .quantity(request.getQuantity())
                .expiryDate(request.getExpiryDate())
                .usageLimitPerUser(request.getUsageLimitPerUser() != null ? request.getUsageLimitPerUser() : 1)
                .seller(seller)
                .isActive(true)
                .build();

        return mapToResponse(voucherRepository.save(voucher));
    }

    @Transactional
    public VoucherResponse toggleVoucherStatus(String id, String email) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (voucher.getSeller() == null || !voucher.getSeller().getId().equals(seller.getId())) {
            throw new AccessDeniedException("You do not have permission to modify this voucher");
        }

        voucher.setActive(!voucher.isActive());
        return mapToResponse(voucherRepository.save(voucher));
    }

    @Transactional(readOnly = true)
    public List<VoucherUsageResponse> getVoucherUsages(String id, String email) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (voucher.getSeller() == null || !voucher.getSeller().getId().equals(seller.getId())) {
            throw new AccessDeniedException("You do not have permission to view this voucher's history");
        }

        return voucherUsageRepository.findByVoucherIdOrderByUsedAtDesc(id).stream()
                .map(usage -> VoucherUsageResponse.builder()
                        .id(usage.getId())
                        .username(usage.getUser().getUsername())
                        .email(usage.getUser().getEmail())
                        .orderId(usage.getOrder().getId())
                        .productTitle(usage.getOrder().getProduct().getTitle())
                        .discountAmount(usage.getOrder().getDiscountAmount())
                        .usedAt(usage.getUsedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // --- Admin Platform Voucher Methods ---
    @Transactional(readOnly = true)
    public List<VoucherResponse> getAllPlatformVouchers() {
        return voucherRepository.findBySellerIsNullAndIsActiveTrue().stream() // We might want all, even inactive, for
                                                                              // admin.
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VoucherResponse> getAllPlatformVouchersAdmin() {
        return voucherRepository.findAll().stream()
                .filter(v -> v.getSeller() == null)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VoucherResponse togglePlatformVoucherStatus(String id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
        if (voucher.getSeller() != null) {
            throw new RuntimeException("Cannot toggle non-platform voucher from this endpoint");
        }
        voucher.setActive(!voucher.isActive());
        return mapToResponse(voucherRepository.save(voucher));
    }

    @Transactional(readOnly = true)
    public List<VoucherUsageResponse> getPlatformVoucherUsages(String id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
        if (voucher.getSeller() != null) {
            throw new RuntimeException("Cannot view non-platform voucher from this endpoint");
        }
        return voucherUsageRepository.findByVoucherIdOrderByUsedAtDesc(id).stream()
                .map(usage -> VoucherUsageResponse.builder()
                        .id(usage.getId())
                        .username(usage.getUser().getUsername())
                        .email(usage.getUser().getEmail())
                        .orderId(usage.getOrder().getId())
                        .productTitle(usage.getOrder().getProduct().getTitle())
                        .discountAmount(usage.getOrder().getDiscountAmount())
                        .usedAt(usage.getUsedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePlatformVoucher(String id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
        if (voucher.getSeller() != null) {
            throw new RuntimeException("Cannot delete non-platform voucher from this endpoint");
        }
        voucherRepository.delete(voucher);
    }

    private VoucherResponse mapToResponse(Voucher voucher) {
        return VoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .type(voucher.getType())
                .discountValue(voucher.getDiscountValue())
                .minOrderValue(voucher.getMinOrderValue())
                .maxDiscount(voucher.getMaxDiscount())
                .quantity(voucher.getQuantity())
                .usageLimitPerUser(voucher.getUsageLimitPerUser())
                .expiryDate(voucher.getExpiryDate())
                .sellerId(voucher.getSeller() != null ? voucher.getSeller().getId() : null)
                .isActive(voucher.isActive())
                .build();
    }
}
