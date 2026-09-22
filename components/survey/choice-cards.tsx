"use client"

import { CheckIcon, type LucideIcon } from "lucide-react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

type Tone = "primary" | "success" | "warning" | "neutral"

export interface ChoiceOption<T extends string> {
  value: T
  label: string
  description?: string
  icon?: LucideIcon
  tone?: Tone
}

const TONES: Record<Tone, { selected: string; icon: string }> = {
  primary: {
    selected: "border-primary bg-primary/6 ring-1 ring-primary",
    icon: "bg-primary text-primary-foreground",
  },
  success: {
    selected: "border-success bg-success/8 ring-1 ring-success",
    icon: "bg-success text-success-foreground",
  },
  warning: {
    selected: "border-warning bg-warning/8 ring-1 ring-warning",
    icon: "bg-warning text-warning-foreground",
  },
  neutral: {
    selected: "border-foreground/40 bg-muted ring-1 ring-foreground/40",
    icon: "bg-foreground text-background",
  },
}

interface ChoiceCardsProps<T extends string> {
  value: T | "" | undefined
  onChange: (value: T) => void
  options: ChoiceOption<T>[]
  invalid?: boolean
  "aria-label"?: string
  className?: string
}

export function ChoiceCards<T extends string>({
  value,
  onChange,
  options,
  invalid,
  className,
  ...props
}: ChoiceCardsProps<T>) {
  return (
    <RadioGroupPrimitive.Root
      value={value || ""}
      onValueChange={(v) => onChange(v as T)}
      aria-label={props["aria-label"]}
      aria-invalid={invalid || undefined}
      className={cn("grid grid-cols-2 gap-3", className)}
    >
      {options.map((option) => {
        const tone = TONES[option.tone ?? "primary"]
        const Icon = option.icon
        const selected = value === option.value
        return (
          <RadioGroupPrimitive.Item
            key={option.value}
            value={option.value}
            className={cn(
              "group relative flex min-h-24 flex-col items-start gap-2.5 rounded-xl border bg-card p-3 text-left shadow-xs transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.98]",
              selected ? tone.selected : "hover:bg-muted/60",
              invalid && !selected && "border-destructive/60"
            )}
          >
            {Icon && (
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg transition-colors [&_svg]:size-4",
                  selected ? tone.icon : "bg-muted text-muted-foreground"
                )}
              >
                <Icon />
              </span>
            )}
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{option.label}</span>
              {option.description && (
                <span className="text-xs leading-snug text-muted-foreground">
                  {option.description}
                </span>
              )}
            </span>
            <span
              className={cn(
                "absolute top-3 right-3 flex size-5 items-center justify-center rounded-full border transition-all [&_svg]:size-3",
                selected ? cn(tone.icon, "border-transparent") : "bg-card"
              )}
            >
              {selected && <CheckIcon strokeWidth={3} />}
            </span>
          </RadioGroupPrimitive.Item>
        )
      })}
    </RadioGroupPrimitive.Root>
  )
}
