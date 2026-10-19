package com.ecommerce.thriftauction.features.admin.service;

import com.ecommerce.thriftauction.features.admin.dto.RevenueStatsResponse;
import com.ecommerce.thriftauction.features.payment.entity.Transaction;
import com.ecommerce.thriftauction.features.payment.entity.TransactionType;
import com.ecommerce.thriftauction.features.payment.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminRevenueService {

    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public RevenueStatsResponse getRevenueStats() {
        List<Transaction> commissionTx = transactionRepository.findByType(TransactionType.COMMISSION);
        List<Transaction> feeTx = transactionRepository.findByType(TransactionType.WITHDRAWAL_FEE);

        BigDecimal totalCommission = commissionTx.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalFees = feeTx.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return RevenueStatsResponse.builder()
                .totalCommission(totalCommission)
                .totalWithdrawalFees(totalFees)
                .totalRevenue(totalCommission.add(totalFees))
                .build();
    }

    @Transactional(readOnly = true)
    public Page<Transaction> getRevenueTransactions(Pageable pageable) {
        return transactionRepository.findByTypeInOrderByCreatedAtDesc(
                List.of(TransactionType.COMMISSION, TransactionType.WITHDRAWAL_FEE),
                pageable);
    }
}
