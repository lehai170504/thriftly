import { Badge } from "@/components/ui/badge";
import { getStatusPresentation, type StatusDomain } from "@/lib/status-registry";

function StatusBadge({ domain, status, className }: { domain: StatusDomain; status: string; className?: string }) {
  const presentation = getStatusPresentation(domain, status);
  return <Badge tone={presentation.tone} className={className}>{presentation.label}</Badge>;
}

export { StatusBadge };
