import { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="flex-1">
        {children}
      </div>
      <div className="pb-16 md:pb-0">
        <Footer />
      </div>
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
    </>
  );
}
