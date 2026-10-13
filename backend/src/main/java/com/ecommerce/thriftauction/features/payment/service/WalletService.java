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
import com.ecommerce.thriftauction.features.order.entity.Order;
import lombok.RequiredArgsConstructor;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.thriftauction.features.payment.dto.BankAccountRequest;
import com.ecommerce.thriftauction.features.payment.dto.BankAccountResponse;
import com.ecommerce.thriftauction.features.payment.entity.LinkedBankAccount;
import com.ecommerce.thriftauction.features.payment.repository.BankAccountRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import com.ecommerce.thriftauction.features.payment.entity.PaymentIntent;
import com.ecommerce.thriftauction.features.payment.entity.PaymentIntentStatus;
import com.ecommerce.thriftauction.features.payment.repository.PaymentIntentRepository;
import vn.payos.model.webhooks.WebhookData;

@Service
@RequiredArgsConstructor
public class WalletService {

        private final WalletRepository walletRepository;
        private final TransactionRepository transactionRepository;
        private final UserRepository userRepository;
        private final SystemConfigService systemConfigService;
        private final BankAccountRepository bankAccountRepository;
        private final PaymentIntentRepository paymentIntentRepository;

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
        public void processPaymentIntentWebhook(WebhookData data) {
                PaymentIntent intent = paymentIntentRepository.findByOrderCodeForUpdate(data.getOrderCode())
                                .orElseThrow(() -> new RuntimeException(
                                                "PaymentIntent not found for orderCode: " + data.getOrderCode()));

                if (intent.getStatus() == PaymentIntentStatus.SUCCESS) {
                        return;
                }

                if (intent.getAmount().compareTo(BigDecimal.valueOf(data.getAmount())) != 0) {
                        intent.setStatus(PaymentIntentStatus.FAILED);
                        paymentIntentRepository.save(intent);
                        throw new RuntimeException("Amount mismatch");
                }

                intent.setStatus(PaymentIntentStatus.SUCCESS);
                intent.setProviderTransactionId(data.getReference());
                paymentIntentRepository.save(intent);

                Wallet wallet = walletRepository.findByUserIdForUpdate(intent.getUser().getId())
                                .orElseGet(() -> {
                                        Wallet newWallet = Wallet.builder()
                                                        .user(intent.getUser())
                                                        .balance(BigDecimal.ZERO)
                                                        .heldBalance(BigDecimal.ZERO)
                                                        .build();
                                        return walletRepository.save(newWallet);
                                });

                executeCredit(wallet, intent.getAmount(), TransactionType.DEPOSIT,
                                "Nạp tiền (PayOS - " + data.getOrderCode() + ")", String.valueOf(data.getOrderCode()),
                                null);
        }

