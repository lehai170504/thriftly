import AppHeader from "@/components/layout/AppHeader";
import Footer from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CategoryOnboardingModal } from "@/features/onboarding/CategoryOnboardingModal";
import { Suspense } from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-[72px] bg-background border-b border-border" />}>
        <AppHeader />
      </Suspense>
      <div className="flex-1 bg-background text-foreground">
        {children}
      </div>
      <div className="pb-16 md:pb-0">
        <Footer />
      </div>
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
      <CategoryOnboardingModal />
    </>
  );
}
