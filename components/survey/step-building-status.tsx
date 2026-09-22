"use client"

import { useState, useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import {
  ActivityIcon,
  ChevronDownIcon,
  DoorClosedIcon,
  DoorOpenIcon,
  PlusIcon,
  RecycleIcon,
  StoreIcon,
  TagsIcon,
  Trash2Icon,
  CircleAlertIcon,
  BadgeCheckIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup } from "@/components/ui/field"
import { ShopCategoryManager } from "./shop-category-manager"
import { FormSection, OptionalTag } from "./form-section"
import { FormField } from "./form-field"
import { ChoiceCards } from "./choice-cards"
import { NumberStepper } from "./number-stepper"
import { Segmented } from "./segmented"
import { getShopCategories } from "@/lib/storage/survey-storage"
import type { BuildingSurvey, RoomDetail, ShopDetail } from "@/lib/schemas/building-survey"
import { cn } from "@/lib/utils"

const MAX_ROOMS = 500

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

function SubHeading({ icon: Icon, children }: { icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 pt-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {Icon && <Icon className="size-3.5" />}
      {children}
    </div>
  )
}

function SwitchRow({
  id,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  id: string
  title: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2.5 transition-colors has-data-checked:border-primary/30 has-data-checked:bg-primary/5"
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </span>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  )
}

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
    form.clearErrors("shops")
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
    const hasLicense = watch(`shops.${shopIdx}.hasLicense`) ?? false
    const harithaKarmaSena = watch(`shops.${shopIdx}.harithaKarmaSena`) || false

    return (
      <div className="flex flex-col gap-4 border-t bg-muted/30 p-3">
        <FieldGroup className="gap-4">
          <SubHeading icon={StoreIcon}>Shop</SubHeading>

          <FormField id={`${prefix}.shopName`} label="Shop name" error={shopErrors?.shopName?.message}>
            <Input
              id={`${prefix}.shopName`}
              placeholder="e.g. Ashraf Stores"
              aria-invalid={!!shopErrors?.shopName}
              {...register(`shops.${shopIdx}.shopName`)}
            />
          </FormField>

          <FormField id={`${prefix}.shopCategory`} label="Category" optional>
            {categories.length > 0 ? (
              <Select
                value={watch(`shops.${shopIdx}.shopCategory`) || ""}
                onValueChange={(val) => setValue(`shops.${shopIdx}.shopCategory`, val)}
              >
                <SelectTrigger id={`${prefix}.shopCategory`} className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <button
                type="button"
                onClick={() => setShowCategoryManager(true)}
                className="flex h-10 items-center gap-2 rounded-lg border border-dashed px-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <TagsIcon className="size-4" />
                No categories yet — add some
              </button>
            )}
          </FormField>

          <SubHeading icon={BadgeCheckIcon}>License</SubHeading>

          <SwitchRow
            id={`${prefix}.hasLicense`}
            title="Has trade license?"
            description={hasLicense ? "Enter licence details below" : "Enter the shop owner's details instead"}
            checked={hasLicense}
            onCheckedChange={(checked) => setValue(`shops.${shopIdx}.hasLicense`, checked)}
          />

          {hasLicense ? (
            <>
              <FormField id={`${prefix}.shopLicenceNo`} label="Licence no" error={shopErrors?.shopLicenceNo?.message}>
                <Input
                  id={`${prefix}.shopLicenceNo`}
                  placeholder="Licence number"
                  aria-invalid={!!shopErrors?.shopLicenceNo}
                  {...register(`shops.${shopIdx}.shopLicenceNo`)}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField id={`${prefix}.shopLicenseeName`} label="Licensee name" error={shopErrors?.shopLicenseeName?.message}>
                  <Input
                    id={`${prefix}.shopLicenseeName`}
                    placeholder="Full name"
                    aria-invalid={!!shopErrors?.shopLicenseeName}
                    {...register(`shops.${shopIdx}.shopLicenseeName`)}
                  />
                </FormField>
                <FormField id={`${prefix}.licenseeContactNo`} label="Contact" error={shopErrors?.licenseeContactNo?.message}>
                  <Input
                    id={`${prefix}.licenseeContactNo`}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10 digits"
                    aria-invalid={!!shopErrors?.licenseeContactNo}
                    {...register(`shops.${shopIdx}.licenseeContactNo`)}
                  />
                </FormField>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <FormField id={`${prefix}.ownerName`} label="Owner name" error={shopErrors?.ownerName?.message}>
                <Input
                  id={`${prefix}.ownerName`}
                  placeholder="Full name"
                  aria-invalid={!!shopErrors?.ownerName}
                  {...register(`shops.${shopIdx}.ownerName`)}
                />
              </FormField>
              <FormField id={`${prefix}.ownerContactNo`} label="Contact" error={shopErrors?.ownerContactNo?.message}>
                <Input
                  id={`${prefix}.ownerContactNo`}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10 digits"
                  aria-invalid={!!shopErrors?.ownerContactNo}
                  {...register(`shops.${shopIdx}.ownerContactNo`)}
                />
              </FormField>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField id={`${prefix}.shopManagingPerson`} label="Managing person" error={shopErrors?.shopManagingPerson?.message}>
              <Input
                id={`${prefix}.shopManagingPerson`}
                placeholder="Full name"
                aria-invalid={!!shopErrors?.shopManagingPerson}
                {...register(`shops.${shopIdx}.shopManagingPerson`)}
              />
            </FormField>
            <FormField id={`${prefix}.managingPersonContactNo`} label="Contact" error={shopErrors?.managingPersonContactNo?.message}>
              <Input
                id={`${prefix}.managingPersonContactNo`}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10 digits"
                aria-invalid={!!shopErrors?.managingPersonContactNo}
                {...register(`shops.${shopIdx}.managingPersonContactNo`)}
              />
            </FormField>
          </div>

          <FormField id={`${prefix}.connectedRoom`} label="Connected room" optional hint="Other rooms under the same licence">
            <Input
              id={`${prefix}.connectedRoom`}
              placeholder="e.g. 3, 4"
              {...register(`shops.${shopIdx}.connectedRoom`)}
            />
          </FormField>

          <SubHeading icon={RecycleIcon}>Waste management</SubHeading>

          <div className="grid grid-cols-2 gap-3">
            <FormField id={`${prefix}.wm.water`} label="Water">
              <Input
                id={`${prefix}.wm.water`}
                placeholder="How managed?"
                {...register(`shops.${shopIdx}.wasteManagement.water`)}
              />
            </FormField>
            <FormField id={`${prefix}.wm.foodWaste`} label="Food waste">
              <Input
                id={`${prefix}.wm.foodWaste`}
                placeholder="How managed?"
                {...register(`shops.${shopIdx}.wasteManagement.foodWaste`)}
              />
            </FormField>
            <FormField id={`${prefix}.wm.paperWaste`} label="Paper waste">
              <Input
                id={`${prefix}.wm.paperWaste`}
                placeholder="How managed?"
                {...register(`shops.${shopIdx}.wasteManagement.paperWaste`)}
              />
            </FormField>
            <FormField id={`${prefix}.wm.plasticWaste`} label="Plastic waste">
              <Input
                id={`${prefix}.wm.plasticWaste`}
                placeholder="How managed?"
                {...register(`shops.${shopIdx}.wasteManagement.plasticWaste`)}
              />
            </FormField>
          </div>
          <FormField id={`${prefix}.wm.otherWaste`} label="Other waste" optional>
            <Input
              id={`${prefix}.wm.otherWaste`}
              placeholder="Any other waste management"
              {...register(`shops.${shopIdx}.wasteManagement.otherWaste`)}
            />
          </FormField>

          <SwitchRow
            id={`${prefix}.harithaKarmaSena`}
            title="Haritha Karma Sena"
            description="Registered for waste collection"
            checked={harithaKarmaSena}
            onCheckedChange={(checked) => setValue(`shops.${shopIdx}.harithaKarmaSena`, checked)}
          />

          {harithaKarmaSena && (
            <FormField id={`${prefix}.harithaKarmaSenaNumber`} label="Haritha Karma Sena number">
              <Input
                id={`${prefix}.harithaKarmaSenaNumber`}
                inputMode="numeric"
                placeholder="Enter number"
                {...register(`shops.${shopIdx}.harithaKarmaSenaNumber`)}
              />
            </FormField>
          )}
        </FieldGroup>

        <Button
          type="button"
          variant="ghost"
          className="self-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => removeShopForRoom(roomIndex)}
        >
          <Trash2Icon data-icon="inline-start" />
          Remove shop details
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Building status */}
      <FormSection icon={ActivityIcon} title="Building status" description="Is the building currently in use?">
        <ChoiceCards
          aria-label="Building status"
          value={buildingStatus}
          invalid={!!errors.buildingStatus}
          onChange={(val) => setValue("buildingStatus", val, { shouldValidate: true })}
          options={[
            { value: "working", label: "Working", description: "In use or operating", icon: DoorOpenIcon, tone: "success" },
            { value: "vacant", label: "Vacant", description: "Not in use right now", icon: DoorClosedIcon, tone: "warning" },
          ]}
        />
        {buildingStatus === "vacant" && (
          <FormField id="vacancyPeriod" label="Vacancy period" error={errors.vacancyPeriod?.message}>
            <Input
              id="vacancyPeriod"
              placeholder="e.g. 6 months, 2 years"
              aria-invalid={!!errors.vacancyPeriod}
              {...register("vacancyPeriod")}
            />
          </FormField>
        )}
      </FormSection>

      {/* Rooms */}
      <FormSection
        icon={DoorOpenIcon}
        title="Rooms"
        description="Set each room's status and add shop details"
        action={
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowCategoryManager(true)} className="text-muted-foreground">
            <TagsIcon data-icon="inline-start" />
            Categories
          </Button>
        }
      >
        <FormField id="totalRooms" label="Total rooms" error={errors.totalRooms?.message}>
          <NumberStepper
            id="totalRooms"
            label="total rooms"
            value={totalRooms}
            max={MAX_ROOMS}
            invalid={!!errors.totalRooms}
            onChange={handleTotalRoomsChange}
          />
        </FormField>

        {rooms.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between rounded-xl bg-success/10 px-3 py-2">
                <span className="text-xs font-medium text-success">Occupied</span>
                <span className="text-lg font-semibold text-success tabular-nums">{occupiedCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-warning/12 px-3 py-2">
                <span className="text-xs font-medium text-warning">Vacant</span>
                <span className="text-lg font-semibold text-warning tabular-nums">{vacantCount}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {rooms.map((room, index) => {
                const shopIdx = getShopIndex(room.roomNumber)
                const shop = shopIdx >= 0 ? shops[shopIdx] : undefined
                const shopHasError = shopIdx >= 0 && !!errors.shops?.[shopIdx]
                const roomNumberError = errors.rooms?.[index]?.roomNumber
                // Vacant rooms can't get new shop details, but keep any existing ones reachable
                const canHaveShop = room.status === "occupied" || !!shop
                const isExpanded = canHaveShop && (expandedRooms.has(index) || shopHasError)

                return (
                  <div
                    key={index}
                    className={cn(
                      "overflow-hidden rounded-xl border bg-card transition-shadow",
                      isExpanded && "shadow-sm",
                      shopHasError && "border-destructive/50"
                    )}
                  >
                    <div className="flex flex-col gap-2.5 p-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex w-20 shrink-0 items-center rounded-lg border border-input bg-card pl-2.5 shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive">
                          <span className="text-xs font-medium text-muted-foreground">#</span>
                          <input
                            className="h-9 w-full min-w-0 bg-transparent px-1.5 text-base font-semibold outline-none"
                            value={room.roomNumber}
                            onChange={(e) => handleRoomNumberChange(index, e.target.value)}
                            placeholder="No."
                            aria-label={`Room ${index + 1} number`}
                            aria-invalid={!!roomNumberError || undefined}
                          />
                        </div>
                        <Segmented
                          aria-label={`Room ${room.roomNumber} status`}
                          value={room.status}
                          onChange={(val) => handleRoomStatusChange(index, val)}
                          options={[
                            {
                              value: "occupied",
                              label: "Occupied",
                              activeClassName: "data-[state=on]:bg-success data-[state=on]:text-success-foreground",
                            },
                            {
                              value: "vacant",
                              label: "Vacant",
                              activeClassName: "data-[state=on]:bg-warning data-[state=on]:text-warning-foreground",
                            },
                          ]}
                        />
                      </div>

                      {roomNumberError && (
                        <p className="text-xs text-destructive">{roomNumberError.message}</p>
                      )}

                      {canHaveShop && (
                        <button
                          type="button"
                          onClick={() => toggleRoomExpand(index)}
                          aria-expanded={isExpanded}
                          className={cn(
                            "flex h-10 items-center gap-2 rounded-lg px-3 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                            shop
                              ? "bg-muted/60 hover:bg-muted"
                              : "border border-dashed text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                          )}
                        >
                          {shop ? (
                            <>
                              {shopHasError ? (
                                <CircleAlertIcon className="size-4 shrink-0 text-destructive" />
                              ) : (
                                <StoreIcon className="size-4 shrink-0 text-primary" />
                              )}
                              <span className={cn("min-w-0 flex-1 truncate text-left font-medium", !shop.shopName && "text-muted-foreground")}>
                                {shopHasError ? "Shop details need attention" : shop.shopName || "Shop details"}
                              </span>
                              {!shopHasError && shop.hasLicense && (
                                <span className="rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-medium text-success">
                                  Licensed
                                </span>
                              )}
                              <ChevronDownIcon className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                            </>
                          ) : (
                            <>
                              <PlusIcon className="size-4" />
                              <span className="font-medium">Add shop details</span>
                              <OptionalTag />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {isExpanded && renderShopFields(index)}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </FormSection>

      <ShopCategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
        onCategoriesChange={loadCategories}
      />
    </div>
  )
}
