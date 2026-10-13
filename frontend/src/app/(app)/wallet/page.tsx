'use client';

import { useWallet, usePayOSPayment, useWithdraw, useBankAccounts } from '@/features/wallet/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, preventInvalidNumberInput } from '@/lib/utils';
import { Wallet, ArrowDownToLine, ArrowUpRight, History, ShieldCheck, Clock, ArrowLeft, Banknote, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionResponse } from '@/features/wallet/types/wallet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { PageHeader } from '@/components/patterns/page-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/patterns/state-panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { DateTime, Money } from '@/components/ui/typography';

export default function WalletPage() {
  const router = useRouter();
  const { data: wallet, isLoading } = useWallet();
  const { mutate: createPayment, isPending: isDepositing } = usePayOSPayment();
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdraw();
  const { data: bankAccounts = [] } = useBankAccounts();

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  if (isLoading) {
    return <div className="page-container py-8"><LoadingState title="Đang tải thông tin ví…" /></div>;
  }

  if (!wallet) {
    return <div className="page-container py-8"><ErrorState title="Không thể tải thông tin ví" description="Vui lòng thử lại sau." /></div>;
  }

  const handleDeposit = () => {
    const amount = Number(depositAmount);
    if (amount > 0) {
      createPayment(amount, {
        onSuccess: (data) => {
          setDepositAmount('');
          setIsDepositOpen(false);
          if (data?.paymentUrl) {
            window.location.href = data.paymentUrl;
          }
        }
      });
    }
  };

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (amount > 0 && selectedBankId) {
      const selectedBank = bankAccounts.find((b: any) => b.id === selectedBankId);
      if (!selectedBank) return;

      withdraw({
        amount,
        bankName: selectedBank.bankName,
        accountNumber: selectedBank.accountNumber,
        accountName: selectedBank.accountName,
        bankAccountId: selectedBank.id
      }, {
        onSuccess: () => {
          setWithdrawAmount('');
          setSelectedBankId('');
          setIsWithdrawOpen(false);
        }
      });
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <ArrowDownToLine className="w-5 h-5 text-success" />;
      case 'WITHDRAW': return <ArrowUpRight className="w-5 h-5 text-destructive" />;
      case 'ESCROW_HOLD': return <ShieldCheck className="w-5 h-5 text-warning" />;
      case 'ESCROW_RELEASE': return <ShieldCheck className="w-5 h-5 text-success" />;
      case 'PAYMENT': return <ArrowUpRight className="w-5 h-5 text-info" />;
      case 'REFUND': return <ArrowDownToLine className="w-5 h-5 text-info" />;
      default: return <History className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return 'Nạp tiền';
      case 'WITHDRAW': return 'Rút tiền';
      case 'ESCROW_HOLD': return 'Tạm giữ (Ký quỹ)';
      case 'ESCROW_RELEASE': return 'Hoàn trả ký quỹ';
      case 'PAYMENT': return 'Thanh toán đơn hàng';
      case 'REFUND': return 'Hoàn tiền';
      default: return type;
    }
  };

  const getTransactionSign = (type: string) => {
    if (['DEPOSIT', 'ESCROW_RELEASE', 'REFUND'].includes(type)) return '+';
    if (['WITHDRAW', 'PAYMENT', 'ESCROW_HOLD'].includes(type)) return '-';
    return '';
  };

  const getTransactionColor = (type: string) => {
    if (['DEPOSIT', 'ESCROW_RELEASE', 'REFUND'].includes(type)) return 'text-success';
    if (['WITHDRAW', 'PAYMENT', 'ESCROW_HOLD'].includes(type)) return 'text-destructive';
    return 'text-foreground';
  };

  return (
    <div className="page-container py-8 space-y-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2 -ml-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </Button>

      <PageHeader title="Ví điện tử" description="Quản lý số dư và lịch sử giao dịch của bạn" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-primary/30 to-primary/5 text-foreground rounded-[32px] relative overflow-hidden border border-primary/20 p-8 flex flex-col justify-between min-h-[240px]">
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Wallet className="w-32 h-32 text-primary" />
            </div>
            <div className="relative z-10">
              <h3 className="text-primary font-bold text-lg mb-4">Số dư khả dụng</h3>
              <div className="space-y-6">
                <div>
                  <Money value={wallet.balance} className="text-4xl font-bold tracking-tight text-foreground break-words" />
                </div>

                {(wallet.heldBalance || 0) > 0 && (
                  <div className="pt-4 border-t border-primary/20 flex flex-col gap-1">
                    <span className="text-sm text-foreground/80 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Số dư đang tạm giữ
                    </span>
                    <Money value={wallet.heldBalance || 0} className="text-lg" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Nút Nạp tiền tách biệt khỏi DialogTrigger */}
            <Button
              className="h-14 rounded-[20px] font-bold text-base w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={() => setIsDepositOpen(true)}
            >
              <ArrowDownToLine className="w-5 h-5" />
              Nạp tiền
            </Button>

            <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-foreground">Nạp tiền vào ví</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <p className="text-sm text-muted-foreground">Thanh toán bảo mật qua cổng PayOS</p>
                  <div className="flex gap-2 flex-wrap">
                    {[50000, 100000, 500000].map(val => (
                      <Button
                        key={val}
                        variant="outline"
                        size="sm"
                        className="rounded-[16px] border-border bg-muted hover:bg-accent hover:text-accent-foreground text-foreground flex-1"
                        onClick={() => setDepositAmount(val.toString())}
                      >
                        +{formatCurrency(val)}
                      </Button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">VNĐ</span>
                    <Input
                      type="number"
                      placeholder="Nhập số tiền..."
                      className="pl-14 rounded-[20px] bg-muted border-border text-foreground h-12 font-bold"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      onKeyDown={preventInvalidNumberInput}
                      min="0"
                      step="1"
                    />
                  </div>
                  {Number(depositAmount) > 0 && (
                    <p className="text-xs text-primary font-medium flex items-center gap-1.5 px-1 -mt-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block"></span>
                      Sẽ nạp: <strong className="font-bold">{formatCurrency(depositAmount)}</strong>
                    </p>
                  )}
                  <Button
                    className="w-full h-12 rounded-[20px] font-bold"
                    onClick={handleDeposit}
                    disabled={!depositAmount || Number(depositAmount) <= 0 || isDepositing}
                  >
                    {isDepositing ? 'Đang xử lý...' : 'Xác nhận nạp tiền'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Nút Rút tiền tách biệt khỏi DialogTrigger */}
            <Button
              variant="outline"
              className="h-14 rounded-[20px] font-bold text-base w-full bg-background hover:bg-accent text-foreground gap-2 border-2"
              onClick={() => setIsWithdrawOpen(true)}
            >
              <ArrowUpRight className="w-5 h-5" />
              Rút tiền
            </Button>

            <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-orange-500 flex items-center gap-2">
                    <Banknote className="w-5 h-5" /> Rút tiền về Ngân hàng
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">Yêu cầu rút tiền sẽ được Admin xem xét và chuyển về tài khoản liên kết.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">VNĐ</span>
                    <Input
                      type="number"
                      placeholder="Số tiền cần rút..."
                      className="pl-14 rounded-[20px] bg-muted border-border text-foreground h-12 font-bold"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      onKeyDown={preventInvalidNumberInput}
                    />
                  </div>
                  {Number(withdrawAmount) > 0 && (
                    <p className="text-xs text-orange-500 font-medium flex items-center gap-1.5 px-1 -mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse inline-block"></span>
                      Sẽ rút: <strong className="font-bold">{formatCurrency(withdrawAmount)}</strong> (Chưa bao gồm phí)
                    </p>
                  )}

                  {bankAccounts.length === 0 ? (
                    <div className="p-4 bg-orange-500/10 text-orange-600 rounded-[16px] text-sm font-medium flex flex-col gap-3">
                      Bạn chưa liên kết tài khoản ngân hàng nào.
                      <Link href="/profile">
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
                          <Building2 className="w-4 h-4 mr-2" />
                          Liên kết ngân hàng
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Select value={selectedBankId} onValueChange={(val) => setSelectedBankId(val || '')}>
                      <SelectTrigger className="h-12 rounded-[16px] bg-muted border-border text-foreground">
                        {selectedBankId ? (
                          <span className="flex-1 text-left line-clamp-1">
                            {(() => {
                              const b = bankAccounts.find((bank: any) => bank.id === selectedBankId);
                              return b ? `${b.bankName} - ${b.accountNumber} (${b.accountName})` : '';
                            })()}
                          </span>
                        ) : (
                          <span className="flex-1 text-left text-muted-foreground line-clamp-1">Chọn tài khoản nhận tiền...</span>
                        )}
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {bankAccounts.map((bank: any) => (
                          <SelectItem key={bank.id} value={bank.id} className="cursor-pointer">
                            {bank.bankName} - {bank.accountNumber} ({bank.accountName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Button
                    variant="default"
                    className="w-full h-12 rounded-[20px] bg-orange-600 hover:bg-orange-700 text-white font-bold"
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || !selectedBankId || isWithdrawing}
                  >
                    {isWithdrawing ? 'Đang gửi yêu cầu...' : 'Rút tiền ngay'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-[32px] bg-muted/50 border border-border p-6 lg:p-8 min-h-[400px]">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
            <History className="w-5 h-5" /> Lịch sử giao dịch
          </h3>

          {(wallet.recentTransactions || []).length === 0 ? (
            <EmptyState title="Chưa có giao dịch" description="Giao dịch mới sẽ xuất hiện tại đây." icon={<Clock className="size-8" />} />
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {(wallet.recentTransactions || []).map((tx: TransactionResponse) => (
                <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 lg:p-5 rounded-[24px] border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-full flex-shrink-0">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-base">{getTransactionLabel(tx.type)}</p>
                      {tx.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {tx.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        <DateTime value={tx.createdAt} />
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <p className={`font-black text-lg ${getTransactionColor(tx.type)}`}>
                      {getTransactionSign(tx.type)}<Money value={tx.amount} />
                    </p>
                    <StatusBadge domain="transaction" status={tx.status} className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
