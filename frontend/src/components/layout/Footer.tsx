import Link from 'next/link';
import { BrandWordmark } from '@/components/layout/BrandWordmark';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-background border-t border-[#E5E0D7] dark:border-border pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-14">
          <div className="lg:col-span-2">
            <BrandWordmark className="mb-4" />
            <p className="text-[#77736D] dark:text-muted-foreground mb-6 max-w-sm leading-relaxed text-sm">
              Sàn giao dịch đồ secondhand tuyển chọn và đấu giá trực tuyến. Minh bạch thông tin, kết nối trực tiếp và bảo vệ thanh toán qua quy trình ký quỹ Escrow.
            </p>
          </div>

          <div>
            <h3 className="text-[#191919] dark:text-foreground font-sans font-semibold mb-4 text-xs tracking-[0.14em] uppercase">
              Sàn giao dịch
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/products" className="text-[#77736D] dark:text-muted-foreground hover:text-[#244C3A] dark:hover:text-primary transition-colors">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/products?sellType=AUCTION" className="text-[#77736D] dark:text-muted-foreground hover:text-[#244C3A] dark:hover:text-primary transition-colors">
                  Đấu giá trực tiếp
                </Link>
              </li>
              <li>
                <Link href="/products?sellType=BUY_NOW" className="text-[#77736D] dark:text-muted-foreground hover:text-[#244C3A] dark:hover:text-primary transition-colors">
                  Sản phẩm mua ngay
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-[#77736D] dark:text-muted-foreground hover:text-[#244C3A] dark:hover:text-primary transition-colors">
                  Quy trình hoạt động
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#191919] dark:text-foreground font-sans font-semibold mb-4 text-xs tracking-[0.14em] uppercase">
              Hỗ trợ
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/help" className="text-[#77736D] dark:text-muted-foreground hover:text-[#244C3A] dark:hover:text-primary transition-colors">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-[#77736D] dark:text-muted-foreground hover:text-[#244C3A] dark:hover:text-primary transition-colors">
                  Hướng dẫn mua bán
                </Link>
              </li>
              <li>
                <Link href="/escrow" className="text-[#77736D] dark:text-muted-foreground hover:text-[#244C3A] dark:hover:text-primary transition-colors">
                  Thanh toán Escrow
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#77736D] dark:text-muted-foreground hover:text-[#244C3A] dark:hover:text-primary transition-colors">
                  Về Thriftly
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#191919] dark:text-foreground font-sans font-semibold mb-4 text-xs tracking-[0.14em] uppercase">
              Chính sách
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/policies?tab=terms" className="text-[#77736D] dark:text-muted-foreground hover:text-[#244C3A] dark:hover:text-primary transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/policies?tab=auction" className="text-[#77736D] dark:text-muted-foreground hover:text-[#244C3A] dark:hover:text-primary transition-colors">
                  Quy chế đấu giá
                </Link>
              </li>
              <li>
                <Link href="/policies?tab=privacy" className="text-[#77736D] dark:text-muted-foreground hover:text-[#244C3A] dark:hover:text-primary transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/policies?tab=refund" className="text-[#77736D] dark:text-muted-foreground hover:text-[#244C3A] dark:hover:text-primary transition-colors">
                  Chính sách hoàn tiền
                </Link>
              </li>
              <li>
                <Link href="/report" className="text-[#77736D] dark:text-muted-foreground hover:text-[#244C3A] dark:hover:text-primary transition-colors">
                  Báo cáo vi phạm
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E5E0D7] dark:border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#77736D] dark:text-muted-foreground text-xs">
            © 2026 Thriftly. Tất cả các quyền được bảo lưu.
          </p>
          <p className="text-[#77736D] dark:text-muted-foreground text-xs">
            Nền tảng giao dịch đồ cũ &amp; đấu giá trực tuyến với Escrow
          </p>
        </div>
      </div>
    </footer>
  );
}
