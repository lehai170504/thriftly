package com.ecommerce.thriftauction.features.payment.repository;

import com.ecommerce.thriftauction.features.payment.entity.LinkedBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<LinkedBankAccount, String> {
    List<LinkedBankAccount> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<LinkedBankAccount> findByIdAndUserId(String id, String userId);
}
