'use client';

import { useAdminUsers, useBanUser, useUnbanUser, useAdjustUserBalance, useUpdateUserTier, useUpdateUserRole } from '@/features/admin/hooks/useAdminUsers';
import { UserResponse } from '@/features/admin/types/admin';
import { User, Shield, Mail, Phone, MoreHorizontal, Lock, CheckCircle, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Search, Wallet, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { extractError, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { normalizePageResponse } from '@/lib/pagination';
import { PageHeader } from '@/components/patterns/page-header';
import { NumberText } from '@/components/ui/typography';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [page, setPage] = useState(0);
  const size = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: usersData, isLoading } = useAdminUsers(page, size, debouncedSearchTerm);
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();

  const handleBan = (id: string, username: string) => {
    banMutation.mutate(id, {
      onSuccess: () => toast.success(`Đã khóa tài khoản ${username}`),
      onError: (error) => toast.error(extractError(error, 'Không thể khóa tài khoản. Vui lòng thử lại.'))
    });
  };

  const handleUnban = (id: string, username: string) => {
    unbanMutation.mutate(id, {
      onSuccess: () => toast.success(`Đã kích hoạt tài khoản ${username}`),
      onError: (error) => toast.error(extractError(error, 'Không thể kích hoạt tài khoản. Vui lòng thử lại.'))
    });
  };

  const queryClient = useQueryClient();

  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceReason, setBalanceReason] = useState('');
  const [selectedTier, setSelectedTier] = useState('');

  const adjustBalanceMutation = useAdjustUserBalance();
  const updateTierMutation = useUpdateUserTier();
  const updateRoleMutation = useUpdateUserRole();

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const handleOpenRole = (user: UserResponse) => {
    setSelectedUser(user);
    setSelectedRole(user.role === 'STAFF' ? 'USER' : 'STAFF');
    setRoleModalOpen(true);
  };

  const handleOpenBalance = (user: UserResponse) => {
    setSelectedUser(user);
    setBalanceAmount('');
    setBalanceReason('');
    setBalanceModalOpen(true);
  };

  const handleOpenTier = (user: UserResponse) => {
    setSelectedUser(user);
    setSelectedTier(user.tier || 'BRONZE');
    setTierModalOpen(true);
  };

  const { content: users, totalPages, totalElements } = normalizePageResponse<UserResponse>(usersData);



  if (isLoading) return <div className="p-8 text-center text-neutral-500 font-medium">Đang tải danh sách người dùng...</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Quản lý người dùng" description={<>Tổng cộng <NumberText value={totalElements} /> tài khoản</>} actions={<div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Lọc username hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 md:w-64"
            aria-label="Lọc người dùng"
          />
        </div>} />

      <div className="bg-background/50 rounded-[24px] border border-border shadow-lg glass backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[28%]" />
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead className="text-xs text-muted-foreground uppercase bg-muted border-b border-border">
              <tr>
                <th className="px-5 py-4 font-bold">Người dùng</th>
                <th className="px-5 py-4 font-bold">Liên hệ</th>
                <th className="px-5 py-4 font-bold whitespace-nowrap">Hạng / Đăng ký</th>
                <th className="px-5 py-4 font-bold text-center">Vai trò</th>
                <th className="px-5 py-4 font-bold text-center">Trạng thái</th>
                <th className="px-5 py-4 font-bold text-center">•••</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.id} className={`hover:bg-accent transition-colors ${!user.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border shrink-0 text-sm overflow-hidden ${user.tier === 'DIAMOND' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-none shadow-[0_0_10px_rgba(34,211,238,0.5)]' :
                        user.tier === 'GOLD' ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-black border-none shadow-[0_0_10px_rgba(250,204,21,0.5)]' :
                          user.tier === 'SILVER' ? 'bg-slate-300 text-black border-none' :
                            user.isActive ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/80 text-muted-foreground border-border'
                        }`}>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          user.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-foreground truncate">{user.username}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.fullName || 'Chưa cập nhật tên'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1 text-xs text-foreground/80 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Mail className="w-3 h-3 shrink-0 text-muted-foreground" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 shrink-0 text-muted-foreground" />
                        <span>{user.phone || 'Chưa có SĐT'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs">
                    <div className="flex flex-col gap-1.5">
                      {user.role !== 'ADMIN' && (
                        <div className="flex items-center gap-2">
                          <div className="font-bold">
                            {user.tier === 'DIAMOND' ? <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">💎 KIM CƯƠNG</span> :
                              user.tier === 'GOLD' ? <span className="text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">🏆 VÀNG</span> :
                                user.tier === 'SILVER' ? <span className="text-slate-300">🥈 BẠC</span> :
                                  <span className="text-amber-600">🥉 ĐỒNG</span>}
                          </div>
                          <span className="text-muted-foreground/80 font-mono">({user.totalPoints || 0} pt)</span>
                        </div>
                      )}
                      <div className="text-muted-foreground">Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {user.role === 'ADMIN' ? (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                        <Shield className="w-2.5 h-2.5 mr-1" /> Admin
                      </Badge>
                    ) : user.role === 'STAFF' ? (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                        <Shield className="w-2.5 h-2.5 mr-1" /> Staff
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                        <User className="w-2.5 h-2.5 mr-1" /> User
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {user.isActive ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                        <CheckCircle className="w-2.5 h-2.5 mr-1" /> Hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                        <Ban className="w-2.5 h-2.5 mr-1" /> Đã khóa
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center hover:bg-accent hover:text-accent-foreground rounded-full transition-colors mx-auto">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-background border-border text-foreground glass">
                        {user.isActive ? (
                          <DropdownMenuItem
                            className="cursor-pointer font-medium text-red-600 focus:text-red-700 focus:bg-red-50"
                            onClick={() => handleBan(user.id, user.username)}
                            disabled={banMutation.isPending}
                          >
                            <Lock className="mr-2 h-4 w-4" /> Khóa tài khoản
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="cursor-pointer font-medium text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                            onClick={() => handleUnban(user.id, user.username)}
                            disabled={unbanMutation.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Mở khóa tài khoản
                          </DropdownMenuItem>
                        )}
                        {isAdmin && (
                          <>
                            <DropdownMenuItem
                              className="cursor-pointer font-medium"
                              onClick={() => handleOpenBalance(user)}
                            >
                              <Wallet className="mr-2 h-4 w-4" /> Nạp/Trừ tiền ví
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer font-medium"
                              onClick={() => handleOpenTier(user)}
                            >
                              <TrendingUp className="mr-2 h-4 w-4" /> Đổi hạng thành viên
                            </DropdownMenuItem>
                            {user.role !== 'ADMIN' && (
                              <DropdownMenuItem
                                className={`cursor-pointer font-medium ${user.role === 'STAFF' ? 'text-amber-600' : 'text-blue-600'}`}
                                onClick={() => handleOpenRole(user)}
                              >
                                <Shield className="mr-2 h-4 w-4" /> {user.role === 'STAFF' ? 'Hạ cấp về User' : 'Cấp quyền Staff'}
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-12 text-center text-neutral-500 font-medium">
            Không tìm thấy người dùng nào.
          </div>
        )}
      </div>

      {
        totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-xl"
            >
              Trang trước
            </Button>
            <span className="text-sm font-medium text-neutral-600">
              Trang {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="rounded-xl"
            >
              Trang sau
            </Button>
          </div>
        )
      }

      {/* Balance Modal */}
      <Dialog open={balanceModalOpen} onOpenChange={setBalanceModalOpen}>
        <DialogContent className="sm:max-w-[425px] glass border-border bg-background/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle>Điều chỉnh số dư ví</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="text-sm mb-2">
              Người dùng: <strong className="text-primary">{selectedUser?.username}</strong>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Số tiền (VNĐ) *</label>
              <Input type="number" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} className="bg-muted border-border" placeholder="VD: 50000 (nạp) hoặc -50000 (trừ)" />
              <p className="text-xs text-muted-foreground">Nhập số dương để cộng tiền, số âm để trừ tiền.</p>
              {balanceAmount !== '' && !isNaN(Number(balanceAmount)) && (
                <p className={`text-xs font-medium flex items-center gap-1.5 ${Number(balanceAmount) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse inline-block ${Number(balanceAmount) >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  Biến động: <strong className="font-bold">{Number(balanceAmount) >= 0 ? '+' : '-'}{formatCurrency(Math.abs(Number(balanceAmount)))}</strong>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Lý do điều chỉnh *</label>
              <Input value={balanceReason} onChange={e => setBalanceReason(e.target.value)} className="bg-muted border-border" placeholder="VD: Hoàn tiền đơn hàng lỗi..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceModalOpen(false)}>Hủy</Button>
            <Button disabled={!balanceAmount || !balanceReason || adjustBalanceMutation.isPending} onClick={() => adjustBalanceMutation.mutate({ userId: selectedUser!.id, amount: Number(balanceAmount), reason: balanceReason })}>
              Thực hiện
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tier Modal */}
      <Dialog open={tierModalOpen} onOpenChange={setTierModalOpen}>
        <DialogContent className="sm:max-w-[425px] glass border-border bg-background/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle>Nâng/Hạ Hạng Thành Viên</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="text-sm mb-2">
              Đang chỉnh sửa: <strong className="text-primary">{selectedUser?.username}</strong>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hạng mới *</label>
              <Select value={selectedTier} onValueChange={(val) => setSelectedTier(val || 'BRONZE')}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hạng..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRONZE">🥉 ĐỒNG (Bronze)</SelectItem>
                  <SelectItem value="SILVER">🥈 BẠC (Silver)</SelectItem>
                  <SelectItem value="GOLD">🏆 VÀNG (Gold)</SelectItem>
                  <SelectItem value="DIAMOND">💎 KIM CƯƠNG (Diamond)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTierModalOpen(false)}>Hủy</Button>
            <Button disabled={!selectedTier || updateTierMutation.isPending} onClick={() => updateTierMutation.mutate({ userId: selectedUser!.id, tier: selectedTier })}>
              Cập nhật hạng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Modal */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="sm:max-w-[425px] glass border-border bg-background/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle>Thay đổi Vai trò (Phân quyền)</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="text-sm">
              Bạn đang thay đổi quyền cho: <strong className="text-primary">{selectedUser?.username}</strong>
            </div>
            <p className="text-sm text-muted-foreground">
              Hành động này sẽ {selectedRole === 'STAFF' ? 'cấp quyền truy cập vào Admin Portal cho tài khoản này (Yêu cầu xác thực 2 lớp qua Email).' : 'tước quyền truy cập Admin Portal của tài khoản này.'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleModalOpen(false)}>Hủy</Button>
            <Button
              disabled={updateRoleMutation.isPending}
              className={selectedRole === 'STAFF' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'}
              onClick={() => {
                updateRoleMutation.mutate(
                  { userId: selectedUser!.id, role: selectedRole },
                  {
                    onSuccess: () => {
                      toast.success(`Đã đổi vai trò thành ${selectedRole}`);
                      setRoleModalOpen(false);
                    },
                    onError: (error) => {
                      toast.error('Có lỗi xảy ra: ' + extractError(error));
                    }
                  }
                );
              }}
            >
              Xác nhận {selectedRole}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
