"use client"

import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import type { BuildingSurvey } from "@/lib/schemas/building-survey"

interface StepBuildingStatusProps {
  form: UseFormReturn<BuildingSurvey, any, any>
}

export function StepBuildingStatus({ form }: StepBuildingStatusProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  const buildingStatus = watch("buildingStatus")
  const hasShops = watch("hasShops")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Building Status</h2>
        <p className="text-sm text-muted-foreground">
          Current status of the building
        </p>
      </div>

      <FieldGroup>
        <Field data-invalid={errors.buildingStatus ? true : undefined}>
          <FieldLabel>Building Status</FieldLabel>
          <ToggleGroup
            type="single"
            value={buildingStatus}
            onValueChange={(val) => {
              if (val) setValue("buildingStatus", val as "working" | "vacant", { shouldValidate: true })
            }}
            className="justify-start"
          >
            <ToggleGroupItem
              value="working"
              className="flex-1"
              aria-invalid={!!errors.buildingStatus}
            >
              Working
            </ToggleGroupItem>
            <ToggleGroupItem
              value="vacant"
              className="flex-1"
              aria-invalid={!!errors.buildingStatus}
            >
              Vacant
            </ToggleGroupItem>
          </ToggleGroup>
          {errors.buildingStatus && (
            <FieldDescription>{errors.buildingStatus.message}</FieldDescription>
          )}
        </Field>

        {buildingStatus === "vacant" && (
          <Field data-invalid={errors.vacancyPeriod ? true : undefined}>
            <FieldLabel htmlFor="vacancyPeriod">Vacancy Period</FieldLabel>
            <Input
              id="vacancyPeriod"
              placeholder="e.g., 6 months, 2 years"
              aria-invalid={!!errors.vacancyPeriod}
              {...register("vacancyPeriod")}
            />
            {errors.vacancyPeriod && (
              <FieldDescription>
                {errors.vacancyPeriod.message}
              </FieldDescription>
            )}
          </Field>
        )}

        <Field>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <FieldLabel htmlFor="hasShops" className="text-base">
                Does this building have shops?
              </FieldLabel>
              <FieldDescription>
                Enable to add shop details in the next step
              </FieldDescription>
            </div>
            <Switch
              id="hasShops"
              checked={hasShops}
              onCheckedChange={(checked) => setValue("hasShops", checked)}
            />
          </div>
        </Field>
      </FieldGroup>
    </div>
  )
}
