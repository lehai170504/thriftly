import * as React from "react";
import { AlertCircle, PackageSearch, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatePanelProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

function StatePanel({ title, description, icon, action, className }: StatePanelProps) {
  return (
    <div className={cn("flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center shadow-xs", className)}>
      {icon && (
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted/80 border border-border/80 text-primary shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="font-heading text-lg font-bold text-foreground tracking-tight">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{action}</div>}
    </div>
  );
}

function EmptyState(props: Omit<StatePanelProps, "icon"> & { icon?: React.ReactNode }) {
  return <StatePanel icon={props.icon ?? <PackageSearch className="size-8 text-primary/80" />} {...props} />;
}

function ErrorState({ onRetry, ...props }: Omit<StatePanelProps, "icon" | "action"> & { onRetry?: () => void }) {
  return (
    <StatePanel
      icon={<AlertCircle className="size-8 text-destructive" />}
      action={onRetry ? <Button variant="outline" className="rounded-xl font-medium" onClick={onRetry}>Thử lại</Button> : undefined}
      {...props}
    />
  );
}

function LoadingState({ title = "Đang tải dữ liệu…", description = "Vui lòng đợi trong giây lát...", className }: { title?: string; description?: string; className?: string }) {
  return (
    <div className={cn("flex min-h-64 flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/60 p-8 sm:p-12 text-center shadow-xs", className)}>
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-xs animate-pulse">
        <LoaderCircle className="size-8 animate-spin text-primary" />
      </div>
      <h3 className="font-heading text-lg font-bold text-foreground tracking-tight">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">{description}</p>}
    </div>
  );
}

export { EmptyState, ErrorState, LoadingState, StatePanel };
