"use client"

import { useRef, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { MapPinIcon, CheckCircleIcon, AlertCircleIcon, RotateCwIcon, PencilIcon, XIcon, CameraIcon, ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { deletePhoto } from "@/lib/storage/survey-storage"
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
  pendingPhotos: File[]
  setPendingPhotos: (photos: File[]) => void
}

export function StepBuildingInfo({ form, gpsStatus, onRetryGps, pendingPhotos, setPendingPhotos }: StepBuildingInfoProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  const fileInputRef = useRef<HTMLInputElement>(null)
  const existingPhotos = watch("photos") || []
  const totalPhotos = existingPhotos.length + pendingPhotos.length

  const latitude = watch("latitude")
  const longitude = watch("longitude")
  const [editingLocation, setEditingLocation] = useState(false)
  const [gpsCleared, setGpsCleared] = useState(false)

  const hasCoords = latitude != null && longitude != null
  const showCaptured = gpsStatus === "captured" && hasCoords && !gpsCleared

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Building Information</h2>
        <p className="text-sm text-muted-foreground">
          Enter the basic building details
        </p>
      </div>

      {/* GPS Status */}
      <div className="flex flex-col gap-2 rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <MapPinIcon className="shrink-0 text-muted-foreground" />
          {gpsStatus === "capturing" && (
            <div className="flex flex-1 items-center gap-2">
              <Spinner />
              <span className="text-sm text-muted-foreground">Getting location...</span>
            </div>
          )}
          {showCaptured && !editingLocation && (
            <>
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <CheckCircleIcon className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium">Location captured</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                </span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setEditingLocation(true)} title="Edit location">
                  <PencilIcon />
                </Button>
                <Button variant="ghost" size="icon" onClick={onRetryGps} title="Recapture GPS">
                  <RotateCwIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Remove location"
                  onClick={() => {
                    setValue("latitude", null)
                    setValue("longitude", null)
                    setGpsCleared(true)
                  }}
                >
                  <XIcon className="text-destructive" />
                </Button>
              </div>
            </>
          )}
          {gpsStatus === "failed" && !editingLocation && (
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-1">
                <AlertCircleIcon className="text-orange-500" />
                <span className="text-sm text-muted-foreground">Location unavailable</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditingLocation(true)}>
                  <PencilIcon data-icon="inline-start" />
                  Enter
                </Button>
                <Button variant="ghost" size="sm" onClick={onRetryGps}>
                  <RotateCwIcon data-icon="inline-start" />
                  Retry
                </Button>
              </div>
            </div>
          )}
          {gpsStatus === "unsupported" && !editingLocation && (
            <div className="flex flex-1 items-center justify-between">
              <span className="text-sm text-muted-foreground">GPS not available</span>
              <Button variant="ghost" size="sm" onClick={() => setEditingLocation(true)}>
                <PencilIcon data-icon="inline-start" />
                Enter manually
              </Button>
            </div>
          )}
          {gpsCleared && !editingLocation && (
            <div className="flex flex-1 items-center justify-between">
              <span className="text-sm text-muted-foreground">No location set</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => { setGpsCleared(false); onRetryGps() }}>
                  <RotateCwIcon data-icon="inline-start" />
                  Capture
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingLocation(true)}>
                  <PencilIcon data-icon="inline-start" />
                  Enter
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Manual edit fields */}
        {editingLocation && (
          <div className="flex flex-col gap-2 border-t pt-2">
            <span className="text-xs font-medium text-muted-foreground">Edit coordinates</span>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="any"
                placeholder="Latitude"
                value={latitude ?? ""}
                onChange={(e) => setValue("latitude", e.target.value ? Number(e.target.value) : null)}
              />
              <Input
                type="number"
                step="any"
                placeholder="Longitude"
                value={longitude ?? ""}
                onChange={(e) => setValue("longitude", e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setValue("latitude", null)
                  setValue("longitude", null)
                  setEditingLocation(false)
                  setGpsCleared(true)
                }}
              >
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingLocation(false)
                  if (latitude != null && longitude != null) setGpsCleared(false)
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Photos (Optional) */}
      <div className="flex flex-col gap-3 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="text-muted-foreground" />
            <span className="text-sm font-medium">Photos</span>
            <span className="text-xs text-muted-foreground">(Optional, max 5)</span>
          </div>
          {totalPhotos < 5 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <CameraIcon data-icon="inline-start" />
              Add
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file && totalPhotos < 5) {
              setPendingPhotos([...pendingPhotos, file])
            }
            e.target.value = ""
          }}
        />

        {totalPhotos > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {/* Existing uploaded photos */}
            {existingPhotos.map((url, i) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-md">
                <img src={url} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1"
                  onClick={async () => {
                    await deletePhoto(url)
                    setValue("photos", existingPhotos.filter((_, j) => j !== i))
                  }}
                >
                  <XIcon className="size-3 text-white" />
                </button>
              </div>
            ))}
            {/* Pending photos (not yet uploaded) */}
            {pendingPhotos.map((file, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-md">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`New photo ${i + 1}`}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1"
                  onClick={() => setPendingPhotos(pendingPhotos.filter((_, j) => j !== i))}
                >
                  <XIcon className="size-3 text-white" />
                </button>
              </div>
            ))}
          </div>
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