        @Transactional
        public WalletResponse requestWithdraw(String username,
                        WithdrawRequest request) {
                User user = userRepository.findByEmail(username)
                                .or(() -> userRepository.findByUsername(username))
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Wallet wallet = walletRepository.findByUserIdForUpdate(user.getId())
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

                String description = "";
                if (request.getBankAccountId() != null) {
                        LinkedBankAccount bankAccount = bankAccountRepository
                                        .findById(request.getBankAccountId())
                                        .orElseThrow(() -> new EntityNotFoundException("Bank account not found"));
                        if (!bankAccount.getUser().getId().equals(user.getId())) {
                                throw new AccessDeniedException("Not your bank account");
                        }
                        description = String.format("Ngân hàng: %s | STK: %s | Tên: %s",
                                        bankAccount.getBankName(), bankAccount.getAccountNumber(),
                                        bankAccount.getAccountName());
                } else {
                        description = String.format("Ngân hàng: %s | STK: %s | Tên: %s",
                                        request.getBankName(), request.getAccountNumber(), request.getAccountName());
                }

                // Deduct from balance
                executeDebit(wallet, request.getAmount(), TransactionType.WITHDRAW, TransactionStatus.PENDING,
                                description, null, null);

                // Record fee transaction for user
                executeDebit(wallet, withdrawalFee, TransactionType.WITHDRAWAL_FEE, "Phí rút tiền", null, null);

                // Transfer fee to admin wallet
                userRepository.findByRole(Role.ADMIN).stream()
                                .findFirst()
                                .ifPresent(admin -> {
                                        Wallet adminWallet = walletRepository.findByUserId(admin.getId()).orElse(null);
                                        if (adminWallet != null) {
                                                executeCredit(adminWallet, withdrawalFee,
                                                                TransactionType.WITHDRAWAL_FEE, "Phí rút tiền user",
                                                                null, null);
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

                LinkedBankAccount bankAccount = bankAccountRepository.findById(bankAccountId)
                                .orElseThrow(() -> new EntityNotFoundException("Bank account not found"));

                if (!bankAccount.getUser().getId().equals(user.getId())) {
                        throw new AccessDeniedException("Not your bank account");
                }

                bankAccountRepository.delete(bankAccount);
        }

        @Transactional
        public Transaction executeCredit(Wallet wallet, BigDecimal amount, TransactionType type, String description,
                        String referenceId, Order order) {
                requirePositiveAmount(amount);
                wallet.setBalance(wallet.getBalance().add(amount));
                walletRepository.save(wallet);

                return transactionRepository.save(Transaction.builder()
                                .wallet(wallet).amount(amount).type(type).status(TransactionStatus.COMPLETED)
                                .description(description).referenceId(referenceId).order(order).build());
        }

        @Transactional
        public Transaction executeDebit(Wallet wallet, BigDecimal amount, TransactionType type, String description,
                        String referenceId, Order order) {
                return executeDebit(wallet, amount, type, TransactionStatus.COMPLETED, description, referenceId,
                                order);
        }

        private Transaction executeDebit(Wallet wallet, BigDecimal amount, TransactionType type,
                        TransactionStatus status, String description, String referenceId,
                        Order order) {
                requirePositiveAmount(amount);
                if (wallet.getBalance().compareTo(amount) < 0)
                        throw new RuntimeException("Insufficient balance");
                wallet.setBalance(wallet.getBalance().subtract(amount));
                walletRepository.save(wallet);

                return transactionRepository.save(Transaction.builder()
                                .wallet(wallet).amount(amount).type(type).status(status)
                                .description(description).referenceId(referenceId).order(order).build());
        }

        @Transactional
        public void executeEscrowHold(Wallet wallet, BigDecimal amount, TransactionType type, String description,
                        String referenceId, Order order) {
                requirePositiveAmount(amount);
                if (wallet.getBalance().compareTo(amount) < 0)
                        throw new RuntimeException("Insufficient balance");
                wallet.setBalance(wallet.getBalance().subtract(amount));
                wallet.setHeldBalance(wallet.getHeldBalance() != null ? wallet.getHeldBalance().add(amount) : amount);
                walletRepository.save(wallet);

                transactionRepository.save(Transaction.builder()
                                .wallet(wallet).amount(amount).type(type).status(TransactionStatus.COMPLETED)
                                .description(description).referenceId(referenceId).order(order).build());
        }

        @Transactional
        public void executeEscrowRefund(Wallet wallet, BigDecimal amount, TransactionType type, String description,
                        String referenceId, Order order) {
                requirePositiveAmount(amount);
                if (wallet.getHeldBalance() == null || wallet.getHeldBalance().compareTo(amount) < 0)
                        throw new RuntimeException("Insufficient held balance");
                wallet.setHeldBalance(wallet.getHeldBalance().subtract(amount));
                wallet.setBalance(wallet.getBalance().add(amount));
                walletRepository.save(wallet);

                transactionRepository.save(Transaction.builder()
                                .wallet(wallet).amount(amount).type(type).status(TransactionStatus.COMPLETED)
                                .description(description).referenceId(referenceId).order(order).build());
        }

        @Transactional
        public void executeEscrowRelease(Wallet sourceWallet, Wallet targetWallet, BigDecimal amount, BigDecimal fee,
                        Wallet feeWallet, String description, String referenceId,
                        Order order) {
                requirePositiveAmount(amount);
                if (sourceWallet.getHeldBalance() == null || sourceWallet.getHeldBalance().compareTo(amount) < 0)
                        throw new RuntimeException("Insufficient held balance");

                sourceWallet.setHeldBalance(sourceWallet.getHeldBalance().subtract(amount));
                walletRepository.save(sourceWallet);

                BigDecimal transferAmount = amount.subtract(fee != null ? fee : BigDecimal.ZERO);
                if (transferAmount.compareTo(BigDecimal.ZERO) > 0) {
                        targetWallet.setBalance(targetWallet.getBalance().add(transferAmount));
                        walletRepository.save(targetWallet);

                        transactionRepository.save(Transaction.builder()
                                        .wallet(targetWallet).amount(transferAmount)
                                        .type(TransactionType.ESCROW_RELEASE).status(TransactionStatus.COMPLETED)
                                        .description(description).referenceId(referenceId).order(order).build());
                }

                if (fee != null && fee.compareTo(BigDecimal.ZERO) > 0 && feeWallet != null) {
                        feeWallet.setBalance(feeWallet.getBalance().add(fee));
                        walletRepository.save(feeWallet);

                        transactionRepository.save(Transaction.builder()
                                        .wallet(feeWallet).amount(fee).type(TransactionType.ESCROW_RELEASE)
                                        .status(TransactionStatus.COMPLETED)
                                        .description("Fee: " + description)
                                        .referenceId(referenceId != null ? referenceId + "-FEE" : null).order(order)
                                        .build());
                }
        }

        private void requirePositiveAmount(BigDecimal amount) {
                if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new IllegalArgumentException("Amount must be greater than zero");
                }
        }
}
