import { cn } from "@/lib/cn";

const STYLES: Record<string, string> = {
  REQUESTED: "bg-gold/15 text-gold",
  ACCEPTED: "bg-success/15 text-success",
  IN_PROGRESS: "bg-blue-500/15 text-blue-300",
  COMPLETED: "bg-success/15 text-success",
  REVIEWED: "bg-petrol-lighter text-sand-dim",
  DECLINED: "bg-danger/15 text-danger",
  AUTO_DECLINED: "bg-danger/15 text-danger",
  CANCELLED_BY_OWNER: "bg-danger/15 text-danger",
  CANCELLED_BY_CAREGIVER: "bg-danger/15 text-danger",
};

const LABELS: Record<string, string> = {
  REQUESTED: "Requested",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  REVIEWED: "Reviewed",
  DECLINED: "Declined",
  AUTO_DECLINED: "Auto-declined",
  CANCELLED_BY_OWNER: "Cancelled",
  CANCELLED_BY_CAREGIVER: "Cancelled",
};

export function BookingStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium",
        STYLES[status] ?? "bg-petrol-lighter text-sand-dim"
      )}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
