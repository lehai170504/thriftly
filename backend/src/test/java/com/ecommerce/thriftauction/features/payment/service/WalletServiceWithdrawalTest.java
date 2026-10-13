package com.ecommerce.thriftauction.features.payment.service;

import com.ecommerce.thriftauction.features.admin.entity.SystemConfig;
import com.ecommerce.thriftauction.features.admin.service.SystemConfigService;
import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.payment.dto.WithdrawRequest;
import com.ecommerce.thriftauction.features.payment.entity.Transaction;
import com.ecommerce.thriftauction.features.payment.entity.TransactionStatus;
import com.ecommerce.thriftauction.features.payment.entity.TransactionType;
import com.ecommerce.thriftauction.features.payment.entity.Wallet;
import com.ecommerce.thriftauction.features.payment.repository.BankAccountRepository;
import com.ecommerce.thriftauction.features.payment.repository.PaymentIntentRepository;
import com.ecommerce.thriftauction.features.payment.repository.TransactionRepository;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WalletServiceWithdrawalTest {

    @Mock
    private WalletRepository walletRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SystemConfigService systemConfigService;
    @Mock
    private BankAccountRepository bankAccountRepository;
    @Mock
    private PaymentIntentRepository paymentIntentRepository;

    @InjectMocks
    private WalletService walletService;

    @Test
    void withdrawalRequestCreatesPendingWithdrawalAndCompletedFee() {
        User user = User.builder().id("user-1").username("buyer").email("buyer@example.com").build();
        Wallet wallet = Wallet.builder()
                .id("wallet-1")
                .user(user)
                .balance(new BigDecimal("1000000"))
                .heldBalance(BigDecimal.ZERO)
                .build();
        SystemConfig config = SystemConfig.builder()
                .minWithdrawalAmount(new BigDecimal("50000"))
                .platformFeePercent(new BigDecimal("0.05"))
                .isMaintenanceMode(false)
                .build();
        WithdrawRequest request = new WithdrawRequest();
        request.setAmount(new BigDecimal("50000"));
        request.setBankName("Test Bank");
        request.setAccountNumber("123456789");
        request.setAccountName("BUYER");

        when(userRepository.findByEmail("buyer@example.com")).thenReturn(Optional.of(user));
        when(walletRepository.findByUserIdForUpdate("user-1")).thenReturn(Optional.of(wallet));
        when(walletRepository.findByUserId("user-1")).thenReturn(Optional.of(wallet));
        when(systemConfigService.getConfig()).thenReturn(config);
        when(userRepository.findByRole(Role.ADMIN)).thenReturn(List.of());
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.findByWalletIdOrderByCreatedAtDesc("wallet-1")).thenReturn(List.of());

        walletService.requestWithdraw("buyer@example.com", request);

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository, times(2)).save(captor.capture());
        List<Transaction> transactions = captor.getAllValues();

        assertThat(transactions.get(0).getType()).isEqualTo(TransactionType.WITHDRAW);
        assertThat(transactions.get(0).getStatus()).isEqualTo(TransactionStatus.PENDING);
        assertThat(transactions.get(0).getAmount()).isEqualByComparingTo("50000");
        assertThat(transactions.get(1).getType()).isEqualTo(TransactionType.WITHDRAWAL_FEE);
        assertThat(transactions.get(1).getStatus()).isEqualTo(TransactionStatus.COMPLETED);
        assertThat(wallet.getBalance()).isEqualByComparingTo("945000");
    }
}
