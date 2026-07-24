package com.ecommerce.thriftauction.features.payment.entity;

import com.ecommerce.thriftauction.features.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "linked_bank_accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkedBankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String bankName;

    @Column(nullable = false)
    private String accountNumber;

    @Column(nullable = false)
    private String accountName;

    @Column(columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isDefault = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
