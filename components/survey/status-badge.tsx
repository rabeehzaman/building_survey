import { cn } from "@/lib/utils"

type Status = "working" | "vacant" | "occupied"

const STATUS_STYLES: Record<Status, { label: string; className: string }> = {
  working: { label: "Working", className: "bg-success/12 text-success" },
  occupied: { label: "Occupied", className: "bg-success/12 text-success" },
  vacant: { label: "Vacant", className: "bg-warning/14 text-warning" },
}

export function StatusBadge({
  status,
  className,
}: {
  status: Status
  className?: string
}) {
  const { label, className: tone } = STATUS_STYLES[status]
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium",
        tone,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}
