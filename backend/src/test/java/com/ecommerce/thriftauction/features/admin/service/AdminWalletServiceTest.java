package com.ecommerce.thriftauction.features.admin.service;

import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.payment.dto.TransactionResponse;
import com.ecommerce.thriftauction.features.payment.entity.Transaction;
import com.ecommerce.thriftauction.features.payment.entity.TransactionStatus;
import com.ecommerce.thriftauction.features.payment.entity.TransactionType;
import com.ecommerce.thriftauction.features.payment.entity.Wallet;
import com.ecommerce.thriftauction.features.payment.repository.TransactionRepository;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminWalletServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletService walletService;

    @InjectMocks
    private AdminWalletService adminWalletService;

    @Test
    void manualAdjustBalanceReturnsTheExactCreatedTransaction() {
        Wallet wallet = wallet("wallet-1", "user-1", "buyer", "100000");
        BigDecimal amount = new BigDecimal("25000");
        Transaction created = transaction("tx-created", wallet, amount, TransactionType.DEPOSIT,
                TransactionStatus.COMPLETED);

        when(walletRepository.findByUserIdForUpdate("user-1")).thenReturn(Optional.of(wallet));
        when(walletService.executeCredit(eq(wallet), eq(amount), eq(TransactionType.DEPOSIT),
                eq("Admin điều chỉnh: Correct balance"), isNull(), isNull())).thenReturn(created);

        TransactionResponse response = adminWalletService.manualAdjustBalance(
                "user-1", amount, "  Correct balance  ");

        assertThat(response.getId()).isEqualTo("tx-created");
        assertThat(response.getWalletId()).isEqualTo("wallet-1");
        assertThat(response.getAmount()).isEqualByComparingTo(amount);
        assertThat(response.getStatus()).isEqualTo(TransactionStatus.COMPLETED);
        verifyNoInteractions(transactionRepository);
    }

    @Test
    void manualAdjustBalanceRejectsZeroWithoutTouchingTheWallet() {
        assertThatThrownBy(() -> adminWalletService.manualAdjustBalance("user-1", BigDecimal.ZERO, "reason"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Adjustment amount must not be zero");

        verifyNoInteractions(walletRepository, walletService, transactionRepository);
    }

    @Test
    void manualAdjustBalanceRejectsBlankReasonWithoutTouchingTheWallet() {
        assertThatThrownBy(() -> adminWalletService.manualAdjustBalance("user-1", BigDecimal.ONE, "   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Adjustment reason is required");

        verifyNoInteractions(walletRepository, walletService, transactionRepository);
    }

    @Test
    void rejectWithdrawalLocksTransactionAndWalletThenRefundsOnce() {
        Wallet wallet = wallet("wallet-1", "user-1", "buyer", "50000");
        Transaction withdrawal = transaction("withdrawal-1", wallet, new BigDecimal("30000"),
                TransactionType.WITHDRAW, TransactionStatus.PENDING);
        Transaction refund = transaction("refund-1", wallet, new BigDecimal("30000"),
                TransactionType.REFUND, TransactionStatus.COMPLETED);

        when(transactionRepository.findByIdForUpdate("withdrawal-1")).thenReturn(Optional.of(withdrawal));
        when(walletRepository.findByIdForUpdate("wallet-1")).thenReturn(Optional.of(wallet));
        when(walletService.executeCredit(eq(wallet), eq(new BigDecimal("30000")), eq(TransactionType.REFUND),
                eq("Hoàn tiền rút thất bại"), eq("withdrawal-reject:withdrawal-1"), isNull()))
                .thenReturn(refund);

        TransactionResponse response = adminWalletService.rejectWithdrawal("withdrawal-1");

        assertThat(response.getStatus()).isEqualTo(TransactionStatus.CANCELLED);
        verify(transactionRepository).save(withdrawal);
        verify(walletService).executeCredit(eq(wallet), eq(new BigDecimal("30000")), eq(TransactionType.REFUND),
                eq("Hoàn tiền rút thất bại"), eq("withdrawal-reject:withdrawal-1"), isNull());
    }

    @Test
    void rejectWithdrawalDoesNotRefundAnAlreadyCompletedRequest() {
        Wallet wallet = wallet("wallet-1", "user-1", "buyer", "50000");
        Transaction withdrawal = transaction("withdrawal-1", wallet, new BigDecimal("30000"),
                TransactionType.WITHDRAW, TransactionStatus.COMPLETED);
        when(transactionRepository.findByIdForUpdate("withdrawal-1")).thenReturn(Optional.of(withdrawal));

        assertThatThrownBy(() -> adminWalletService.rejectWithdrawal("withdrawal-1"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Invalid transaction state for rejection");

        verify(walletService, never()).executeCredit(eq(wallet), eq(new BigDecimal("30000")),
                eq(TransactionType.REFUND), eq("Hoàn tiền rút thất bại"),
                eq("withdrawal-reject:withdrawal-1"), isNull());
    }

    private Wallet wallet(String walletId, String userId, String username, String balance) {
        User user = User.builder().id(userId).username(username).email(username + "@example.com").build();
        return Wallet.builder()
                .id(walletId)
                .user(user)
                .balance(new BigDecimal(balance))
                .heldBalance(BigDecimal.ZERO)
                .build();
    }

    private Transaction transaction(String id, Wallet wallet, BigDecimal amount, TransactionType type,
            TransactionStatus status) {
        return Transaction.builder()
                .id(id)
                .wallet(wallet)
                .amount(amount)
                .type(type)
                .status(status)
                .description("description")
                .createdAt(LocalDateTime.now())
                .build();
    }
}
