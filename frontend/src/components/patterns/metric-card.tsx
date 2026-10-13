import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function MetricCard({ label, value, icon, detail, className }: { label: React.ReactNode; value: React.ReactNode; icon?: React.ReactNode; detail?: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("py-0", className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0"><p className="text-sm text-muted-foreground">{label}</p><div className="mt-1 font-numeric text-2xl font-bold text-foreground">{value}</div>{detail && <div className="mt-2 text-xs text-muted-foreground">{detail}</div>}</div>
        {icon && <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</div>}
      </CardContent>
    </Card>
  );
}

export { MetricCard };
