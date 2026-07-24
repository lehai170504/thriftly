package com.ecommerce.thriftauction.features.payment.controller;

import com.ecommerce.thriftauction.features.payment.dto.WithdrawRequest;
import com.ecommerce.thriftauction.features.payment.dto.DepositRequest;
import com.ecommerce.thriftauction.features.payment.dto.WalletResponse;
import com.ecommerce.thriftauction.features.payment.dto.BankAccountRequest;
import com.ecommerce.thriftauction.features.payment.dto.BankAccountResponse;
import com.ecommerce.thriftauction.features.payment.service.WalletService;
import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
@Tag(name = "Wallet", description = "Quản lý ví điện tử của người dùng: Nạp tiền, Rút tiền, Số dư")
public class WalletController {

    private final WalletService walletService;

    @Operation(summary = "Xem thông tin ví", description = "Lấy số dư hiện tại và lịch sử giao dịch của user.")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/me")
    public ResponseEntity<WalletResponse> getMyWallet(Authentication authentication) {
        return ResponseEntity.ok(walletService.getMyWallet(authentication.getName()));
    }

    @Operation(summary = "Nạp tiền (Test/Manual)", description = "Nạp tiền thủ công vào ví (Thường dùng cho Dev/Test).")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/deposit")
    public ResponseEntity<WalletResponse> deposit(@RequestBody DepositRequest request, Authentication authentication) {
        return ResponseEntity.ok(walletService.deposit(authentication.getName(), request));
    }

    @Operation(summary = "Yêu cầu rút tiền", description = "Gửi yêu cầu rút tiền từ ví ra tài khoản ngân hàng. Tiền sẽ bị trừ tạm thời chờ Admin duyệt.")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/withdraw")
    public ResponseEntity<WalletResponse> requestWithdraw(
            @RequestBody WithdrawRequest request, Authentication authentication) {
        return ResponseEntity.ok(walletService.requestWithdraw(authentication.getName(), request));
    }

    @Operation(summary = "Lấy danh sách ngân hàng liên kết")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/bank-accounts")
    public ResponseEntity<List<BankAccountResponse>> getBankAccounts(Authentication authentication) {
        return ResponseEntity.ok(walletService.getLinkedBankAccounts(authentication.getName()));
    }

    @Operation(summary = "Thêm ngân hàng liên kết mới")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/bank-accounts")
    public ResponseEntity<BankAccountResponse> addBankAccount(
            @Valid @RequestBody BankAccountRequest request, Authentication authentication) {
        return ResponseEntity.ok(walletService.addLinkedBankAccount(authentication.getName(), request));
    }

    @Operation(summary = "Xóa ngân hàng liên kết")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/bank-accounts/{id}")
    public ResponseEntity<Void> deleteBankAccount(
            @PathVariable String id, Authentication authentication) {
        walletService.deleteLinkedBankAccount(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }
}
