"use client"

import { useEffect } from "react"
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
import type { BuildingSurvey, RoomDetail } from "@/lib/schemas/building-survey"

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
  const totalRooms = watch("totalRooms")
  const rooms = watch("rooms") || []

  const vacantCount = rooms.filter((r) => r.status === "vacant").length
  const occupiedCount = rooms.filter((r) => r.status === "occupied").length

  function handleTotalRoomsChange(count: number) {
    const current = form.getValues("rooms") || []
    let newRooms: RoomDetail[]
    if (count > current.length) {
      newRooms = [
        ...current,
        ...Array.from({ length: count - current.length }, (_, i) => ({
          roomNumber: String(current.length + i + 1),
          status: "occupied" as const,
        })),
      ]
    } else {
      newRooms = current.slice(0, count)
    }
    setValue("rooms", newRooms)
    setValue("totalRooms", count)
  }

  function handleRoomStatusChange(index: number, status: "vacant" | "occupied") {
    const current = form.getValues("rooms") || []
    const updated = [...current]
    updated[index] = { ...updated[index], status }
    setValue("rooms", updated)
  }

  function handleRoomNumberChange(index: number, roomNumber: string) {
    const current = form.getValues("rooms") || []
    const updated = [...current]
    updated[index] = { ...updated[index], roomNumber }
    setValue("rooms", updated)
  }

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

      {/* Room Information */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Room Information</h3>
          <p className="text-sm text-muted-foreground">
            Enter room details for this building
          </p>
        </div>

        <FieldGroup>
          <Field data-invalid={errors.totalRooms ? true : undefined}>
            <FieldLabel htmlFor="totalRooms">Total Rooms</FieldLabel>
            <Input
              id="totalRooms"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="0"
              value={totalRooms}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0
                handleTotalRoomsChange(val)
              }}
            />
            {errors.totalRooms && (
              <FieldDescription>{errors.totalRooms.message}</FieldDescription>
            )}
          </Field>
        </FieldGroup>

        {rooms.length > 0 && (
          <div className="flex flex-col gap-3">
            {/* Summary badges */}
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg border bg-green-50 p-2 text-center dark:bg-green-950">
                <span className="text-lg font-semibold text-green-700 dark:text-green-300">{occupiedCount}</span>
                <p className="text-xs text-green-600 dark:text-green-400">Occupied</p>
              </div>
              <div className="flex-1 rounded-lg border bg-orange-50 p-2 text-center dark:bg-orange-950">
                <span className="text-lg font-semibold text-orange-700 dark:text-orange-300">{vacantCount}</span>
                <p className="text-xs text-orange-600 dark:text-orange-400">Vacant</p>
              </div>
            </div>

            {/* Room list */}
            <div className="flex flex-col gap-2">
              {rooms.map((room, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border p-2"
                >
                  <Input
                    className="w-20 text-center"
                    value={room.roomNumber}
                    onChange={(e) => handleRoomNumberChange(index, e.target.value)}
                    placeholder="No."
                  />
                  <ToggleGroup
                    type="single"
                    value={room.status}
                    onValueChange={(val) => {
                      if (val) handleRoomStatusChange(index, val as "vacant" | "occupied")
                    }}
                    className="flex-1"
                  >
                    <ToggleGroupItem value="occupied" className="flex-1 text-xs">
                      Occupied
                    </ToggleGroupItem>
                    <ToggleGroupItem value="vacant" className="flex-1 text-xs">
                      Vacant
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
