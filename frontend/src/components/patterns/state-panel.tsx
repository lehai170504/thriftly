import * as React from "react";
import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatePanelProps = { title: string; description?: string; icon?: React.ReactNode; action?: React.ReactNode; className?: string };

function StatePanel({ title, description, icon, action, className }: StatePanelProps) {
  return <div className={cn("flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/25 p-8 text-center", className)}>{icon && <div className="mb-4 text-muted-foreground">{icon}</div>}<h3 className="text-base font-semibold text-foreground">{title}</h3>{description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}{action && <div className="mt-5">{action}</div>}</div>;
}

function EmptyState(props: Omit<StatePanelProps, "icon"> & { icon?: React.ReactNode }) { return <StatePanel icon={props.icon ?? <Inbox className="size-8" />} {...props} />; }
function ErrorState({ onRetry, ...props }: Omit<StatePanelProps, "icon" | "action"> & { onRetry?: () => void }) { return <StatePanel icon={<AlertCircle className="size-8 text-destructive" />} action={onRetry ? <Button variant="outline" onClick={onRetry}>Thử lại</Button> : undefined} {...props} />; }
function LoadingState({ title = "Đang tải dữ liệu…", description, className }: { title?: string; description?: string; className?: string }) { return <StatePanel title={title} description={description} icon={<LoaderCircle className="size-8 animate-spin text-primary" />} className={className} />; }

export { EmptyState, ErrorState, LoadingState, StatePanel };
