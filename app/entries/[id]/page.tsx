"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  PencilIcon,
  ArrowLeftIcon,
  StoreIcon,
  FileTextIcon,
  MapPinIcon,
  ImageIcon,
  PhoneIcon,
  NavigationIcon,
  UsersIcon,
  LayersIcon,
  DoorOpenIcon,
  RecycleIcon,
  ScrollTextIcon,
  BadgeCheckIcon,
  CircleAlertIcon,
  ArrowRightIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { FormSection } from "@/components/survey/form-section"
import { StatusBadge } from "@/components/survey/status-badge"
import {
  getBuildingById,
  type BuildingWithShops,
} from "@/lib/storage/survey-storage"
import type { FloorDetail, RoomDetail, WasteManagement } from "@/lib/supabase/types"
import { formatDateTime, pluralize } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium break-words">{value}</span>
    </div>
  )
}

function ContactRow({
  role,
  name,
  phone,
}: {
  role: string
  name?: string | null
  phone?: string | null
}) {
  if (!name && !phone) return null
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{role}</span>
        {name && <span className="truncate text-sm font-medium">{name}</span>}
        {phone && (
          <span className="text-sm text-muted-foreground tabular-nums">{phone}</span>
        )}
      </div>
      {phone && (
        <Button asChild variant="outline" size="icon" className="rounded-full">
          <a href={`tel:${phone}`} aria-label={`Call ${name || role}`}>
            <PhoneIcon />
          </a>
        </Button>
      )}
    </div>
  )
}

