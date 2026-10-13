package com.ecommerce.thriftauction.features.payment.repository;

import com.ecommerce.thriftauction.features.payment.entity.PaymentIntent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PaymentIntentRepository extends JpaRepository<PaymentIntent, String> {
    Optional<PaymentIntent> findByOrderCode(Long orderCode);

    @Query("select intent from PaymentIntent intent "
            + "where intent.orderCode = :orderCode "
            + "and (intent.user.email = :identity or intent.user.username = :identity)")
    Optional<PaymentIntent> findOwnedByOrderCode(
            @Param("orderCode") Long orderCode,
            @Param("identity") String identity);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM PaymentIntent p WHERE p.orderCode = :orderCode")
    Optional<PaymentIntent> findByOrderCodeForUpdate(@Param("orderCode") Long orderCode);
}
