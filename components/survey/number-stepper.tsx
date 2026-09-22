"use client"

import { MinusIcon, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NumberStepperProps {
  id?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
  invalid?: boolean
  className?: string
}

export function NumberStepper({
  id,
  value,
  onChange,
  min = 0,
  max,
  label,
  invalid,
  className,
}: NumberStepperProps) {
  const clamp = (n: number) =>
    Math.max(min, max != null ? Math.min(max, n) : n)
  const current = Number.isFinite(value) ? value : 0

  const stepButton =
    "flex h-full w-10 shrink-0 items-center justify-center text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:bg-muted active:bg-muted disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4"

  return (
    <div
      data-invalid={invalid || undefined}
      className={cn(
        "flex h-10 w-full items-stretch overflow-hidden rounded-lg border border-input bg-card shadow-xs transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:bg-input/30",
        className
      )}
    >
      <button
        type="button"
        className={cn(stepButton, "border-r")}
        onClick={() => onChange(clamp(current - 1))}
        disabled={current <= min}
        aria-label={label ? `Decrease ${label}` : "Decrease"}
      >
        <MinusIcon />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        aria-label={label}
        aria-invalid={invalid || undefined}
        value={current}
        onFocus={(e) => e.target.select()}
        onChange={(e) => onChange(clamp(parseInt(e.target.value) || 0))}
        className="w-full min-w-0 bg-transparent text-center text-base font-semibold tabular-nums outline-none"
      />
      <button
        type="button"
        className={cn(stepButton, "border-l")}
        onClick={() => onChange(clamp(current + 1))}
        disabled={max != null && current >= max}
        aria-label={label ? `Increase ${label}` : "Increase"}
      >
        <PlusIcon />
      </button>
    </div>
  )
}
