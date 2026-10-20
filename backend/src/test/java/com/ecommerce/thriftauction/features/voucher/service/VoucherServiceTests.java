package com.ecommerce.thriftauction.features.voucher.service;

import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.voucher.dto.CreateVoucherRequest;
import com.ecommerce.thriftauction.features.voucher.dto.VoucherResponse;
import com.ecommerce.thriftauction.features.voucher.entity.Voucher;
import com.ecommerce.thriftauction.features.voucher.entity.VoucherType;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherRepository;
import com.ecommerce.thriftauction.features.voucher.repository.VoucherUsageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoucherServiceTests {

    @Mock
    private VoucherRepository voucherRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VoucherUsageRepository voucherUsageRepository;

    @InjectMocks
    private VoucherService voucherService;

    private User seller;
    private User buyer;
    private Voucher platformVoucher;
    private Voucher shopVoucher;

    @BeforeEach
    void setUp() {
        seller = User.builder().id("seller-1").username("seller1").email("seller@test.com").build();
        buyer = User.builder().id("buyer-1").username("buyer1").email("buyer@test.com").build();

        platformVoucher = Voucher.builder()
                .id("vouch-1")
                .code("PLATFORM50")
                .type(VoucherType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("50000"))
                .minOrderValue(new BigDecimal("200000"))
                .quantity(10)
                .usageLimitPerUser(1)
                .expiryDate(LocalDateTime.now().plusDays(5))
                .isActive(true)
                .seller(null)
                .build();

        shopVoucher = Voucher.builder()
                .id("vouch-2")
                .code("SHOP20")
                .type(VoucherType.PERCENTAGE)
                .discountValue(new BigDecimal("20"))
                .minOrderValue(new BigDecimal("100000"))
                .quantity(5)
                .usageLimitPerUser(1)
                .expiryDate(LocalDateTime.now().plusDays(3))
                .isActive(true)
                .seller(seller)
                .build();
    }

    @Test
    void getAvailableVouchers_returnsEligibleVouchers() {
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(buyer));
        when(voucherRepository.findBySellerIsNullAndIsActiveTrue()).thenReturn(List.of(platformVoucher));
        when(voucherRepository.findBySellerIdAndIsActiveTrue("seller-1")).thenReturn(List.of(shopVoucher));
        when(voucherUsageRepository.countByVoucherIdAndUserId("vouch-1", "buyer-1")).thenReturn(0L);
        when(voucherUsageRepository.countByVoucherIdAndUserId("vouch-2", "buyer-1")).thenReturn(0L);

        List<VoucherResponse> result = voucherService.getAvailableVouchers("seller-1", "buyer@test.com");

        assertEquals(2, result.size());
        assertEquals("PLATFORM50", result.get(0).getCode());
        assertEquals("SHOP20", result.get(1).getCode());
    }

    @Test
    void getAvailableVouchers_filtersOutExceededUsageLimit() {
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(buyer));
        when(voucherRepository.findBySellerIsNullAndIsActiveTrue()).thenReturn(List.of(platformVoucher));
        when(voucherRepository.findBySellerIdAndIsActiveTrue("seller-1")).thenReturn(List.of(shopVoucher));
        when(voucherUsageRepository.countByVoucherIdAndUserId("vouch-1", "buyer-1")).thenReturn(1L);
        when(voucherUsageRepository.countByVoucherIdAndUserId("vouch-2", "buyer-1")).thenReturn(0L);

        List<VoucherResponse> result = voucherService.getAvailableVouchers("seller-1", "buyer@test.com");

        assertEquals(1, result.size());
        assertEquals("SHOP20", result.get(0).getCode());
    }

    @Test
    void createVoucher_successful() {
        CreateVoucherRequest request = CreateVoucherRequest.builder()
                .code("NEWYEAR")
                .type(VoucherType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("30000"))
                .minOrderValue(new BigDecimal("150000"))
                .quantity(20)
                .usageLimitPerUser(1)
                .expiryDate(LocalDateTime.now().plusDays(10))
                .build();

        when(voucherRepository.existsByCode("NEWYEAR")).thenReturn(false);
        when(userRepository.findByEmail("seller@test.com")).thenReturn(Optional.of(seller));

        Voucher savedVoucher = Voucher.builder()
                .id("vouch-new")
                .code("NEWYEAR")
                .type(request.getType())
                .discountValue(request.getDiscountValue())
                .seller(seller)
                .isActive(true)
                .build();

        when(voucherRepository.save(any(Voucher.class))).thenReturn(savedVoucher);

        VoucherResponse response = voucherService.createVoucher(request, "seller@test.com");

        assertNotNull(response);
        assertEquals("NEWYEAR", response.getCode());
        assertEquals("seller-1", response.getSellerId());
        verify(voucherRepository, times(1)).save(any(Voucher.class));
    }

    @Test
    void createVoucher_failsWhenCodeExists() {
        CreateVoucherRequest request = CreateVoucherRequest.builder()
                .code("EXISTING")
                .build();

        when(voucherRepository.existsByCode("EXISTING")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> voucherService.createVoucher(request, "seller@test.com"));

        assertTrue(exception.getMessage().contains("already exists"));
    }

    @Test
    void toggleVoucherStatus_successful() {
        when(voucherRepository.findById("vouch-2")).thenReturn(Optional.of(shopVoucher));
        when(userRepository.findByEmail("seller@test.com")).thenReturn(Optional.of(seller));
        when(voucherRepository.save(any(Voucher.class))).thenReturn(shopVoucher);

        VoucherResponse response = voucherService.toggleVoucherStatus("vouch-2", "seller@test.com");

        assertNotNull(response);
        assertFalse(shopVoucher.isActive());
        verify(voucherRepository, times(1)).save(shopVoucher);
    }

    @Test
    void toggleVoucherStatus_failsWhenNotOwner() {
        when(voucherRepository.findById("vouch-2")).thenReturn(Optional.of(shopVoucher));
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(buyer));

        assertThrows(AccessDeniedException.class,
                () -> voucherService.toggleVoucherStatus("vouch-2", "buyer@test.com"));
    }

    @Test
    void deletePlatformVoucher_successful() {
        when(voucherRepository.findById("vouch-1")).thenReturn(Optional.of(platformVoucher));

        voucherService.deletePlatformVoucher("vouch-1");

        verify(voucherRepository, times(1)).delete(platformVoucher);
    }

    @Test
    void deletePlatformVoucher_failsForShopVoucher() {
        when(voucherRepository.findById("vouch-2")).thenReturn(Optional.of(shopVoucher));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> voucherService.deletePlatformVoucher("vouch-2"));

        assertTrue(exception.getMessage().contains("Cannot delete non-platform voucher"));
    }
}
