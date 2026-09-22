import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormSectionProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function FormSection({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-xs",
        className
      )}
    >
      <header className="flex items-center gap-3">
        {Icon && (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-[18px]" />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="text-[15px] leading-tight font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

export function OptionalTag() {
  return (
    <span className="rounded-full bg-muted px-1.5 py-px text-[11px] font-normal text-muted-foreground">
      Optional
    </span>
  )
}
