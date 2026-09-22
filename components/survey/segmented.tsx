"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

interface SegmentedOption<T extends string> {
  value: T
  label: React.ReactNode
  /** Extra classes applied to the item, typically `data-[state=on]:` colours. */
  activeClassName?: string
}

interface SegmentedProps<T extends string> {
  value: T | undefined
  onChange: (value: T) => void
  options: SegmentedOption<T>[]
  className?: string
  "aria-label"?: string
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  ...props
}: SegmentedProps<T>) {
  return (
    <ToggleGroup
      type="single"
      spacing={1}
      value={value ?? ""}
      onValueChange={(v) => {
        if (v) onChange(v as T)
      }}
      aria-label={props["aria-label"]}
      className={cn("w-full rounded-lg bg-muted p-1", className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className={cn(
            "h-8 flex-1 rounded-md px-2 text-[13px] text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm",
            option.activeClassName
          )}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
