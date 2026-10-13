import type { ComponentProps } from "react";
import type { Badge } from "@/components/ui/badge";

export type StatusDomain = "order" | "product" | "report" | "transaction" | "withdrawal" | "voucher";
export type StatusTone = NonNullable<ComponentProps<typeof Badge>["tone"]>;

type StatusPresentation = { label: string; tone: StatusTone };

const statusRegistry: Record<StatusDomain, Record<string, StatusPresentation>> = {
  order: {
    PENDING: { label: "Đang chờ", tone: "warning" },
    PENDING_PAYMENT: { label: "Chờ thanh toán", tone: "warning" },
    PAID: { label: "Đã thanh toán", tone: "info" },
    SHIPPED: { label: "Đang giao", tone: "info" },
    DELIVERED: { label: "Đã giao", tone: "brand" },
    COMPLETED: { label: "Hoàn thành", tone: "success" },
    CANCELLED: { label: "Đã hủy", tone: "danger" },
    CANCELED: { label: "Đã hủy", tone: "danger" },
    REFUNDED: { label: "Đã hoàn tiền", tone: "neutral" },
    DISPUTED: { label: "Đang tranh chấp", tone: "danger" },
    RETURNING: { label: "Đang hoàn hàng", tone: "warning" },
    RETURNED: { label: "Đã hoàn hàng", tone: "neutral" },
  },
  product: {
    ACTIVE: { label: "Đang bán", tone: "success" },
    SOLD: { label: "Đã bán", tone: "neutral" },
    HIDDEN: { label: "Đã ẩn", tone: "warning" },
    CANCELLED: { label: "Đã hủy", tone: "danger" },
    DELETED: { label: "Đã xóa", tone: "danger" },
    BANNED: { label: "Bị khóa", tone: "danger" },
  },
  report: {
    PENDING: { label: "Chờ xử lý", tone: "warning" },
    RESOLVED: { label: "Đã giải quyết", tone: "success" },
    REJECTED: { label: "Đã từ chối", tone: "danger" },
  },
  transaction: {
    PENDING: { label: "Đang xử lý", tone: "warning" },
    COMPLETED: { label: "Thành công", tone: "success" },
    FAILED: { label: "Thất bại", tone: "danger" },
    CANCELLED: { label: "Đã hủy", tone: "neutral" },
  },
  withdrawal: {
    PENDING: { label: "Chờ duyệt", tone: "warning" },
    COMPLETED: { label: "Đã chuyển", tone: "success" },
    APPROVED: { label: "Đã duyệt", tone: "success" },
    REJECTED: { label: "Đã từ chối", tone: "danger" },
    FAILED: { label: "Thất bại", tone: "danger" },
  },
  voucher: {
    ACTIVE: { label: "Đang hoạt động", tone: "success" },
    INACTIVE: { label: "Đã tắt", tone: "neutral" },
    EXPIRED: { label: "Hết hạn", tone: "danger" },
    EXHAUSTED: { label: "Hết lượt", tone: "warning" },
  },
};

export function getStatusPresentation(domain: StatusDomain, status: string): StatusPresentation {
  return statusRegistry[domain][status] ?? {
    label: status.replaceAll("_", " ").toLocaleLowerCase("vi-VN"),
    tone: "neutral",
  };
}

export { statusRegistry };
