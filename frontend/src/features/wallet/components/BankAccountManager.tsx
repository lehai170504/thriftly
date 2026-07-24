'use client';

import { useState } from 'react';
import { useBankAccounts, useAddBankAccount, useDeleteBankAccount } from '@/features/wallet/hooks/useWallet';
import { Building2, Plus, Trash2, Loader2, CreditCard, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function BankAccountManager() {
  const { data: bankAccounts, isLoading } = useBankAccounts();
  const addMutation = useAddBankAccount();
  const deleteMutation = useDeleteBankAccount();

  const [isOpen, setIsOpen] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(
      { bankName, accountNumber, accountName },
      {
        onSuccess: () => {
          setIsOpen(false);
          setBankName('');
          setAccountNumber('');
          setAccountName('');
        }
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Ngân hàng liên kết</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="rounded-xl font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Thêm ngân hàng
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Thêm tài khoản ngân hàng</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Tên ngân hàng (VD: Vietcombank, Techcombank)</Label>
                <Input
                  placeholder="Nhập tên ngân hàng..."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Số tài khoản</Label>
                <Input
                  placeholder="Nhập số tài khoản..."
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tên chủ tài khoản</Label>
                <Input
                  placeholder="Nhập tên in hoa không dấu..."
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                  className="rounded-xl uppercase"
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-xl font-bold h-11" disabled={addMutation.isPending}>
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Lưu tài khoản
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!bankAccounts || bankAccounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl bg-muted/30">
          <Building2 className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Bạn chưa liên kết tài khoản ngân hàng nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bankAccounts.map((account) => (
            <Card key={account.id} className="p-4 rounded-2xl flex items-center justify-between border-border/50 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">{account.bankName}</p>
                  <p className="text-muted-foreground text-sm font-medium">{account.accountNumber} • {account.accountName}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all rounded-xl"
                onClick={() => handleDelete(account.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Add Save icon to imports above (wait, I used Save without importing it, I should fix that)
