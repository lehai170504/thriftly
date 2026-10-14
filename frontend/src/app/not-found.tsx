import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card p-8 rounded-2xl shadow-xl border border-border text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-5xl font-heading font-black text-foreground mb-2 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-foreground mb-2">Không tìm thấy trang</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Trang bạn đang tìm kiếm có thể đã bị xóa hoặc đường dẫn không chính xác.
        </p>
        <Link href="/">
          <Button className="w-full h-11 text-sm font-semibold rounded-xl shadow-xs">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
