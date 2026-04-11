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
        {/* Ward - Old & New */}
        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={errors.oldWardNo ? true : undefined}>
            <FieldLabel htmlFor="oldWardNo">Old Ward</FieldLabel>
            <Select
              value={watch("oldWardNo")}
              onValueChange={(val) => setValue("oldWardNo", val, { shouldValidate: true })}
            >
              <SelectTrigger id="oldWardNo" aria-invalid={!!errors.oldWardNo}>
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
            {errors.oldWardNo && (
              <FieldDescription>{errors.oldWardNo.message}</FieldDescription>
            )}
          </Field>

          <Field data-invalid={errors.newWardNo ? true : undefined}>
            <FieldLabel htmlFor="newWardNo">New Ward</FieldLabel>
            <Select
              value={watch("newWardNo")}
              onValueChange={(val) => setValue("newWardNo", val, { shouldValidate: true })}
            >
              <SelectTrigger id="newWardNo" aria-invalid={!!errors.newWardNo}>
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
            {errors.newWardNo && (
              <FieldDescription>{errors.newWardNo.message}</FieldDescription>
            )}
          </Field>
        </div>

        {/* Place & Road Name */}
        <Field data-invalid={errors.place ? true : undefined}>
          <FieldLabel htmlFor="place">Place</FieldLabel>
          <Input
            id="place"
            placeholder="Enter place"
            aria-invalid={!!errors.place}
            {...register("place")}
          />
          {errors.place && (
            <FieldDescription>{errors.place.message}</FieldDescription>
          )}
        </Field>

        <Field data-invalid={errors.roadName ? true : undefined}>
          <FieldLabel htmlFor="roadName">Road Name</FieldLabel>
          <Input
            id="roadName"
            placeholder="Enter road name"
            aria-invalid={!!errors.roadName}
            {...register("roadName")}
          />
          {errors.roadName && (
            <FieldDescription>{errors.roadName.message}</FieldDescription>
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

        {/* Manager Fields */}
        <Field data-invalid={errors.managerName ? true : undefined}>
          <FieldLabel htmlFor="managerName">Manager Name</FieldLabel>
          <Input
            id="managerName"
            placeholder="Enter manager name"
            aria-invalid={!!errors.managerName}
            {...register("managerName")}
          />
          {errors.managerName && (
            <FieldDescription>{errors.managerName.message}</FieldDescription>
          )}
        </Field>

        <Field data-invalid={errors.managerContactNo ? true : undefined}>
          <FieldLabel htmlFor="managerContactNo">Manager Contact Number</FieldLabel>
          <Input
            id="managerContactNo"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            aria-invalid={!!errors.managerContactNo}
            {...register("managerContactNo")}
          />
          {errors.managerContactNo && (
            <FieldDescription>{errors.managerContactNo.message}</FieldDescription>
          )}
        </Field>
      </FieldGroup>

      {/* Floor Section */}
      <div className="flex flex-col gap-4 rounded-lg border p-3">
        <span className="text-sm font-medium">Floor Details</span>
        <FieldGroup>
          <Field data-invalid={errors.numberOfFloors ? true : undefined}>
            <FieldLabel htmlFor="numberOfFloors">Number of Floors</FieldLabel>
            <Input
              id="numberOfFloors"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="0"
              aria-invalid={!!errors.numberOfFloors}
              {...register("numberOfFloors", { valueAsNumber: true })}
            />
            {errors.numberOfFloors && (
              <FieldDescription>{errors.numberOfFloors.message}</FieldDescription>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={errors.terraceFloors ? true : undefined}>
              <FieldLabel htmlFor="terraceFloors">Terrace Floors</FieldLabel>
              <Input
                id="terraceFloors"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                aria-invalid={!!errors.terraceFloors}
                {...register("terraceFloors", { valueAsNumber: true })}
              />
              {errors.terraceFloors && (
                <FieldDescription>{errors.terraceFloors.message}</FieldDescription>
              )}
            </Field>

            <Field data-invalid={errors.sheetFloors ? true : undefined}>
              <FieldLabel htmlFor="sheetFloors">Sheet/ഓട് Floors</FieldLabel>
              <Input
                id="sheetFloors"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                aria-invalid={!!errors.sheetFloors}
                {...register("sheetFloors", { valueAsNumber: true })}
              />
              {errors.sheetFloors && (
                <FieldDescription>{errors.sheetFloors.message}</FieldDescription>
              )}
            </Field>
          </div>
        </FieldGroup>
      </div>

      {/* Floor Base Section */}
      <div className="flex flex-col gap-4 rounded-lg border p-3">
        <span className="text-sm font-medium">Floor Base</span>
        <FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={errors.staircaseCount ? true : undefined}>
              <FieldLabel htmlFor="staircaseCount">Staircase</FieldLabel>
              <Input
                id="staircaseCount"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                aria-invalid={!!errors.staircaseCount}
                {...register("staircaseCount", { valueAsNumber: true })}
              />
              {errors.staircaseCount && (
                <FieldDescription>{errors.staircaseCount.message}</FieldDescription>
              )}
            </Field>

            <Field data-invalid={errors.liftCount ? true : undefined}>
              <FieldLabel htmlFor="liftCount">Lift</FieldLabel>
              <Input
                id="liftCount"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                aria-invalid={!!errors.liftCount}
                {...register("liftCount", { valueAsNumber: true })}
              />
              {errors.liftCount && (
                <FieldDescription>{errors.liftCount.message}</FieldDescription>
              )}
            </Field>
          </div>

          <Field data-invalid={errors.totalToilets ? true : undefined}>
            <FieldLabel htmlFor="totalToilets">Total Toilets</FieldLabel>
            <Input
              id="totalToilets"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="0"
              aria-invalid={!!errors.totalToilets}
              {...register("totalToilets", { valueAsNumber: true })}
            />
            {errors.totalToilets && (
              <FieldDescription>{errors.totalToilets.message}</FieldDescription>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={errors.usableToilets ? true : undefined}>
              <FieldLabel htmlFor="usableToilets">Usable</FieldLabel>
              <Input
                id="usableToilets"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                aria-invalid={!!errors.usableToilets}
                {...register("usableToilets", { valueAsNumber: true })}
              />
              {errors.usableToilets && (
                <FieldDescription>{errors.usableToilets.message}</FieldDescription>
              )}
            </Field>

            <Field data-invalid={errors.unusableToilets ? true : undefined}>
              <FieldLabel htmlFor="unusableToilets">Unusable</FieldLabel>
              <Input
                id="unusableToilets"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                aria-invalid={!!errors.unusableToilets}
                {...register("unusableToilets", { valueAsNumber: true })}
              />
              {errors.unusableToilets && (
                <FieldDescription>{errors.unusableToilets.message}</FieldDescription>
              )}
            </Field>
          </div>
        </FieldGroup>
      </div>
    </div>
  )
}
