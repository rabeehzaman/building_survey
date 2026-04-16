"use client"

import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import type { BuildingSurvey } from "@/lib/schemas/building-survey"

interface StepIfteoLicenseProps {
  form: UseFormReturn<BuildingSurvey, any, any>
}

export function StepIfteoLicense({ form }: StepIfteoLicenseProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  const ifteoLicense = watch("ifteoLicense")

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel>IFTEOS License</FieldLabel>
          <FieldDescription>Does this premises hold an IFTEOS license?</FieldDescription>
          <ToggleGroup
            type="single"
            value={ifteoLicense === true ? "yes" : ifteoLicense === false ? "no" : ""}
            onValueChange={(val) => {
              if (val === "yes") setValue("ifteoLicense", true, { shouldValidate: true })
              else if (val === "no") {
                setValue("ifteoLicense", false, { shouldValidate: true })
                setValue("ifteoValidity", "")
                setValue("whichTrade", "")
              }
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="yes">Yes</ToggleGroupItem>
            <ToggleGroupItem value="no">No</ToggleGroupItem>
          </ToggleGroup>
        </Field>
      </FieldGroup>

      {ifteoLicense === true && (
        <FieldGroup>
          <Field>
            <FieldLabel required>Validity</FieldLabel>
            <FieldDescription>License validity period (e.g. 2024-2025)</FieldDescription>
            <Input
              {...register("ifteoValidity")}
              placeholder="Enter validity period"
            />
            {errors.ifteoValidity && (
              <p className="text-sm text-destructive">{errors.ifteoValidity.message}</p>
            )}
          </Field>

          <Field>
            <FieldLabel required>Which Trade</FieldLabel>
            <FieldDescription>Type of trade covered by the license</FieldDescription>
            <Input
              {...register("whichTrade")}
              placeholder="Enter trade type"
            />
            {errors.whichTrade && (
              <p className="text-sm text-destructive">{errors.whichTrade.message}</p>
            )}
          </Field>
        </FieldGroup>
      )}
    </div>
  )
}
