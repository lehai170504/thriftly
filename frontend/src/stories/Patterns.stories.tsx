import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Package, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneyField } from "@/components/ui/form-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateTime, EntityId, Money, NumberText } from "@/components/ui/typography";
import { DataTable, type DataTableColumn } from "@/components/patterns/data-table";
import { MetricCard } from "@/components/patterns/metric-card";
import { PageHeader, SectionHeader } from "@/components/patterns/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/patterns/state-panel";

type DemoOrder = { id: string; createdAt: string; total: number; status: string };
const rows: DemoOrder[] = [
  { id: "7f3a91c2e812", createdAt: "2026-10-13T08:30:00Z", total: 1250000, status: "PAID" },
  { id: "9ac012ab7841", createdAt: "2026-10-12T03:15:00Z", total: 450000, status: "COMPLETED" },
];
const columns: DataTableColumn<DemoOrder>[] = [
  { key: "id", header: "Mã đơn", cell: (row) => <EntityId value={row.id} /> },
  { key: "date", header: "Thời gian", cell: (row) => <DateTime value={row.createdAt} /> },
  { key: "status", header: "Trạng thái", cell: (row) => <StatusBadge domain="order" status={row.status} /> },
  { key: "total", header: "Tổng tiền", align: "right", cell: (row) => <Money value={row.total} /> },
];

function PatternGallery() {
  return (
    <div className="page-container space-y-10 py-8">
      <PageHeader eyebrow="Seller workspace" title="Quản lý đơn hàng" description="Theo dõi trạng thái giao dịch và doanh thu từ một nơi." actions={<Button>Tạo sản phẩm</Button>} />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Doanh thu" value={<Money value={12500000} />} icon={<Wallet />} />
        <MetricCard label="Sản phẩm đang bán" value={<NumberText value={1280} />} icon={<Package />} />
      </section>
      <section className="space-y-4"><SectionHeader title="Đơn hàng gần đây" description="Bảng tự chuyển thành row-card trên mobile." /><DataTable rows={rows} columns={columns} getRowKey={(row) => row.id} /></section>
      <section className="grid gap-6 lg:grid-cols-3"><EmptyState title="Chưa có sản phẩm" description="Sản phẩm mới sẽ xuất hiện tại đây." /><LoadingState /><ErrorState title="Không thể tải dữ liệu" description="Kết nối có thể đang gián đoạn." onRetry={() => undefined} /></section>
      <section className="max-w-md"><MoneyField id="story-price" label="Giá bán" help="Nhập giá bằng Việt Nam đồng." required placeholder="0" /></section>
    </div>
  );
}

const meta = { title: "Patterns/Application patterns", component: PatternGallery, parameters: { layout: "fullscreen" } } satisfies Meta<typeof PatternGallery>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
