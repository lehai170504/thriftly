package com.ecommerce.thriftauction.features.order.service;

import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.order.dto.ReviewRequest;
import com.ecommerce.thriftauction.features.order.dto.ReviewResponse;
import com.ecommerce.thriftauction.features.order.entity.Order;
import com.ecommerce.thriftauction.features.order.entity.OrderStatus;
import com.ecommerce.thriftauction.features.order.entity.Review;
import com.ecommerce.thriftauction.features.order.repository.OrderRepository;
import com.ecommerce.thriftauction.features.order.repository.ReviewRepository;
import com.ecommerce.thriftauction.features.product.entity.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTests {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User buyer;
    private User seller;
    private Order order;

    @BeforeEach
    void setUp() {
        buyer = User.builder().id("buyer-1").username("buyer1").email("buyer@test.com").build();
        seller = User.builder().id("seller-1").username("seller1").email("seller@test.com").build();
        Product product = Product.builder().id("prod-1").title("Vintage Watch").seller(seller).build();

        order = Order.builder()
                .id("order-1")
                .buyer(buyer)
                .seller(seller)
                .product(product)
                .status(OrderStatus.COMPLETED)
                .build();
    }

    @Test
    void createReview_successful() {
        ReviewRequest request = new ReviewRequest(5, "Tuyet voi!");

        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(reviewRepository.findByOrderId("order-1")).thenReturn(Optional.empty());

        Review savedReview = Review.builder()
                .id("review-1")
                .reviewer(buyer)
                .reviewee(seller)
                .order(order)
                .rating(5)
                .comment("Tuyet voi!")
                .likedByUsers(new HashSet<>())
                .createdAt(LocalDateTime.now())
                .build();

        when(reviewRepository.save(any(Review.class))).thenReturn(savedReview);

        ReviewResponse response = reviewService.createReview("order-1", "buyer@test.com", request);

        assertNotNull(response);
        assertEquals(5, response.getRating());
        assertEquals("Tuyet voi!", response.getComment());
        assertEquals("buyer1", response.getReviewerName());
        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    void createReview_failsWhenNotBuyer() {
        ReviewRequest request = new ReviewRequest(5, "Tuyet voi!");

        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));

        assertThrows(AccessDeniedException.class,
                () -> reviewService.createReview("order-1", "stranger@test.com", request));
    }

    @Test
    void createReview_failsWhenOrderNotCompleted() {
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        ReviewRequest request = new ReviewRequest(5, "Tuyet voi!");

        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> reviewService.createReview("order-1", "buyer@test.com", request));

        assertTrue(exception.getMessage().contains("hoàn thành"));
    }

    @Test
    void createReview_failsWhenAlreadyReviewed() {
        ReviewRequest request = new ReviewRequest(5, "Tuyet voi!");

        when(orderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(reviewRepository.findByOrderId("order-1")).thenReturn(Optional.of(new Review()));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> reviewService.createReview("order-1", "buyer@test.com", request));

        assertTrue(exception.getMessage().contains("đã đánh giá"));
    }

    @Test
    void replyReview_successful() {
        Review review = Review.builder()
                .id("review-1")
                .reviewer(buyer)
                .reviewee(seller)
                .order(order)
                .rating(5)
                .comment("San pham rat tot")
                .likedByUsers(new HashSet<>())
                .createdAt(LocalDateTime.now())
                .build();

        when(reviewRepository.findById("review-1")).thenReturn(Optional.of(review));
        when(userRepository.findByEmail("seller@test.com")).thenReturn(Optional.of(seller));
        when(reviewRepository.save(any(Review.class))).thenReturn(review);

        ReviewResponse response = reviewService.replyReview("review-1", "seller@test.com", "Cam on ban nhe!");

        assertNotNull(response);
        assertEquals("Cam on ban nhe!", review.getSellerReply());
        verify(reviewRepository, times(1)).save(review);
    }

    @Test
    void replyReview_failsWhenNotSeller() {
        Review review = Review.builder()
                .id("review-1")
                .reviewer(buyer)
                .reviewee(seller)
                .order(order)
                .build();

        when(reviewRepository.findById("review-1")).thenReturn(Optional.of(review));
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(buyer));

        assertThrows(AccessDeniedException.class,
                () -> reviewService.replyReview("review-1", "buyer@test.com", "Hack reply"));
    }
}
