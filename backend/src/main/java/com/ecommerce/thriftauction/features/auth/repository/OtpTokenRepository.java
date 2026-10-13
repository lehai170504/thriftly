package com.ecommerce.thriftauction.features.auth.repository;

import com.ecommerce.thriftauction.features.auth.entity.OtpToken;
import com.ecommerce.thriftauction.features.auth.entity.OtpPurpose;
import com.ecommerce.thriftauction.features.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, String> {
    Optional<OtpToken> findTopByOtpAndUserAndPurposeOrderByExpiryDateDesc(
            String otp, User user, OtpPurpose purpose);

    @Modifying
    @Query("update OtpToken token set token.isUsed = true "
            + "where token.user = :user and token.purpose = :purpose and token.isUsed = false")
    int invalidateUnused(@Param("user") User user, @Param("purpose") OtpPurpose purpose);
}
