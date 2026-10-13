import AppHeader from "@/components/layout/AppHeader";
import Footer from "@/components/layout/Footer";
import { CategoryOnboardingModal } from "@/features/onboarding/CategoryOnboardingModal";
import { Suspense } from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-20 bg-background border-b border-border" />}>
        <AppHeader />
      </Suspense>
      <div className="flex-1 bg-background text-foreground">
        {children}
      </div>
      <Footer />
      <CategoryOnboardingModal />
    </>
  );
}
