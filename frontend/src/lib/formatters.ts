const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

export function formatMoney(value: number | string | null | undefined, currency = "VND") {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatNumber(value: number | string | null | undefined, options?: Intl.NumberFormatOptions) {
  const numericValue = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN", options).format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function formatDateTime(
  value: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
) {
  if (value === null || value === undefined || value === "") return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: VIETNAM_TIME_ZONE,
    ...options,
  }).format(date);
}

export function formatEntityId(value: string | null | undefined, visibleLength = 8) {
  if (!value) return "—";
  return `#${value.slice(0, visibleLength).toUpperCase()}`;
}

export { VIETNAM_TIME_ZONE };
