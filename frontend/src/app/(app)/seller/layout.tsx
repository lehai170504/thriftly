'use client';

import React from 'react';
import { SellerSidebar } from '@/components/layout/SellerSidebar';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <SellerSidebar />
        <main className="flex-1 min-w-0">
          <div className="bg-card glass border border-border rounded-[24px] p-6 shadow-sm min-h-[500px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
