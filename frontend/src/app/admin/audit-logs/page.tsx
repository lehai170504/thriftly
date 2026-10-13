'use client';

import { useState } from 'react';
import { useAuditLogs } from '@/features/admin/hooks/useAuditLogs';
import { normalizePageResponse } from '@/lib/pagination';
import {
  Shield, Search, ChevronLeft, ChevronRight, Clock,
  User, Filter, ShieldAlert, Layers, Activity,
  Trash2, Ban, CheckCircle, XCircle, Wallet, Gavel,
  ShoppingCart, AlertTriangle, TrendingUp, CoinsIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const ACTION_CONFIG: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  DELETE_PRODUCT: { color: 'bg-red-100 text-red-700 border-red-200', icon: Trash2, label: 'Xóa sản phẩm' },
  BAN_USER: { color: 'bg-red-100 text-red-700 border-red-200', icon: Ban, label: 'Khóa tài khoản' },
  UNBAN_USER: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Mở khóa' },
  APPROVE_WITHDRAWAL: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle, label: 'Duyệt rút tiền' },
  REJECT_WITHDRAWAL: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: XCircle, label: 'Từ chối rút tiền' },
  ADJUST_BALANCE: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Wallet, label: 'Điều chỉnh số dư' },
  RESOLVE_DISPUTE: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Gavel, label: 'Phán quyết khiếu nại' },
  BUY_NOW: { color: 'bg-sky-100 text-sky-700 border-sky-200', icon: ShoppingCart, label: 'Mua hàng' },
  CREATE_DISPUTE: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle, label: 'Tạo khiếu nại' },
  PLACE_BID: { color: 'bg-violet-100 text-violet-700 border-violet-200', icon: TrendingUp, label: 'Đặt giá đấu giá' },
  AUCTION_DEPOSIT: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: CoinsIcon, label: 'Đặt cọc đấu giá' },
};

const ADMIN_ACTIONS = ['DELETE_PRODUCT', 'BAN_USER', 'UNBAN_USER', 'APPROVE_WITHDRAWAL', 'REJECT_WITHDRAWAL', 'ADJUST_BALANCE', 'RESOLVE_DISPUTE'];
const USER_ACTIONS = ['BUY_NOW', 'CREATE_DISPUTE', 'PLACE_BID', 'AUCTION_DEPOSIT'];

interface AuditLog {
  id: string;
  actorUsername: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  targetLabel: string;
  detail: string;
  ipAddress: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data, isLoading } = useAuditLogs(page, search, actionFilter, roleFilter);

  const normalized = normalizePageResponse<AuditLog>(data);
  const logs: AuditLog[] = normalized.content;
  const totalPages: number = normalized.totalPages;
  const totalElements: number = normalized.totalElements;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const actionOptions = roleFilter === 'ADMIN'
    ? ADMIN_ACTIONS
    : roleFilter === 'USER'
      ? USER_ACTIONS
      : [...ADMIN_ACTIONS, ...USER_ACTIONS];

  const TABS = [
    { label: 'Tất cả', value: '', icon: Layers },
    { label: 'Admin', value: 'ADMIN', icon: ShieldAlert },
    { label: 'Người dùng', value: 'USER', icon: Activity },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground leading-tight">Audit Log Hệ Thống</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Lịch sử hành động Admin &amp; người dùng
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {totalElements} bản ghi
            </span>
          </p>
        </div>
      </div>

      {/* Role Tab Filter */}
      <div className="flex gap-1 p-1 bg-muted/60 rounded-xl w-fit border border-border shadow-inner">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = roleFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => { setRoleFilter(tab.value); setActionFilter(''); setPage(0); }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                transition-all duration-200
                ${isActive
                  ? 'bg-background text-foreground shadow-sm border border-border scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }
              `}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-primary' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo username, hành động, đối tượng..."
              className="pl-9 bg-background border-border h-10 transition-shadow focus:shadow-md"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all duration-150 shadow-sm"
          >
            Tìm
          </button>
        </form>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            className="pl-9 pr-4 py-2 h-10 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[200px] cursor-pointer transition-shadow hover:shadow-sm"
          >
            <option value="">Tất cả hành động</option>
            {actionOptions.map((a) => (
              <option key={a} value={a}>{ACTION_CONFIG[a]?.label ?? a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-muted-foreground">
            <div className="w-9 h-9 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium animate-pulse">Đang tải dữ liệu...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <Shield className="w-8 h-8 opacity-30" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Không có bản ghi nào</p>
              <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log, idx) => {
              const cfg = ACTION_CONFIG[log.action];
              const colorClass = cfg?.color ?? 'bg-neutral-100 text-neutral-700 border-neutral-200';
              const label = cfg?.label ?? log.action;
              const ActionIcon = cfg?.icon ?? Activity;
              const isAdmin = log.actorRole === 'ADMIN';
              return (
                <div
                  key={log.id}
                  style={{ animationDelay: `${idx * 30}ms` }}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4
                    hover:bg-accent/40 transition-colors duration-150 group
                    animate-in fade-in slide-in-from-top-1"
                >
                  {/* Actor Avatar */}
                  <div
                    className={`
                      w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                      transition-transform duration-200 group-hover:scale-110
                      ${isAdmin ? 'bg-red-100 border border-red-200' : 'bg-primary/10 border border-primary/20'}
                    `}
                  >
                    {isAdmin
                      ? <ShieldAlert className="w-4 h-4 text-red-600" />
                      : <User className="w-4 h-4 text-primary" />
                    }
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{log.actorUsername}</span>

                      {/* Role badge */}
                      <span className={`
                        inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border
                        ${isAdmin
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-primary/8 text-primary border-primary/20'
                        }
                      `}>
                        {isAdmin
                          ? <ShieldAlert className="w-2.5 h-2.5" />
                          : <User className="w-2.5 h-2.5" />
                        }
                        {isAdmin ? 'ADMIN' : 'USER'}
                      </span>

                      {/* Action badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorClass}`}>
                        <ActionIcon className="w-3 h-3" />
                        {label}
                      </span>

                      {log.targetLabel && (
                        <span className="text-xs text-muted-foreground font-medium truncate max-w-[180px]">
                          · {log.targetLabel}
                        </span>
                      )}
                    </div>

                    {log.detail && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{log.detail}</p>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                    {log.ipAddress && (
                      <span className="font-mono bg-muted px-2 py-1 rounded-md text-[11px] hidden sm:block">
                        {log.ipAddress}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: vi })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between animate-in fade-in duration-200">
          <p className="text-sm text-muted-foreground">
            Trang <span className="font-semibold text-foreground">{page + 1}</span> / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
            >
              <ChevronLeft className="w-4 h-4" />
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
            >
              Sau
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
