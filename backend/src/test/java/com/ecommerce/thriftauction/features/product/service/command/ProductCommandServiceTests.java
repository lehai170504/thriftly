package com.ecommerce.thriftauction.features.product.service.command;

import com.ecommerce.thriftauction.features.auction.entity.AuctionSession;
import com.ecommerce.thriftauction.features.auction.entity.AuctionStatus;
import com.ecommerce.thriftauction.features.auction.repository.AuctionSessionRepository;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.notification.service.NotificationService;
import com.ecommerce.thriftauction.features.product.dto.ProductRequest;
import com.ecommerce.thriftauction.features.product.dto.ProductResponse;
import com.ecommerce.thriftauction.features.product.entity.Category;
import com.ecommerce.thriftauction.features.product.entity.Product;
import com.ecommerce.thriftauction.features.product.entity.ProductCondition;
import com.ecommerce.thriftauction.features.product.entity.SellType;
import com.ecommerce.thriftauction.features.product.mapper.ProductMapper;
import com.ecommerce.thriftauction.features.product.repository.CategoryRepository;
import com.ecommerce.thriftauction.features.product.repository.ProductRepository;
import com.ecommerce.thriftauction.features.social.repository.FollowRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductCommandServiceTests {

        @Mock
        private ProductRepository productRepository;

        @Mock
        private CategoryRepository categoryRepository;

        @Mock
        private UserRepository userRepository;

        @Mock
        private AuctionSessionRepository auctionSessionRepository;

        @Mock
        private FollowRepository followRepository;

        @Mock
        private NotificationService notificationService;

        @Mock
        private ProductMapper productMapper;

        @InjectMocks
        private ProductCommandService productCommandService;

        @Test
        void createProductDirectBuySuccess() {
                User seller = User.builder().id("seller-1").username("seller").fullName("Seller One").build();
                Category category = Category.builder().id("cat-1").name("Thời trang").build();
                ProductRequest request = ProductRequest.builder()
                                .categoryId("cat-1")
                                .title("Áo khoác vintage")
                                .description("Áo khoác 90s còn mới")
                                .condition(ProductCondition.LIKE_NEW)
                                .sellType(SellType.BUY_NOW)
                                .price(new BigDecimal("250000"))
                                .quantity(1)
                                .build();

                Product savedProduct = Product.builder()
                                .id("prod-1")
                                .seller(seller)
                                .category(category)
                                .title(request.getTitle())
                                .price(request.getPrice())
                                .sellType(request.getSellType())
                                .build();

                ProductResponse expectedResponse = ProductResponse.builder()
                                .id("prod-1")
                                .title("Áo khoác vintage")
                                .price(new BigDecimal("250000"))
                                .build();

                when(userRepository.findByEmail("seller@test.com")).thenReturn(Optional.of(seller));
                when(categoryRepository.findById("cat-1")).thenReturn(Optional.of(category));
                when(productRepository.save(any(Product.class))).thenReturn(savedProduct);
                when(followRepository.findByFollowing(seller)).thenReturn(List.of());
                when(productMapper.mapToResponse(savedProduct)).thenReturn(expectedResponse);

                ProductResponse response = productCommandService.createProduct(request, "seller@test.com");

                assertThat(response.getId()).isEqualTo("prod-1");
                assertThat(response.getTitle()).isEqualTo("Áo khoác vintage");
                verify(auctionSessionRepository, never()).save(any(AuctionSession.class));
        }

        @Test
        void createProductAuctionCreatesAuctionSession() {
                User seller = User.builder().id("seller-1").username("seller").fullName("Seller One").build();
                Category category = Category.builder().id("cat-1").name("Đồ cổ").build();
                ProductRequest request = ProductRequest.builder()
                                .categoryId("cat-1")
                                .title("Đồng hồ cổ")
                                .description("Đồng hồ Thụy Sĩ cổ")
                                .condition(ProductCondition.GOOD)
                                .sellType(SellType.AUCTION)
                                .price(new BigDecimal("1000000"))
                                .auctionDurationDays(3)
                                .quantity(1)
                                .build();

                Product savedProduct = Product.builder()
                                .id("prod-2")
                                .seller(seller)
                                .category(category)
                                .title(request.getTitle())
                                .price(request.getPrice())
                                .sellType(request.getSellType())
                                .build();

                ProductResponse expectedResponse = ProductResponse.builder()
                                .id("prod-2")
                                .title("Đồng hồ cổ")
                                .price(new BigDecimal("1000000"))
                                .build();

                when(userRepository.findByEmail("seller@test.com")).thenReturn(Optional.of(seller));
                when(categoryRepository.findById("cat-1")).thenReturn(Optional.of(category));
                when(productRepository.save(any(Product.class))).thenReturn(savedProduct);
                when(followRepository.findByFollowing(seller)).thenReturn(List.of());
                when(productMapper.mapToResponse(savedProduct)).thenReturn(expectedResponse);

                ProductResponse response = productCommandService.createProduct(request, "seller@test.com");

                assertThat(response.getId()).isEqualTo("prod-2");
                verify(auctionSessionRepository, times(1)).save(any(AuctionSession.class));
        }

        @Test
        void updateProductFailsWhenAuctionAlreadyHasBids() {
                User seller = User.builder().id("seller-1").username("seller").build();
                Product product = Product.builder()
                                .id("prod-3")
                                .seller(seller)
                                .sellType(SellType.AUCTION)
                                .price(new BigDecimal("100000"))
                                .build();

                AuctionSession session = AuctionSession.builder()
                                .id("session-1")
                                .product(product)
                                .startingPrice(new BigDecimal("100000"))
                                .currentHighestPrice(new BigDecimal("150000"))
                                .status(AuctionStatus.ONGOING)
                                .build();

                ProductRequest updateRequest = ProductRequest.builder()
                                .categoryId("cat-1")
                                .title("Tên mới")
                                .condition(ProductCondition.FAIR)
                                .sellType(SellType.AUCTION)
                                .price(new BigDecimal("200000"))
                                .build();

                when(productRepository.findById("prod-3")).thenReturn(Optional.of(product));
                when(userRepository.findByEmail("seller@test.com")).thenReturn(Optional.of(seller));
                when(auctionSessionRepository.findByProductId("prod-3")).thenReturn(Optional.of(session));

                assertThrows(RuntimeException.class, () -> {
                        productCommandService.updateProduct("prod-3", updateRequest, "seller@test.com");
                });
        }

        @Test
        void deleteProductFailsWhenAuctionAlreadyHasBids() {
                User seller = User.builder().id("seller-1").username("seller").build();
                Product product = Product.builder()
                                .id("prod-4")
                                .seller(seller)
                                .sellType(SellType.AUCTION)
                                .price(new BigDecimal("100000"))
                                .build();

                AuctionSession session = AuctionSession.builder()
                                .id("session-2")
                                .product(product)
                                .startingPrice(new BigDecimal("100000"))
                                .currentHighestPrice(new BigDecimal("150000"))
                                .status(AuctionStatus.ONGOING)
                                .build();

                when(productRepository.findById("prod-4")).thenReturn(Optional.of(product));
                when(userRepository.findByEmail("seller@test.com")).thenReturn(Optional.of(seller));
                when(auctionSessionRepository.findByProductId("prod-4")).thenReturn(Optional.of(session));

                assertThrows(RuntimeException.class, () -> {
                        productCommandService.deleteProduct("prod-4", "seller@test.com");
                });
        }
}
