import { Skeleton } from "./skeleton"

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="h-48 md:h-64 bg-muted animate-pulse"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl -mt-16 md:-mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-4 border-background bg-muted animate-pulse shadow-md" />
            <div className="mt-4 w-32 h-5 bg-muted animate-pulse rounded-lg" />
            <div className="mt-2 w-24 h-4 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="w-full md:w-2/3 bg-card rounded-2xl p-6 shadow-xs border border-border">
            <div className="flex gap-4 border-b border-border pb-4 mb-6">
              <div className="w-24 h-9 bg-muted animate-pulse rounded-lg" />
              <div className="w-32 h-9 bg-muted animate-pulse rounded-lg" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="w-20 h-4 bg-muted animate-pulse rounded" />
                  <div className="w-full h-11 bg-muted animate-pulse rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OrderListSkeleton({ title, subtitle }: { title?: string, subtitle?: string }) {
  return (
    <div className="container py-8 max-w-5xl mx-auto space-y-4 min-h-[60vh]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-muted animate-pulse rounded-xl"></div>
        <div className="space-y-2">
          <div className="w-48 h-6 bg-muted animate-pulse rounded"></div>
          <div className="w-64 h-4 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-card p-5 rounded-2xl shadow-xs border border-border flex flex-col md:flex-row gap-5 items-center">
          <div className="w-20 h-20 bg-muted animate-pulse rounded-xl"></div>
          <div className="flex-1 space-y-3 w-full">
            <div className="w-1/4 h-4 bg-muted animate-pulse rounded"></div>
            <div className="w-3/4 h-5 bg-muted animate-pulse rounded"></div>
            <div className="w-1/2 h-4 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <div className="container mx-auto px-4 py-6">
        <div className="w-48 h-5 bg-muted animate-pulse rounded mb-6"></div>
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-surface border border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square bg-muted animate-pulse rounded-xl border border-border"></div>

            <div className="flex flex-col">
              <div className="flex gap-2.5 mb-3">
                <div className="w-20 h-5 bg-muted animate-pulse rounded-full"></div>
                <div className="w-20 h-5 bg-muted animate-pulse rounded-full"></div>
              </div>
              <div className="w-3/4 h-8 bg-muted animate-pulse rounded mb-3"></div>
              <div className="w-1/3 h-7 bg-muted animate-pulse rounded mb-6"></div>

              <div className="p-5 bg-muted/30 rounded-xl border border-border mb-6 space-y-3">
                <div className="w-full h-10 bg-muted animate-pulse rounded-lg"></div>
                <div className="w-1/2 h-4 bg-muted animate-pulse rounded"></div>
              </div>

              <div className="space-y-2.5">
                <div className="w-full h-4 bg-muted animate-pulse rounded"></div>
                <div className="w-full h-4 bg-muted animate-pulse rounded"></div>
                <div className="w-2/3 h-4 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl shadow-xs border border-border overflow-hidden flex flex-col">
          <div className="aspect-square w-full bg-muted animate-pulse"></div>
          <div className="p-3.5 flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="w-16 h-3 bg-muted animate-pulse rounded"></div>
              <div className="w-12 h-3 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="w-full h-4 bg-muted animate-pulse rounded"></div>
            <div className="w-2/3 h-4 bg-muted animate-pulse rounded"></div>
            <div className="mt-auto pt-2 flex items-center justify-between">
              <div className="w-20 h-5 bg-muted animate-pulse rounded"></div>
              <div className="w-6 h-6 bg-muted animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function AuctionRoomSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-24 h-5 bg-muted animate-pulse rounded"></div>
          <div className="w-20 h-5 bg-muted animate-pulse rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-xs flex flex-col md:flex-row gap-6 items-start h-1/2">
              <div className="w-full md:w-1/3 aspect-square rounded-xl bg-muted animate-pulse"></div>
              <div className="flex-1 flex flex-col w-full h-full">
                <div className="w-24 h-5 bg-muted animate-pulse rounded-full mb-2.5"></div>
                <div className="w-3/4 h-7 bg-muted animate-pulse rounded mb-2"></div>
                <div className="w-full h-4 bg-muted animate-pulse rounded mb-4"></div>
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-xl p-3 border border-border h-16 animate-pulse"></div>
                  <div className="bg-muted rounded-xl p-3 border border-border h-16 animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 flex-1 animate-pulse"></div>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border shadow-xs flex flex-col h-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="container px-4 sm:px-6 py-8 max-w-7xl mx-auto space-y-6 min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
      <DashboardInnerSkeleton />
    </div>
  )
}

export function DashboardInnerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col items-center justify-center p-3">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-24 mb-1.5" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs lg:col-span-2 h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs h-[400px]">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-[280px] w-[280px] rounded-full mx-auto" />
        </div>
      </div>
    </div>
  )
}
