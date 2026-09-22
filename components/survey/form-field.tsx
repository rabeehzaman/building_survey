import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { OptionalTag } from "./form-section"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  id?: string
  label: React.ReactNode
  optional?: boolean
  hint?: string
  error?: string
  className?: string
  children: React.ReactNode
}

export function FormField({
  id,
  label,
  optional,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <Field data-invalid={error ? true : undefined} className={cn("gap-1.5", className)}>
      <FieldLabel htmlFor={id}>
        {label}
        {optional && <OptionalTag />}
      </FieldLabel>
      {children}
      {hint && !error && <FieldDescription className="text-xs">{hint}</FieldDescription>}
      <FieldError className="text-xs">{error}</FieldError>
    </Field>
  )
}
