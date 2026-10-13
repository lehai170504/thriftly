# Thriftly Design System

Thriftly dùng một visual language “premium marketplace” cho marketing, customer, seller và admin. Route, API, quyền và business flow không thuộc phạm vi thay đổi của design system.

## Typography

| Vai trò | Font | Weight | Quy tắc |
| --- | --- | --- | --- |
| Logo | Playfair Display | 600 | Chỉ dùng qua `BrandWordmark` |
| Marketing display | Playfair Display | 700 | Hero và brand statement |
| Page/section heading | Be Vietnam Pro | 600–700 | Giữ đúng cấu trúc `h1`–`h6` |
| Product/UI/body | Be Vietnam Pro | 400–600 | Product title tối đa hai dòng |
| Money/KPI/countdown | Inter | 600–700 | `tabular-nums lining-nums` |
| ID/tracking/shortcut | System monospace | 500 | Không dùng cho tiền |

Type scale: display 48/56, H1 36/44, H2 30/38, H3 24/32, body 16/24, body-small 14/20, caption 12/16. Không dùng readable text dưới 12px. Button dùng sentence case; uppercase chỉ dành cho badge, eyebrow và trạng thái ngắn.

## Color

Emerald là brand color. Mọi trạng thái dùng semantic token: `brand`, `neutral`, `info`, `success`, `warning`, `danger` và `live`. Page-level code không dùng trực tiếp palette `green-*`, `red-*`, `blue-*`, `orange-*`, ngoại trừ chart và media overlay được audit cho phép. Light và dark phải có semantic parity.

## Spacing, radius và elevation

- Spacing: 4, 8, 12, 16, 24, 32, 48, 64px.
- Control radius: 12px (`rounded-md`).
- Surface/card radius: 16px (`rounded-lg`).
- Dialog/hero radius: 24px (`rounded-xl`).
- Pill chỉ dành cho chip, badge, avatar và toggle.
- Chỉ dùng `shadow-surface`, `shadow-elevated`, `shadow-overlay`; glow chỉ dành cho LIVE.

## Motion và accessibility

Motion kéo dài 150–250ms. Button/card không scale mặc định. `prefers-reduced-motion` tắt chuyển động không thiết yếu. Focus ring phải nhìn thấy bằng bàn phím; touch target tối thiểu 44px trên mobile và 40px trên desktop. Màu chữ/control phải đạt WCAG 2.2 AA.

## Content

- Label và CTA ngắn, cụ thể, sentence case.
- Trạng thái và thuật ngữ nghiệp vụ lấy từ registry dùng chung.
- Tiền, số, ngày giờ và entity ID phải dùng formatter/presentation components.
- Timestamp nghiệp vụ hiển thị theo `Asia/Ho_Chi_Minh`, locale `vi-VN`.
- Loading, empty, error và destructive confirmation dùng shared patterns.
