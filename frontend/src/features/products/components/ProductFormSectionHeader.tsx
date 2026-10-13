import { SectionHeader } from "@/components/patterns/page-header";
import { cn } from "@/lib/utils";

type ProductFormSectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function ProductFormSectionHeader({
  title,
  description,
  className,
}: ProductFormSectionHeaderProps) {
  return (
    <SectionHeader
      title={title}
      description={description}
      className={cn("border-b border-border pb-3", className)}
    />
  );
}
