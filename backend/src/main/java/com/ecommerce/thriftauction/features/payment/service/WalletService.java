package com.ecommerce.thriftauction.features.payment.service;

import com.ecommerce.thriftauction.features.payment.dto.WithdrawRequest;
import com.ecommerce.thriftauction.features.auth.entity.Role;
import com.ecommerce.thriftauction.features.payment.dto.DepositRequest;
import com.ecommerce.thriftauction.features.payment.dto.TransactionResponse;
import com.ecommerce.thriftauction.features.payment.dto.WalletResponse;
import com.ecommerce.thriftauction.features.payment.entity.Transaction;
import com.ecommerce.thriftauction.features.payment.entity.TransactionStatus;
import com.ecommerce.thriftauction.features.payment.entity.TransactionType;
import com.ecommerce.thriftauction.features.auth.entity.User;
import com.ecommerce.thriftauction.features.payment.entity.Wallet;
import com.ecommerce.thriftauction.features.payment.repository.TransactionRepository;
import com.ecommerce.thriftauction.features.auth.repository.UserRepository;
import com.ecommerce.thriftauction.features.payment.repository.WalletRepository;
import com.ecommerce.thriftauction.features.admin.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.thriftauction.features.payment.dto.BankAccountRequest;
import com.ecommerce.thriftauction.features.payment.dto.BankAccountResponse;
import com.ecommerce.thriftauction.features.payment.entity.LinkedBankAccount;
import com.ecommerce.thriftauction.features.payment.repository.BankAccountRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {

        private final WalletRepository walletRepository;
        private final TransactionRepository transactionRepository;
        private final UserRepository userRepository;
        private final SystemConfigService systemConfigService;
        private final BankAccountRepository bankAccountRepository;

        @Transactional(readOnly = true)
        public WalletResponse getMyWallet(String username) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Wallet wallet = walletRepository.findByUserId(user.getId())
                                .orElseGet(() -> {
                                        Wallet newWallet = Wallet.builder()
                                                        .user(user)
                                                        .balance(BigDecimal.ZERO)
                                                        .heldBalance(BigDecimal.ZERO)
                                                        .build();
                                        return walletRepository.save(newWallet);
                                });

                List<Transaction> transactions = transactionRepository
                                .findByWalletIdOrderByCreatedAtDesc(wallet.getId());

                List<TransactionResponse> recentTransactions = transactions.stream()
                                .map(t -> TransactionResponse.builder()
                                                .id(t.getId())
                                                .amount(t.getAmount())
                                                .type(t.getType())
                                                .status(t.getStatus())
                                                .description(t.getDescription())
                                                .username(t.getWallet().getUser().getUsername())
                                                .walletId(t.getWallet().getId())
                                                .createdAt(t.getCreatedAt())
                                                .build())
                                .collect(Collectors.toList());

                return WalletResponse.builder()
                                .id(wallet.getId())
                                .balance(wallet.getBalance() != null ? wallet.getBalance() : BigDecimal.ZERO)
                                .heldBalance(wallet.getHeldBalance() != null ? wallet.getHeldBalance()
                                                : BigDecimal.ZERO)
                                .recentTransactions(recentTransactions)
                                .build();
        }

        @Transactional
        public WalletResponse deposit(String username, DepositRequest request) {
                if (request.getReferenceId() != null
                                && transactionRepository.existsByReferenceId(request.getReferenceId())) {
                        return getMyWallet(username);
                }

                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Wallet wallet = walletRepository.findByUserId(user.getId())
                                .orElseGet(() -> {
                                        Wallet newWallet = Wallet.builder()
                                                        .user(user)
                                                        .balance(BigDecimal.ZERO)
                                                        .heldBalance(BigDecimal.ZERO)
                                                        .build();
                                        return walletRepository.save(newWallet);
                                });

                if (request.getAmount() == null || request.getAmount().signum() <= 0) {
                        throw new RuntimeException("Deposit amount must be greater than zero");
                }

                // Add to balance
                wallet.setBalance(wallet.getBalance().add(request.getAmount()));
                walletRepository.save(wallet);

                // Record transaction
                Transaction tx = Transaction.builder()
                                .wallet(wallet)
                                .amount(request.getAmount())
                                .type(TransactionType.DEPOSIT)
                                .status(TransactionStatus.COMPLETED)
                                .referenceId(request.getReferenceId())
                                .description(request.getDescription() != null ? request.getDescription() : "Nạp tiền")
                                .build();
                transactionRepository.save(tx);

                return getMyWallet(username);
        }

        @Transactional
        public WalletResponse requestWithdraw(String username,
                        WithdrawRequest request) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Wallet wallet = walletRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new RuntimeException("Wallet not found"));

                if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                        throw new RuntimeException("Withdraw amount must be greater than zero");
                }

                BigDecimal minWithdrawalAmount = systemConfigService.getConfig().getMinWithdrawalAmount();
                if (request.getAmount().compareTo(minWithdrawalAmount) < 0) {
                        throw new RuntimeException("Số tiền rút tối thiểu là: " + minWithdrawalAmount + " VNĐ");
                }

                BigDecimal withdrawalFee = new BigDecimal("5000"); // 5k VND fee
                BigDecimal totalDeduction = request.getAmount().add(withdrawalFee);

                if (wallet.getBalance().compareTo(totalDeduction) < 0) {
                        throw new RuntimeException(
                                        "Insufficient balance to cover amount and 5,000 VND withdrawal fee.");
                }

                // Deduct from balance
                wallet.setBalance(wallet.getBalance().subtract(totalDeduction));
                walletRepository.save(wallet);

                String description = "";
                if (request.getBankAccountId() != null) {
                        LinkedBankAccount bankAccount = bankAccountRepository
                                        .findByIdAndUserId(request.getBankAccountId(), user.getId())
                                        .orElseThrow(() -> new RuntimeException("Bank account not found"));
                        description = String.format("Ngân hàng: %s | STK: %s | Tên: %s",
                                        bankAccount.getBankName(), bankAccount.getAccountNumber(),
                                        bankAccount.getAccountName());
                } else {
                        description = String.format("Ngân hàng: %s | STK: %s | Tên: %s",
                                        request.getBankName(), request.getAccountNumber(), request.getAccountName());
                }

                // Record transaction
                Transaction tx = Transaction.builder()
                                .wallet(wallet)
                                .amount(request.getAmount())
                                .type(TransactionType.WITHDRAW)
                                .status(TransactionStatus.PENDING)
                                .description(description)
                                .build();
                transactionRepository.save(tx);

                // Record fee transaction for user
                Transaction feeTx = Transaction.builder()
                                .wallet(wallet)
                                .amount(withdrawalFee)
                                .type(TransactionType.WITHDRAWAL_FEE)
                                .status(TransactionStatus.COMPLETED)
                                .description("Phí rút tiền")
                                .build();
                transactionRepository.save(feeTx);

                // Transfer fee to admin wallet
                userRepository.findByRole(Role.ADMIN).stream()
                                .findFirst()
                                .ifPresent(admin -> {
                                        Wallet adminWallet = walletRepository.findByUserId(admin.getId()).orElse(null);
                                        if (adminWallet != null) {
                                                adminWallet.setBalance(adminWallet.getBalance().add(withdrawalFee));
                                                walletRepository.save(adminWallet);
                                        }
                                });

                return getMyWallet(username);
        }

        @Transactional(readOnly = true)
        public List<BankAccountResponse> getLinkedBankAccounts(String username) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return bankAccountRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                                .stream()
                                .map(b -> BankAccountResponse.builder()
                                                .id(b.getId())
                                                .bankName(b.getBankName())
                                                .accountNumber(b.getAccountNumber())
                                                .accountName(b.getAccountName())
                                                .isDefault(b.getIsDefault())
                                                .createdAt(b.getCreatedAt())
                                                .build())
                                .collect(Collectors.toList());
        }

        @Transactional
        public BankAccountResponse addLinkedBankAccount(String username, BankAccountRequest request) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                boolean isFirst = bankAccountRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).isEmpty();

                LinkedBankAccount bankAccount = LinkedBankAccount.builder()
                                .user(user)
                                .bankName(request.getBankName())
                                .accountNumber(request.getAccountNumber())
                                .accountName(request.getAccountName())
                                .isDefault(isFirst)
                                .build();

                bankAccountRepository.save(bankAccount);

                return BankAccountResponse.builder()
                                .id(bankAccount.getId())
                                .bankName(bankAccount.getBankName())
                                .accountNumber(bankAccount.getAccountNumber())
                                .accountName(bankAccount.getAccountName())
                                .isDefault(bankAccount.getIsDefault())
                                .createdAt(bankAccount.getCreatedAt())
                                .build();
        }

        @Transactional
        public void deleteLinkedBankAccount(String username, String bankAccountId) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                LinkedBankAccount bankAccount = bankAccountRepository.findByIdAndUserId(bankAccountId, user.getId())
                                .orElseThrow(() -> new RuntimeException("Bank account not found or access denied"));

                bankAccountRepository.delete(bankAccount);
        }
}
