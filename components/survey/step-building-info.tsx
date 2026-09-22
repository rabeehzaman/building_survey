"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import {
  MapPinIcon,
  CheckIcon,
  TriangleAlertIcon,
  RotateCwIcon,
  PencilIcon,
  XIcon,
  CameraIcon,
  LandmarkIcon,
  UserRoundIcon,
  BriefcaseBusinessIcon,
  LayersIcon,
  LocateOffIcon,
} from "lucide-react"
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
import { FieldGroup } from "@/components/ui/field"
import { FormSection, OptionalTag } from "./form-section"
import { FormField } from "./form-field"
import { NumberStepper } from "./number-stepper"
import { Segmented } from "./segmented"
import type { BuildingSurvey, FloorDetail } from "@/lib/schemas/building-survey"
import { WARD_OPTIONS } from "@/lib/constants/options"
import { cn } from "@/lib/utils"

const MAX_PHOTOS = 5
const MAX_FLOORS = 60

interface StepBuildingInfoProps {
  form: UseFormReturn<BuildingSurvey, any, any>
  gpsStatus: GpsStatus
  onRetryGps: () => void
  pendingPhotos: File[]
  setPendingPhotos: (photos: File[]) => void
}

function PhotoThumb({
  src,
  alt,
  onRemove,
}: {
  src: string
  alt: string
  onRemove: () => void
}) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
      <img src={src} alt={alt} className="size-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/75"
        aria-label={`Remove ${alt.toLowerCase()}`}
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  )
}

function PendingPhotoThumb({ file, index, onRemove }: { file: File; index: number; onRemove: () => void }) {
  const url = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => () => URL.revokeObjectURL(url), [url])
  return <PhotoThumb src={url} alt={`New photo ${index + 1}`} onRemove={onRemove} />
}

