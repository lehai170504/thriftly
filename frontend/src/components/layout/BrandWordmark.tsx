import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

function BrandWordmark({ href = "/", showMark = true, showName = true, compact = false, className }: { href?: string; showMark?: boolean; showName?: boolean; compact?: boolean; className?: string }) {
  return (
    <Link href={href} aria-label="Thriftly – Trang chủ" className={cn("group inline-flex shrink-0 items-center gap-3", className)}>
      {showMark && <span className={cn("relative overflow-hidden rounded-full border border-border bg-background shadow-surface", compact ? "size-8" : "size-10")}><Image src="/logo.png" alt="" fill sizes={compact ? "32px" : "40px"} className="object-contain scale-110" priority /></span>}
      {showName && <span className={cn("font-brand font-semibold tracking-tight text-foreground", compact ? "text-xl" : "text-2xl")}>Thriftly.</span>}
    </Link>
  );
}

export { BrandWordmark };
