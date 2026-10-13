import * as React from "react";
import { EmptyState } from "@/components/patterns/state-panel";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
};

function DataTable<T>({ rows, columns, getRowKey, emptyTitle = "Chưa có dữ liệu", emptyDescription, className }: { rows: T[]; columns: DataTableColumn<T>[]; getRowKey: (row: T) => React.Key; emptyTitle?: string; emptyDescription?: string; className?: string }) {
  if (rows.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  const alignment = { left: "text-left", center: "text-center", right: "text-right" } as const;

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card shadow-surface", className)}>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><tr>{columns.map((column) => <th key={column.key} scope="col" className={cn("px-4 py-3", alignment[column.align ?? "left"], column.className)}>{column.header}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">{rows.map((row) => <tr key={getRowKey(row)} className="transition-colors hover:bg-muted/30">{columns.map((column) => <td key={column.key} className={cn("px-4 py-3 align-middle", alignment[column.align ?? "left"], column.className)}>{column.cell(row)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="divide-y divide-border md:hidden">{rows.map((row) => <article key={getRowKey(row)} className="space-y-3 p-4">{columns.map((column) => <div key={column.key} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3"><span className="text-xs font-medium text-muted-foreground">{column.header}</span><div className={cn("min-w-0 text-sm", alignment[column.align ?? "left"])}>{column.cell(row)}</div></div>)}</article>)}</div>
    </div>
  );
}

export { DataTable };
