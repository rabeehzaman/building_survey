"use client"

import { useState, useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, SettingsIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
import { ShopCategoryManager } from "./shop-category-manager"
import { getShopCategories } from "@/lib/storage/survey-storage"
import type { BuildingSurvey, RoomDetail, ShopDetail } from "@/lib/schemas/building-survey"

interface StepBuildingStatusProps {
  form: UseFormReturn<BuildingSurvey, any, any>
}

const emptyShopDetail = (roomNumber: string): ShopDetail => ({
  shopName: "",
  shopCategory: "",
  hasLicense: true,
  shopLicenceNo: "",
  shopLicenseeName: "",
  licenseeContactNo: "",
  ownerName: "",
  ownerContactNo: "",
  shopManagingPerson: "",
  managingPersonContactNo: "",
  connectedRoom: "",
  roomNumber,
  wasteManagement: {
    water: "",
    foodWaste: "",
    paperWaste: "",
    plasticWaste: "",
    otherWaste: "",
  },
  harithaKarmaSena: false,
  harithaKarmaSenaNumber: "",
})

export function StepBuildingStatus({ form }: StepBuildingStatusProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  const buildingStatus = watch("buildingStatus")
  const totalRooms = watch("totalRooms")
  const rooms = watch("rooms") || []
  const shops = watch("shops") || []

  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(new Set())
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [showCategoryManager, setShowCategoryManager] = useState(false)

  const vacantCount = rooms.filter((r) => r.status === "vacant").length
  const occupiedCount = rooms.filter((r) => r.status === "occupied").length

  async function loadCategories() {
    try {
      const cats = await getShopCategories()
      setCategories(cats)
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  function getShopForRoom(roomNumber: string): ShopDetail | undefined {
    return shops.find((s) => s.roomNumber === roomNumber)
  }

  function getShopIndex(roomNumber: string): number {
    return shops.findIndex((s) => s.roomNumber === roomNumber)
  }

  function toggleRoomExpand(roomIndex: number) {
    const room = rooms[roomIndex]
    const next = new Set(expandedRooms)
    if (next.has(roomIndex)) {
      next.delete(roomIndex)
    } else {
      next.add(roomIndex)
      // Create shop entry if doesn't exist
      if (!getShopForRoom(room.roomNumber)) {
        setValue("shops", [...shops, emptyShopDetail(room.roomNumber)])
      }
    }
    setExpandedRooms(next)
  }

  function removeShopForRoom(roomIndex: number) {
    const room = rooms[roomIndex]
    const filtered = shops.filter((s) => s.roomNumber !== room.roomNumber)
    setValue("shops", filtered)
    const next = new Set(expandedRooms)
    next.delete(roomIndex)
    setExpandedRooms(next)
  }

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
      // Remove shops for removed rooms
      const removedRooms = current.slice(count)
      const removedNumbers = new Set(removedRooms.map((r) => r.roomNumber))
      const currentShops = form.getValues("shops") || []
      const filteredShops = currentShops.filter((s) => !removedNumbers.has(s.roomNumber))
      setValue("shops", filteredShops)
      // Collapse removed rooms
      const next = new Set(expandedRooms)
      for (let i = count; i < current.length; i++) next.delete(i)
      setExpandedRooms(next)
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
    const oldNumber = current[index].roomNumber
    // Update room
    const updated = [...current]
    updated[index] = { ...updated[index], roomNumber }
    setValue("rooms", updated)
    // Update linked shop's roomNumber
    const currentShops = form.getValues("shops") || []
    const shopIdx = currentShops.findIndex((s) => s.roomNumber === oldNumber)
    if (shopIdx >= 0) {
      setValue(`shops.${shopIdx}.roomNumber`, roomNumber)
    }
  }

  // Get shop index for rendering inline fields
  function renderShopFields(roomIndex: number) {
    const room = rooms[roomIndex]
    const shopIdx = getShopIndex(room.roomNumber)
    if (shopIdx < 0) return null

    const shopErrors = errors.shops?.[shopIdx]
    const prefix = `shops.${shopIdx}` as const
    const hasLicense = watch(`shops.${shopIdx}.hasLicense`)

    return (
      <div className="mt-2 flex flex-col gap-3 rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Room {room.roomNumber} Details</span>
          <div className="flex gap-1">
            {categories.length > 0 || (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCategoryManager(true)}
              >
                <SettingsIcon className="size-3.5" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => removeShopForRoom(roomIndex)}
            >
              Remove
            </Button>
          </div>
        </div>

        <FieldGroup>
          {/* Shop Name */}
          <Field data-invalid={shopErrors?.shopName ? true : undefined}>
            <FieldLabel htmlFor={`${prefix}.shopName`}>Shop Name</FieldLabel>
            <Input
              id={`${prefix}.shopName`}
              placeholder="Enter shop name"
              aria-invalid={!!shopErrors?.shopName}
              {...register(`shops.${shopIdx}.shopName`)}
            />
            {shopErrors?.shopName && (
              <FieldDescription>{shopErrors.shopName.message}</FieldDescription>
            )}
          </Field>

          {/* Shop Category */}
          {categories.length > 0 && (
            <Field>
              <FieldLabel htmlFor={`${prefix}.shopCategory`}>
                Shop Category{" "}
                <span className="text-muted-foreground font-normal">(Optional)</span>
              </FieldLabel>
              <Select
                value={watch(`shops.${shopIdx}.shopCategory`) || ""}
                onValueChange={(val) =>
                  setValue(`shops.${shopIdx}.shopCategory`, val)
                }
              >
                <SelectTrigger id={`${prefix}.shopCategory`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}

          {/* License Toggle */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor={`${prefix}.hasLicense`}>Has License?</FieldLabel>
              <Switch
                id={`${prefix}.hasLicense`}
                checked={hasLicense}
                onCheckedChange={(checked) =>
                  setValue(`shops.${shopIdx}.hasLicense`, checked)
                }
              />
            </div>
          </Field>

          {/* License Fields */}
          {hasLicense && (
            <>
              <Field data-invalid={shopErrors?.shopLicenceNo ? true : undefined}>
                <FieldLabel htmlFor={`${prefix}.shopLicenceNo`}>Licence No</FieldLabel>
                <Input
                  id={`${prefix}.shopLicenceNo`}
                  placeholder="Licence number"
                  aria-invalid={!!shopErrors?.shopLicenceNo}
                  {...register(`shops.${shopIdx}.shopLicenceNo`)}
                />
                {shopErrors?.shopLicenceNo && (
                  <FieldDescription>{shopErrors.shopLicenceNo.message}</FieldDescription>
                )}
              </Field>
              <Field data-invalid={shopErrors?.shopLicenseeName ? true : undefined}>
                <FieldLabel htmlFor={`${prefix}.shopLicenseeName`}>Licensee Name</FieldLabel>
                <Input
                  id={`${prefix}.shopLicenseeName`}
                  placeholder="Licensee name"
                  aria-invalid={!!shopErrors?.shopLicenseeName}
                  {...register(`shops.${shopIdx}.shopLicenseeName`)}
                />
                {shopErrors?.shopLicenseeName && (
                  <FieldDescription>{shopErrors.shopLicenseeName.message}</FieldDescription>
                )}
              </Field>
              <Field data-invalid={shopErrors?.licenseeContactNo ? true : undefined}>
                <FieldLabel htmlFor={`${prefix}.licenseeContactNo`}>Licensee Contact No</FieldLabel>
                <Input
                  id={`${prefix}.licenseeContactNo`}
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit number"
                  aria-invalid={!!shopErrors?.licenseeContactNo}
                  {...register(`shops.${shopIdx}.licenseeContactNo`)}
                />
                {shopErrors?.licenseeContactNo && (
                  <FieldDescription>{shopErrors.licenseeContactNo.message}</FieldDescription>
                )}
              </Field>
            </>
          )}

          {/* Owner Fields */}
          {!hasLicense && (
            <>
              <Field data-invalid={shopErrors?.ownerName ? true : undefined}>
                <FieldLabel htmlFor={`${prefix}.ownerName`}>Owner Name</FieldLabel>
                <Input
                  id={`${prefix}.ownerName`}
                  placeholder="Owner name"
                  aria-invalid={!!shopErrors?.ownerName}
                  {...register(`shops.${shopIdx}.ownerName`)}
                />
                {shopErrors?.ownerName && (
                  <FieldDescription>{shopErrors.ownerName.message}</FieldDescription>
                )}
              </Field>
              <Field data-invalid={shopErrors?.ownerContactNo ? true : undefined}>
                <FieldLabel htmlFor={`${prefix}.ownerContactNo`}>Owner Contact No</FieldLabel>
                <Input
                  id={`${prefix}.ownerContactNo`}
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit number"
                  aria-invalid={!!shopErrors?.ownerContactNo}
                  {...register(`shops.${shopIdx}.ownerContactNo`)}
                />
                {shopErrors?.ownerContactNo && (
                  <FieldDescription>{shopErrors.ownerContactNo.message}</FieldDescription>
                )}
              </Field>
            </>
          )}

          {/* Managing Person */}
          <Field data-invalid={shopErrors?.shopManagingPerson ? true : undefined}>
            <FieldLabel htmlFor={`${prefix}.shopManagingPerson`}>Managing Person</FieldLabel>
            <Input
              id={`${prefix}.shopManagingPerson`}
              placeholder="Managing person name"
              aria-invalid={!!shopErrors?.shopManagingPerson}
              {...register(`shops.${shopIdx}.shopManagingPerson`)}
            />
            {shopErrors?.shopManagingPerson && (
              <FieldDescription>{shopErrors.shopManagingPerson.message}</FieldDescription>
            )}
          </Field>
          <Field data-invalid={shopErrors?.managingPersonContactNo ? true : undefined}>
            <FieldLabel htmlFor={`${prefix}.managingPersonContactNo`}>Managing Person Contact</FieldLabel>
            <Input
              id={`${prefix}.managingPersonContactNo`}
              type="tel"
              inputMode="numeric"
              placeholder="10-digit number"
              aria-invalid={!!shopErrors?.managingPersonContactNo}
              {...register(`shops.${shopIdx}.managingPersonContactNo`)}
            />
            {shopErrors?.managingPersonContactNo && (
              <FieldDescription>{shopErrors.managingPersonContactNo.message}</FieldDescription>
            )}
          </Field>

          {/* Connected Room */}
          <Field>
            <FieldLabel htmlFor={`${prefix}.connectedRoom`}>
              Connected Room{" "}
              <span className="text-muted-foreground font-normal">(Optional)</span>
            </FieldLabel>
            <Input
              id={`${prefix}.connectedRoom`}
              placeholder="Under that License No"
              {...register(`shops.${shopIdx}.connectedRoom`)}
            />
          </Field>

          {/* Waste Management */}
          <div className="flex flex-col gap-3 rounded-lg border p-3">
            <span className="text-sm font-medium">Waste Management</span>
            <Field>
              <FieldLabel htmlFor={`${prefix}.wm.water`}>Water</FieldLabel>
              <Input
                id={`${prefix}.wm.water`}
                placeholder="How is water waste managed?"
                {...register(`shops.${shopIdx}.wasteManagement.water`)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${prefix}.wm.foodWaste`}>Food Waste</FieldLabel>
              <Input
                id={`${prefix}.wm.foodWaste`}
                placeholder="How is food waste managed?"
                {...register(`shops.${shopIdx}.wasteManagement.foodWaste`)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${prefix}.wm.paperWaste`}>Paper Waste</FieldLabel>
              <Input
                id={`${prefix}.wm.paperWaste`}
                placeholder="How is paper waste managed?"
                {...register(`shops.${shopIdx}.wasteManagement.paperWaste`)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${prefix}.wm.plasticWaste`}>Plastic Waste</FieldLabel>
              <Input
                id={`${prefix}.wm.plasticWaste`}
                placeholder="How is plastic waste managed?"
                {...register(`shops.${shopIdx}.wasteManagement.plasticWaste`)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${prefix}.wm.otherWaste`}>
                Other Waste <span className="text-muted-foreground font-normal">(Optional)</span>
              </FieldLabel>
              <Input
                id={`${prefix}.wm.otherWaste`}
                placeholder="Any other waste management"
                {...register(`shops.${shopIdx}.wasteManagement.otherWaste`)}
              />
            </Field>
          </div>

          {/* Haritha Karma Sena */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor={`${prefix}.harithaKarmaSena`}>Haritha Karma Sena</FieldLabel>
              <Switch
                id={`${prefix}.harithaKarmaSena`}
                checked={watch(`shops.${shopIdx}.harithaKarmaSena`) || false}
                onCheckedChange={(checked) =>
                  setValue(`shops.${shopIdx}.harithaKarmaSena`, checked)
                }
              />
            </div>
          </Field>

          {watch(`shops.${shopIdx}.harithaKarmaSena`) && (
            <Field>
              <FieldLabel htmlFor={`${prefix}.harithaKarmaSenaNumber`}>
                Haritha Karma Sena Number
              </FieldLabel>
              <Input
                id={`${prefix}.harithaKarmaSenaNumber`}
                type="tel"
                inputMode="numeric"
                placeholder="Contact number"
                {...register(`shops.${shopIdx}.harithaKarmaSenaNumber`)}
              />
            </Field>
          )}
        </FieldGroup>
      </div>
    )
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
            <ToggleGroupItem value="working" className="flex-1" aria-invalid={!!errors.buildingStatus}>
              Working
            </ToggleGroupItem>
            <ToggleGroupItem value="vacant" className="flex-1" aria-invalid={!!errors.buildingStatus}>
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
              <FieldDescription>{errors.vacancyPeriod.message}</FieldDescription>
            )}
          </Field>
        )}
      </FieldGroup>

      {/* Room Information */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Room Information</h3>
            <p className="text-sm text-muted-foreground">
              Enter room details and add shop info per room
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCategoryManager(true)}
          >
            <SettingsIcon data-icon="inline-start" />
            Categories
          </Button>
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
              {rooms.map((room, index) => {
                const isExpanded = expandedRooms.has(index)
                const hasDetails = !!getShopForRoom(room.roomNumber)

                return (
                  <div key={index} className="rounded-lg border">
                    <div className="flex items-center gap-3 p-2">
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
                      <Button
                        type="button"
                        variant={hasDetails ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => toggleRoomExpand(index)}
                        className="shrink-0 text-xs"
                      >
                        {isExpanded ? (
                          <ChevronUpIcon className="size-3.5" />
                        ) : (
                          <PlusIcon className="size-3.5" />
                        )}
                        {isExpanded ? "Hide" : hasDetails ? "Edit" : "Add Details"}
                      </Button>
                    </div>
                    {isExpanded && renderShopFields(index)}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <ShopCategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
        onCategoriesChange={loadCategories}
      />
    </div>
  )
}