function Metric({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl bg-muted/60 px-2 py-2.5">
      <span className="text-lg leading-tight font-semibold tabular-nums">{value}</span>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

export default function EntryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [building, setBuilding] = useState<BuildingWithShops | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportingPdf, setExportingPdf] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getBuildingById(id)
        if (!data) {
          toast.error("Entry not found")
          router.push("/entries")
          return
        }
        setBuilding(data)
      } catch {
        toast.error("Failed to load entry")
        router.push("/entries")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    )
  }

  if (!building) return null

  const rooms = (building.rooms as RoomDetail[]) || []
  const floors = (building.floors as FloorDetail[]) || []
  const vacantRooms = rooms.filter((r) => r.status === "vacant").length
  const occupiedRooms = rooms.filter((r) => r.status === "occupied").length
  const hasLocation = building.latitude != null && building.longitude != null
  const mapsUrl = hasLocation
    ? `https://www.google.com/maps?q=${building.latitude},${building.longitude}`
    : null
  const totalToilets = floors.reduce((sum, f) => sum + (f.totalToilets ?? 0), 0)

  async function handlePdf() {
    if (!building) return
    setExportingPdf(true)
    try {
      const { exportSinglePDF } = await import("@/lib/utils/pdf-report")
      await exportSinglePDF(building)
      toast.success("PDF downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
          <ArrowLeftIcon className="size-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePdf} disabled={exportingPdf}>
            {exportingPdf ? <Spinner data-icon="inline-start" /> : <FileTextIcon data-icon="inline-start" />}
            PDF
          </Button>
          <Button asChild>
            <Link href={`/survey/${building.id}/edit`}>
              <PencilIcon data-icon="inline-start" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero */}
      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-xs">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={building.building_status} />
            <span className="text-xs font-medium text-muted-foreground">
              Building #{building.building_number}
            </span>
          </div>
          <h1 className="text-xl leading-tight font-semibold tracking-tight">
            {building.building_owner_name}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon className="size-3.5 shrink-0" />
            <span className="truncate">
              {building.place}, {building.road_name}
            </span>
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs font-medium">
            <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
              Old ward {building.old_ward_no}
            </span>
            <ArrowRightIcon className="size-3.5 text-muted-foreground" />
            <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">
              New ward {building.new_ward_no}
            </span>
          </div>
        </div>

        {building.building_status === "vacant" && building.vacancy_period && (
          <div className="flex items-center gap-2 rounded-xl bg-warning/10 px-3 py-2 text-sm">
            <CircleAlertIcon className="size-4 shrink-0 text-warning" />
            <span>
              Vacant for <strong className="font-semibold">{building.vacancy_period}</strong>
            </span>
          </div>
        )}

        <div className={cn("grid gap-2", mapsUrl ? "grid-cols-2" : "grid-cols-1")}>
          <Button asChild variant="secondary" size="lg">
            <a href={`tel:${building.owner_mob_no_1}`}>
              <PhoneIcon data-icon="inline-start" />
              Call owner
            </a>
          </Button>
          {mapsUrl && (
            <Button asChild variant="secondary" size="lg">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <NavigationIcon data-icon="inline-start" />
                Directions
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Contacts */}
      <FormSection icon={UsersIcon} title="Contacts">
        <div className="flex flex-col divide-y">
          <ContactRow role="Owner" name={building.building_owner_name} phone={building.owner_mob_no_1} />
          <ContactRow role="Owner · alternate number" phone={building.mob_no_2} />
          <ContactRow role="Manager" name={building.manager_name} phone={building.manager_contact_no} />
        </div>
      </FormSection>

      {/* Structure */}
      {(floors.length > 0 || building.total_rooms > 0) && (
        <FormSection
          icon={LayersIcon}
          title="Structure"
          description={`${pluralize(building.number_of_floors, "floor")} · ${pluralize(building.total_rooms, "room")}`}
        >
          {floors.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <Metric value={building.number_of_floors} label="Floors" />
              <Metric value={floors.reduce((s, f) => s + (f.staircaseCount ?? 0), 0)} label="Staircases" />
              <Metric value={totalToilets} label="Toilets" />
            </div>
          )}
          {floors.length > 0 && (
            <div className="flex flex-col divide-y rounded-xl border">
              {floors.map((f) => (
                <div key={f.floorNumber} className="flex flex-col gap-1.5 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Floor {f.floorNumber}</span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {f.roofType === "terrace" ? "Terrace" : "Sheet/ഓട്"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      <strong className="font-semibold text-foreground">{f.staircaseCount ?? 0}</strong> staircase
                    </span>
                    <span>
                      <strong className="font-semibold text-foreground">{f.liftCount ?? 0}</strong> lift
                    </span>
                    <span>
                      <strong className="font-semibold text-foreground">{f.totalToilets ?? 0}</strong> toilets
                      {(f.totalToilets ?? 0) > 0 && (
                        <>
                          {" "}
                          (<span className="text-success">{f.usableToilets ?? 0} usable</span>,{" "}
                          <span className="text-destructive">{f.unusableToilets ?? 0} unusable</span>)
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </FormSection>
      )}

      {/* Rooms */}
      {building.total_rooms > 0 && (
        <FormSection icon={DoorOpenIcon} title="Rooms" description={`${occupiedRooms} occupied · ${vacantRooms} vacant`}>
          {rooms.length > 0 && (
            <>
              <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                <div className="bg-success" style={{ width: `${(occupiedRooms / rooms.length) * 100}%` }} />
                <div className="bg-warning" style={{ width: `${(vacantRooms / rooms.length) * 100}%` }} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {rooms.map((room, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col items-center rounded-lg px-1 py-1.5",
                      room.status === "occupied" ? "bg-success/10 text-success" : "bg-warning/12 text-warning"
                    )}
                  >
                    <span className="text-sm font-semibold">#{room.roomNumber}</span>
                    <span className="text-[10px] font-medium capitalize opacity-80">{room.status}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </FormSection>
      )}

      {/* Location */}
      {hasLocation && mapsUrl && (
        <FormSection
          icon={MapPinIcon}
          title="GPS location"
          description={`${Number(building.latitude).toFixed(6)}, ${Number(building.longitude).toFixed(6)}`}
          action={
            <Button asChild variant="outline" size="sm">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                Open map
              </a>
            </Button>
          }
        >
          {null}
        </FormSection>
      )}

      {/* Photos */}
      {building.photos && building.photos.length > 0 && (
        <FormSection icon={ImageIcon} title="Photos" description={pluralize(building.photos.length, "photo")}>
          <div className="grid grid-cols-2 gap-2">
            {building.photos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-xl">
                <img
                  src={url}
                  alt={`Building photo ${i + 1}`}
                  className="aspect-square w-full object-cover transition-transform hover:scale-105"
                />
              </a>
            ))}
          </div>
        </FormSection>
      )}

      {/* Shops */}
      {building.shops.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 px-1 text-sm font-semibold text-muted-foreground">
            <StoreIcon className="size-4" />
            Shops ({building.shops.length})
          </h2>
          {building.shops.map((shop) => {
            const waste = shop.waste_management as WasteManagement | null
            const wasteEntries = waste
              ? ([
                  ["Water", waste.water],
                  ["Food waste", waste.foodWaste],
                  ["Paper waste", waste.paperWaste],
                  ["Plastic waste", waste.plasticWaste],
                  ["Other", waste.otherWaste],
                ] as const).filter(([, v]) => !!v)
              : []
            const harithaKarmaSena = (shop as { haritha_karma_sena?: boolean }).haritha_karma_sena
            const harithaNumber = (shop as { haritha_karma_sena_number?: string | null }).haritha_karma_sena_number
            return (
              <section key={shop.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <StoreIcon className="size-[18px]" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-[15px] leading-tight font-semibold">{shop.shop_details}</span>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium text-muted-foreground">
                        Room {shop.room_number}
                      </span>
                      {shop.shop_category && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium text-muted-foreground">
                          {shop.shop_category}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      shop.has_license ? "bg-success/12 text-success" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {shop.has_license && <BadgeCheckIcon className="size-3" />}
                    {shop.has_license ? "Licensed" : "No licence"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {shop.has_license ? (
                    <>
                      <DetailRow label="Licence no" value={shop.shop_licence_no} />
                      <DetailRow label="Licensee" value={shop.shop_licensee_name} />
                      <DetailRow label="Licensee contact" value={shop.licensee_contact_no} />
                    </>
                  ) : (
                    <>
                      <DetailRow label="Owner" value={shop.owner_name} />
                      <DetailRow label="Owner contact" value={shop.owner_contact_no} />
                    </>
                  )}
                  <DetailRow label="Managing person" value={shop.shop_managing_person} />
                  <DetailRow label="Manager contact" value={shop.managing_person_contact_no} />
                  <DetailRow label="Connected room" value={shop.connected_room} />
                  {harithaKarmaSena && (
                    <DetailRow label="Haritha Karma Sena" value={harithaNumber || "Yes"} />
                  )}
                </div>

                {wasteEntries.length > 0 && (
                  <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <RecycleIcon className="size-3.5" />
                      Waste management
                    </span>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                      {wasteEntries.map(([label, value]) => (
                        <div key={label} className="contents">
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className="font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}

      {/* IFTEOS License */}
      {building.ifteo_license !== null && building.ifteo_license !== undefined && (
        <FormSection
          icon={ScrollTextIcon}
          title="IFTEOS license"
          action={
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                building.ifteo_license ? "bg-success/12 text-success" : "bg-muted text-muted-foreground"
              )}
            >
              {building.ifteo_license ? "Yes" : "No"}
            </span>
          }
        >
          {building.ifteo_license ? (
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Validity" value={building.ifteo_validity} />
              <DetailRow label="Trade" value={building.which_trade} />
            </div>
          ) : null}
        </FormSection>
      )}

      {/* Timestamps */}
      <div className="flex flex-col gap-0.5 px-1 text-xs text-muted-foreground">
        <span>Created {formatDateTime(building.created_at)}</span>
        {building.updated_at !== building.created_at && (
          <span>Last updated {formatDateTime(building.updated_at)}</span>
        )}
      </div>
    </div>
  )
}
