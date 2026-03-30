"use client"

import type { UseFormReturn } from "react-hook-form"
import { MapPinIcon, CheckCircleIcon, AlertCircleIcon, RotateCwIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import type { GpsStatus } from "./survey-form"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import type { BuildingSurvey } from "@/lib/schemas/building-survey"
import { WARD_OPTIONS } from "@/lib/constants/options"

interface StepBuildingInfoProps {
  form: UseFormReturn<BuildingSurvey, any, any>
  gpsStatus: GpsStatus
  onRetryGps: () => void
}

export function StepBuildingInfo({ form, gpsStatus, onRetryGps }: StepBuildingInfoProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  const latitude = watch("latitude")
  const longitude = watch("longitude")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Building Information</h2>
        <p className="text-sm text-muted-foreground">
          Enter the basic building details
        </p>
      </div>

      {/* GPS Status */}
      <div className="flex items-center gap-2 rounded-lg border p-3">
        <MapPinIcon className="shrink-0 text-muted-foreground" />
        {gpsStatus === "capturing" && (
          <div className="flex flex-1 items-center gap-2">
            <Spinner />
            <span className="text-sm text-muted-foreground">Getting location...</span>
          </div>
        )}
        {gpsStatus === "captured" && (
          <div className="flex flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium">Location captured</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
            </span>
          </div>
        )}
        {gpsStatus === "failed" && (
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-1">
              <AlertCircleIcon className="text-orange-500" />
              <span className="text-sm text-muted-foreground">Location unavailable</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onRetryGps}>
              <RotateCwIcon data-icon="inline-start" />
              Retry
            </Button>
          </div>
        )}
        {gpsStatus === "unsupported" && (
          <span className="text-sm text-muted-foreground">GPS not available</span>
        )}
      </div>

      <FieldGroup>
        <Field data-invalid={errors.wardNo ? true : undefined}>
          <FieldLabel htmlFor="wardNo">Ward No</FieldLabel>
          <Select
            value={watch("wardNo")}
            onValueChange={(val) => setValue("wardNo", val, { shouldValidate: true })}
          >
            <SelectTrigger id="wardNo" aria-invalid={!!errors.wardNo}>
              <SelectValue placeholder="Select ward" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {WARD_OPTIONS.map((ward) => (
                  <SelectItem key={ward.value} value={ward.value}>
                    {ward.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.wardNo && (
            <FieldDescription>{errors.wardNo.message}</FieldDescription>
          )}
        </Field>

        <Field data-invalid={errors.location ? true : undefined}>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <Input
            id="location"
            placeholder="Enter location"
            aria-invalid={!!errors.location}
            {...register("location")}
          />
          {errors.location && (
            <FieldDescription>{errors.location.message}</FieldDescription>
          )}
        </Field>

        <Field data-invalid={errors.buildingNumber ? true : undefined}>
          <FieldLabel htmlFor="buildingNumber">Building Number</FieldLabel>
          <Input
            id="buildingNumber"
            placeholder="Enter building number"
            aria-invalid={!!errors.buildingNumber}
            {...register("buildingNumber")}
          />
          {errors.buildingNumber && (
            <FieldDescription>{errors.buildingNumber.message}</FieldDescription>
          )}
        </Field>

        <Field data-invalid={errors.buildingOwnerName ? true : undefined}>
          <FieldLabel htmlFor="buildingOwnerName">
            Building Owner Name
          </FieldLabel>
          <Input
            id="buildingOwnerName"
            placeholder="Enter owner name"
            aria-invalid={!!errors.buildingOwnerName}
            {...register("buildingOwnerName")}
          />
          {errors.buildingOwnerName && (
            <FieldDescription>
              {errors.buildingOwnerName.message}
            </FieldDescription>
          )}
        </Field>

        <Field data-invalid={errors.ownerMobNo1 ? true : undefined}>
          <FieldLabel htmlFor="ownerMobNo1">Owner Mobile No 1</FieldLabel>
          <Input
            id="ownerMobNo1"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            aria-invalid={!!errors.ownerMobNo1}
            {...register("ownerMobNo1")}
          />
          {errors.ownerMobNo1 && (
            <FieldDescription>{errors.ownerMobNo1.message}</FieldDescription>
          )}
        </Field>

        <Field data-invalid={errors.ownerMobNo2 ? true : undefined}>
          <FieldLabel htmlFor="ownerMobNo2">
            Mobile No 2{" "}
            <span className="text-muted-foreground font-normal">(Optional)</span>
          </FieldLabel>
          <Input
            id="ownerMobNo2"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            aria-invalid={!!errors.ownerMobNo2}
            {...register("ownerMobNo2")}
          />
          {errors.ownerMobNo2 && (
            <FieldDescription>{errors.ownerMobNo2.message}</FieldDescription>
          )}
        </Field>
      </FieldGroup>
    </div>
  )
}
