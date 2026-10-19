package com.ecommerce.thriftauction.features.report.service;

import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductStatus;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import com.ecommerce.thriftauction.features.report.dto.ReportRequest;
import com.ecommerce.thriftauction.features.report.dto.ReportResponse;
import com.ecommerce.thriftauction.features.report.entity.Report;
import com.ecommerce.thriftauction.features.report.entity.ReportStatus;
import com.ecommerce.thriftauction.features.report.repository.ReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTests {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ReportService reportService;

    private User user;
    private Product product;

    @BeforeEach
    void setUp() {
        user = User.builder().id("user-1").username("reporter1").email("reporter@test.com").build();
        product = Product.builder().id("prod-1").title("Fake Item").build();
    }

    @Test
    void submitReport_successful() {
        ReportRequest request = new ReportRequest();
        request.setProductId("prod-1");
        request.setReason("San pham nghi van hang gia");

        when(userRepository.findByEmail("reporter@test.com")).thenReturn(Optional.of(user));
        when(productRepository.findById("prod-1")).thenReturn(Optional.of(product));
        when(reportRepository.findByReporterIdAndReportedProductId("user-1", "prod-1")).thenReturn(Optional.empty());

        Report savedReport = Report.builder()
                .id("report-1")
                .reporter(user)
                .reportedProduct(product)
                .reason(request.getReason())
                .status(ReportStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        when(reportRepository.save(any(Report.class))).thenReturn(savedReport);

        ReportResponse response = reportService.submitReport("reporter@test.com", request);

        assertNotNull(response);
        assertEquals("report-1", response.getId());
        assertEquals("reporter1", response.getReporterUsername());
        assertEquals("Fake Item", response.getReportedProductTitle());
        assertEquals(ReportStatus.PENDING, response.getStatus());
        verify(reportRepository, times(1)).save(any(Report.class));
    }

    @Test
    void submitReport_failsWhenAlreadyReported() {
        ReportRequest request = new ReportRequest();
        request.setProductId("prod-1");
        request.setReason("San pham nghi van hang gia");

        when(userRepository.findByEmail("reporter@test.com")).thenReturn(Optional.of(user));
        when(productRepository.findById("prod-1")).thenReturn(Optional.of(product));
        when(reportRepository.findByReporterIdAndReportedProductId("user-1", "prod-1"))
                .thenReturn(Optional.of(new Report()));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> reportService.submitReport("reporter@test.com", request));

        assertTrue(exception.getMessage().contains("Bạn đã tố cáo"));
    }

    @Test
    void updateReportStatus_resolvedHidesProduct() {
        Report report = Report.builder()
                .id("report-1")
                .reporter(user)
                .reportedProduct(product)
                .status(ReportStatus.PENDING)
                .build();

        when(reportRepository.findById("report-1")).thenReturn(Optional.of(report));
        when(reportRepository.save(any(Report.class))).thenReturn(report);

        ReportResponse response = reportService.updateReportStatus("report-1", ReportStatus.RESOLVED);

        assertNotNull(response);
        assertEquals(ReportStatus.RESOLVED, report.getStatus());
        assertTrue(product.getIsHidden());
        assertEquals(ProductStatus.HIDDEN, product.getStatus());
        verify(productRepository, times(1)).save(product);
        verify(reportRepository, times(1)).save(report);
    }
}
