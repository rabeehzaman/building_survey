"use client"

import type { UseFormReturn } from "react-hook-form"
import { ScrollTextIcon, BadgeCheckIcon, BanIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FieldGroup } from "@/components/ui/field"
import { FormSection } from "./form-section"
import { FormField } from "./form-field"
import { ChoiceCards } from "./choice-cards"
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
    <FormSection
      icon={ScrollTextIcon}
      title="IFTEOS license"
      description="Does this premises hold an IFTEOS license?"
    >
      <ChoiceCards
        aria-label="IFTEOS license"
        value={ifteoLicense === true ? "yes" : ifteoLicense === false ? "no" : ""}
        onChange={(val) => {
          if (val === "yes") setValue("ifteoLicense", true, { shouldValidate: true })
          else {
            setValue("ifteoLicense", false, { shouldValidate: true })
            setValue("ifteoValidity", "")
            setValue("whichTrade", "")
            form.clearErrors(["ifteoValidity", "whichTrade"])
          }
        }}
        options={[
          { value: "yes", label: "Yes", description: "Holds a license", icon: BadgeCheckIcon, tone: "success" },
          { value: "no", label: "No", description: "No license held", icon: BanIcon, tone: "neutral" },
        ]}
      />

      {ifteoLicense === true && (
        <FieldGroup className="gap-4">
          <FormField
            id="ifteoValidity"
            label="Validity"
            hint="License validity period, e.g. 2024-2025"
            error={errors.ifteoValidity?.message}
          >
            <Input
              id="ifteoValidity"
              placeholder="e.g. 2024-2025"
              aria-invalid={!!errors.ifteoValidity}
              {...register("ifteoValidity")}
            />
          </FormField>

          <FormField
            id="whichTrade"
            label="Trade"
            hint="Type of trade covered by the license"
            error={errors.whichTrade?.message}
          >
            <Input
              id="whichTrade"
              placeholder="e.g. Retail, Restaurant"
              aria-invalid={!!errors.whichTrade}
              {...register("whichTrade")}
            />
          </FormField>
        </FieldGroup>
      )}
    </FormSection>
  )
}