function WardSelect({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  invalid: boolean
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} aria-invalid={invalid} className="w-full">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-72">
        <SelectGroup>
          {WARD_OPTIONS.map((ward) => (
            <SelectItem key={ward.value} value={ward.value}>
              {ward.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
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
  const floors = watch("floors") || []

  const latitude = watch("latitude")
  const longitude = watch("longitude")
  const [editingLocation, setEditingLocation] = useState(false)
  const [gpsCleared, setGpsCleared] = useState(false)

  const hasCoords = latitude != null && longitude != null
  const showCaptured = gpsStatus === "captured" && hasCoords && !gpsCleared

  const locationState = gpsCleared
    ? "cleared"
    : gpsStatus === "capturing"
      ? "capturing"
      : showCaptured
        ? "captured"
        : gpsStatus === "failed"
          ? "failed"
          : "none"

  function handleFloorCountChange(count: number) {
    const current = form.getValues("floors") || []
    let newFloors: FloorDetail[]
    if (count > current.length) {
      newFloors = [
        ...current,
        ...Array.from({ length: count - current.length }, (_, i) => ({
          floorNumber: current.length + i + 1,
          roofType: "terrace" as const,
          staircaseCount: 0,
          liftCount: 0,
          totalToilets: 0,
          usableToilets: 0,
          unusableToilets: 0,
        })),
      ]
    } else {
      newFloors = current.slice(0, count)
    }
    setValue("numberOfFloors", count)
    setValue("floors", newFloors)
  }

  function updateFloor(index: number, patch: Partial<FloorDetail>) {
    const current = form.getValues("floors") || []
    const updated = [...current]
    updated[index] = { ...updated[index], ...patch }
    setValue("floors", updated)
  }

  const locationIcon = {
    capturing: { className: "bg-primary/10 text-primary", icon: <Spinner /> },
    captured: { className: "bg-success/12 text-success", icon: <CheckIcon strokeWidth={2.5} /> },
    failed: { className: "bg-warning/14 text-warning", icon: <TriangleAlertIcon /> },
    cleared: { className: "bg-muted text-muted-foreground", icon: <LocateOffIcon /> },
    none: { className: "bg-muted text-muted-foreground", icon: <LocateOffIcon /> },
  }[locationState]

  return (
    <div className="flex flex-col gap-4">
      {/* Location & photos */}
      <FormSection icon={MapPinIcon} title="Location & photos" description="GPS is captured automatically">
        <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-3">
          <div className="flex items-center gap-3">
            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full [&_svg]:size-4", locationIcon.className)}>
              {locationIcon.icon}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium">
                {locationState === "capturing" && "Getting location…"}
                {locationState === "captured" && "Location captured"}
                {locationState === "failed" && "Location unavailable"}
                {locationState === "cleared" && "No location set"}
                {locationState === "none" && "No location recorded"}
              </span>
              <span className="truncate text-xs text-muted-foreground tabular-nums">
                {locationState === "capturing" && "This can take a few seconds"}
                {locationState === "captured" && `${latitude?.toFixed(6)}, ${longitude?.toFixed(6)}`}
                {locationState === "failed" && "Allow location access, or enter it manually"}
                {(locationState === "cleared" || locationState === "none") && "Capture now or enter coordinates"}
              </span>
            </div>
            {!editingLocation && locationState === "captured" && (
              <div className="flex">
                <Button variant="ghost" size="icon-sm" onClick={() => setEditingLocation(true)} title="Edit location">
                  <PencilIcon />
                  <span className="sr-only">Edit location</span>
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={onRetryGps} title="Recapture GPS">
                  <RotateCwIcon />
                  <span className="sr-only">Recapture GPS</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Remove location"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setValue("latitude", null)
                    setValue("longitude", null)
                    setGpsCleared(true)
                  }}
                >
                  <XIcon />
                  <span className="sr-only">Remove location</span>
                </Button>
              </div>
            )}
          </div>

          {!editingLocation && (locationState === "failed" || locationState === "cleared" || locationState === "none") && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setGpsCleared(false)
                  onRetryGps()
                }}
              >
                <RotateCwIcon data-icon="inline-start" />
                {locationState === "failed" ? "Retry" : "Capture"}
              </Button>
              <Button variant="outline" onClick={() => setEditingLocation(true)}>
                <PencilIcon data-icon="inline-start" />
                Enter manually
              </Button>
            </div>
          )}

          {/* Manual edit fields */}
          {editingLocation && (
            <div className="flex flex-col gap-3 border-t pt-3">
              <div className="grid grid-cols-2 gap-2">
                <FormField id="latitude" label={<span className="text-xs">Latitude</span>}>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    placeholder="11.2588"
                    value={latitude ?? ""}
                    onChange={(e) => setValue("latitude", e.target.value ? Number(e.target.value) : null)}
                  />
                </FormField>
                <FormField id="longitude" label={<span className="text-xs">Longitude</span>}>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    placeholder="75.7804"
                    value={longitude ?? ""}
                    onChange={(e) => setValue("longitude", e.target.value ? Number(e.target.value) : null)}
                  />
                </FormField>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
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
                  variant="secondary"
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

        {/* Photos */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium">
              Photos <OptionalTag />
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {totalPhotos}/{MAX_PHOTOS}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file && totalPhotos < MAX_PHOTOS) {
                setPendingPhotos([...pendingPhotos, file])
              }
              e.target.value = ""
            }}
          />
          <div className="grid grid-cols-3 gap-2">
            {/* Existing uploaded photos */}
            {existingPhotos.map((url, i) => (
              <PhotoThumb
                key={url}
                src={url}
                alt={`Photo ${i + 1}`}
                onRemove={async () => {
                  await deletePhoto(url)
                  setValue("photos", existingPhotos.filter((_, j) => j !== i))
                }}
              />
            ))}
            {/* Pending photos (not yet uploaded) */}
            {pendingPhotos.map((file, i) => (
              <PendingPhotoThumb
                key={`${file.name}-${file.lastModified}-${i}`}
                file={file}
                index={i}
                onRemove={() => setPendingPhotos(pendingPhotos.filter((_, j) => j !== i))}
              />
            ))}
            {totalPhotos < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-muted-foreground transition-colors outline-none hover:border-primary/50 hover:bg-primary/5 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <CameraIcon className="size-5" />
                <span className="text-xs font-medium">Add photo</span>
              </button>
            )}
          </div>
        </div>
      </FormSection>

      {/* Ward & address */}
      <FormSection icon={LandmarkIcon} title="Ward & address">
        <FieldGroup className="gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField id="oldWardNo" label="Old ward" error={errors.oldWardNo?.message}>
              <WardSelect
                id="oldWardNo"
                value={watch("oldWardNo")}
                onChange={(val) => setValue("oldWardNo", val, { shouldValidate: true })}
                invalid={!!errors.oldWardNo}
              />
            </FormField>
            <FormField id="newWardNo" label="New ward" error={errors.newWardNo?.message}>
              <WardSelect
                id="newWardNo"
                value={watch("newWardNo")}
                onChange={(val) => setValue("newWardNo", val, { shouldValidate: true })}
                invalid={!!errors.newWardNo}
              />
            </FormField>
          </div>

          <FormField id="place" label="Place" error={errors.place?.message}>
            <Input id="place" placeholder="e.g. Palayam" aria-invalid={!!errors.place} {...register("place")} />
          </FormField>

          <FormField id="roadName" label="Road name" error={errors.roadName?.message}>
            <Input id="roadName" placeholder="e.g. Court Road" aria-invalid={!!errors.roadName} {...register("roadName")} />
          </FormField>

          <FormField id="buildingNumber" label="Building number" error={errors.buildingNumber?.message}>
            <Input
              id="buildingNumber"
              placeholder="e.g. 12/345"
              aria-invalid={!!errors.buildingNumber}
              {...register("buildingNumber")}
            />
          </FormField>
        </FieldGroup>
      </FormSection>

      {/* Owner */}
      <FormSection icon={UserRoundIcon} title="Building owner">
        <FieldGroup className="gap-4">
          <FormField id="buildingOwnerName" label="Owner name" error={errors.buildingOwnerName?.message}>
            <Input
              id="buildingOwnerName"
              placeholder="Full name"
              autoCapitalize="words"
              aria-invalid={!!errors.buildingOwnerName}
              {...register("buildingOwnerName")}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="ownerMobNo1" label="Mobile" error={errors.ownerMobNo1?.message}>
              <Input
                id="ownerMobNo1"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10 digits"
                aria-invalid={!!errors.ownerMobNo1}
                {...register("ownerMobNo1")}
              />
            </FormField>
            <FormField id="ownerMobNo2" label="Mobile 2" optional error={errors.ownerMobNo2?.message}>
              <Input
                id="ownerMobNo2"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10 digits"
                aria-invalid={!!errors.ownerMobNo2}
                {...register("ownerMobNo2")}
              />
            </FormField>
          </div>
        </FieldGroup>
      </FormSection>

      {/* Manager */}
      <FormSection icon={BriefcaseBusinessIcon} title="Manager">
        <FieldGroup className="gap-4">
          <FormField id="managerName" label="Manager name" error={errors.managerName?.message}>
            <Input
              id="managerName"
              placeholder="Full name"
              autoCapitalize="words"
              aria-invalid={!!errors.managerName}
              {...register("managerName")}
            />
          </FormField>
          <FormField id="managerContactNo" label="Contact number" error={errors.managerContactNo?.message}>
            <Input
              id="managerContactNo"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile number"
              aria-invalid={!!errors.managerContactNo}
              {...register("managerContactNo")}
            />
          </FormField>
        </FieldGroup>
      </FormSection>

      {/* Floors */}
      <FormSection icon={LayersIcon} title="Floors" description="Roof, stairs, lifts and toilets per floor">
        <FormField id="numberOfFloors" label="Number of floors" error={errors.numberOfFloors?.message}>
          <NumberStepper
            id="numberOfFloors"
            label="number of floors"
            value={watch("numberOfFloors")}
            max={MAX_FLOORS}
            invalid={!!errors.numberOfFloors}
            onChange={handleFloorCountChange}
          />
        </FormField>

        {floors.length > 0 && (
          <div className="flex flex-col gap-3">
            {floors.map((floor, index) => (
              <div key={index} className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {floor.floorNumber}
                  </span>
                  <span className="text-sm font-semibold">Floor {floor.floorNumber}</span>
                </div>

                <Segmented
                  aria-label={`Floor ${floor.floorNumber} roof type`}
                  value={floor.roofType}
                  onChange={(val) => updateFloor(index, { roofType: val })}
                  options={[
                    { value: "terrace", label: "Terrace" },
                    { value: "sheet", label: "Sheet/ഓട്" },
                  ]}
                  className="bg-muted"
                />

                <div className="grid grid-cols-2 gap-3">
                  <FloorCounter
                    label="Staircase"
                    value={floor.staircaseCount ?? 0}
                    onChange={(v) => updateFloor(index, { staircaseCount: v })}
                  />
                  <FloorCounter
                    label="Lift"
                    value={floor.liftCount ?? 0}
                    onChange={(v) => updateFloor(index, { liftCount: v })}
                  />
                </div>

                <FloorCounter
                  label="Total toilets"
                  value={floor.totalToilets ?? 0}
                  onChange={(v) => updateFloor(index, { totalToilets: v })}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FloorCounter
                    label="Usable"
                    value={floor.usableToilets ?? 0}
                    onChange={(v) => updateFloor(index, { usableToilets: v })}
                  />
                  <FloorCounter
                    label="Unusable"
                    value={floor.unusableToilets ?? 0}
                    onChange={(v) => updateFloor(index, { unusableToilets: v })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </FormSection>
    </div>
  )
}

function FloorCounter({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <NumberStepper label={label} value={value} onChange={onChange} />
    </div>
  )
}
