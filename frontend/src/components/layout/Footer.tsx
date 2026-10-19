import Link from "next/link";
import { BrandWordmark } from "@/components/layout/BrandWordmark";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-12 mt-16">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-16">

          <div className="lg:col-span-2">
            <BrandWordmark className="mb-5" />
            <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed text-sm font-medium">
              Sàn giao dịch thanh lý đồ cũ và đấu giá trực tuyến. Minh bạch, an toàn với cơ chế bảo đảm thanh toán trung gian.
            </p>
          </div>

          <div>
            <h3 className="text-foreground font-heading font-semibold mb-5 text-sm tracking-wider uppercase">Khám phá</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Tất cả sản phẩm</Link></li>
              <li><Link href="/products?sellType=AUCTION" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Đấu giá trực tiếp</Link></li>
              <li><Link href="/products?sellType=FIXED_PRICE" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Sản phẩm mua ngay</Link></li>
              <li><Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Quy trình hoạt động</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-heading font-semibold mb-5 text-sm tracking-wider uppercase">Hỗ trợ</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Trung tâm trợ giúp</Link></li>
              <li><Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Cách thức hoạt động</Link></li>
              <li><Link href="/escrow" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Thanh toán Escrow</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Về chúng tôi</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-heading font-semibold mb-5 text-sm tracking-wider uppercase">Chính sách</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/policies?tab=terms" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Điều khoản sử dụng</Link></li>
              <li><Link href="/policies?tab=auction" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Quy chế đấu giá</Link></li>
              <li><Link href="/policies?tab=privacy" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Chính sách bảo mật</Link></li>
              <li><Link href="/policies?tab=refund" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Chính sách hoàn tiền</Link></li>
              <li><Link href="/report" className="text-muted-foreground hover:text-foreground transition-colors font-medium">Báo cáo vi phạm</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs font-medium">
            © 2026 Thriftly. Tất cả các quyền được bảo lưu.
          </p>
          <p className="text-muted-foreground text-xs font-medium">
            Nền tảng thanh lý &amp; đấu giá thông minh
          </p>
        </div>
      </div>
    </footer>
  );
}
