"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { PencilIcon, ArrowLeftIcon, StoreIcon, FileTextIcon, MapPinIcon, ImageIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getBuildingById,
  type BuildingWithShops,
} from "@/lib/storage/survey-storage"
import type { RoomDetail, WasteManagement } from "@/lib/supabase/types"

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export default function EntryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [building, setBuilding] = useState<BuildingWithShops | null>(null)
  const [loading, setLoading] = useState(true)

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
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (!building) return null

  const rooms = (building.rooms as RoomDetail[]) || []
  const vacantRooms = rooms.filter((r) => r.status === "vacant").length
  const occupiedRooms = rooms.filter((r) => r.status === "occupied").length

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const { exportSinglePDF } = await import("@/lib/utils/pdf-report")
              await exportSinglePDF(building)
              toast.success("PDF downloaded")
            }}
          >
            <FileTextIcon data-icon="inline-start" />
            PDF
          </Button>
          <Link href={`/survey/${building.id}/edit`}>
            <Button size="sm">
              <PencilIcon data-icon="inline-start" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Building Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{building.building_owner_name}</CardTitle>
            <Badge
              variant={
                building.building_status === "working" ? "secondary" : "outline"
              }
            >
              {building.building_status}
            </Badge>
          </div>
          <CardDescription>
            Old Ward {building.old_ward_no} / New Ward {building.new_ward_no} &middot; Building #{building.building_number}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Place" value={building.place} />
            <DetailRow label="Road Name" value={building.road_name} />
            <DetailRow
              label="Building Number"
              value={building.building_number}
            />
            <DetailRow label="Mobile No 1" value={building.owner_mob_no_1} />
            <DetailRow label="Mobile No 2" value={building.mob_no_2 || ""} />
            <DetailRow label="Manager Name" value={building.manager_name || ""} />
            <DetailRow label="Manager Contact" value={building.manager_contact_no || ""} />
            {building.building_status === "vacant" && (
              <DetailRow
                label="Vacancy Period"
                value={building.vacancy_period || ""}
              />
            )}
          </div>

          {/* Floor Details */}
          {building.number_of_floors > 0 && (
            <div className="mt-4 rounded-lg border p-3">
              <span className="text-xs font-medium text-muted-foreground">Floor Details</span>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-lg font-semibold">{building.number_of_floors}</span>
                  <p className="text-xs text-muted-foreground">Total Floors</p>
                </div>
                <div>
                  <span className="text-lg font-semibold">{building.terrace_floors}</span>
                  <p className="text-xs text-muted-foreground">Terrace</p>
                </div>
                <div>
                  <span className="text-lg font-semibold">{building.sheet_floors}</span>
                  <p className="text-xs text-muted-foreground">Sheet/ഓട്</p>
                </div>
              </div>
            </div>
          )}

          {/* Floor Base */}
          <div className="mt-4 rounded-lg border p-3">
            <span className="text-xs font-medium text-muted-foreground">Floor Base</span>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-lg font-semibold">{building.staircase_count}</span>
                <p className="text-xs text-muted-foreground">Staircase</p>
              </div>
              <div>
                <span className="text-lg font-semibold">{building.lift_count}</span>
                <p className="text-xs text-muted-foreground">Lift</p>
              </div>
              <div>
                <span className="text-lg font-semibold">{building.total_toilets}</span>
                <p className="text-xs text-muted-foreground">Toilets</p>
              </div>
            </div>
            {building.total_toilets > 0 && (
              <div className="mt-2 flex justify-center gap-3">
                <Badge variant="secondary" className="text-xs">Usable: {building.usable_toilets}</Badge>
                <Badge variant="outline" className="text-xs">Unusable: {building.unusable_toilets}</Badge>
              </div>
            )}
          </div>

          {/* Room Summary */}
          {building.total_rooms > 0 && (
            <div className="mt-4 rounded-lg border p-3">
              <span className="text-xs font-medium text-muted-foreground">Room Summary</span>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-lg font-semibold">{building.total_rooms}</span>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div>
                  <span className="text-lg font-semibold text-green-600">{occupiedRooms}</span>
                  <p className="text-xs text-muted-foreground">Occupied</p>
                </div>
                <div>
                  <span className="text-lg font-semibold text-orange-600">{vacantRooms}</span>
                  <p className="text-xs text-muted-foreground">Vacant</p>
                </div>
              </div>
              {rooms.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {rooms.map((room, i) => (
                    <Badge
                      key={i}
                      variant={room.status === "occupied" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      #{room.roomNumber} - {room.status}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {building.latitude && building.longitude && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border p-3">
              <MapPinIcon className="shrink-0 text-muted-foreground" />
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">GPS Location</span>
                <span className="text-sm font-medium">
                  {Number(building.latitude).toFixed(6)}, {Number(building.longitude).toFixed(6)}
                </span>
              </div>
              <a
                href={`https://www.google.com/maps?q=${building.latitude},${building.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  View on Map
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photos */}
      {building.photos && building.photos.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ImageIcon className="text-muted-foreground" />
            Photos ({building.photos.length})
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {building.photos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <img
                  src={url}
                  alt={`Building photo ${i + 1}`}
                  className="aspect-square w-full rounded-lg object-cover transition-opacity hover:opacity-80"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Shop Details */}
      {building.shops.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <StoreIcon className="text-muted-foreground" />
            Shops ({building.shops.length})
          </h2>
          {building.shops.map((shop, index) => {
            const waste = shop.waste_management as WasteManagement | null
            return (
              <Card key={shop.id}>
                <CardHeader>
                  <CardTitle className="text-base">Shop {index + 1}</CardTitle>
                  <CardDescription>{shop.shop_details}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {shop.shop_category && (
                      <DetailRow label="Category" value={shop.shop_category} />
                    )}
                    <DetailRow label="Room Number" value={shop.room_number} />
                    <DetailRow
                      label="License"
                      value={shop.has_license ? "Yes" : "No"}
                    />
                    {shop.has_license ? (
                      <>
                        <DetailRow label="Licence No" value={shop.shop_licence_no || ""} />
                        <DetailRow
                          label="Licensee Name"
                          value={shop.shop_licensee_name || ""}
                        />
                        <DetailRow
                          label="Licensee Contact"
                          value={shop.licensee_contact_no || ""}
                        />
                      </>
                    ) : (
                      <>
                        <DetailRow label="Owner Name" value={shop.owner_name || ""} />
                        <DetailRow label="Owner Contact" value={shop.owner_contact_no || ""} />
                      </>
                    )}
                    <DetailRow
                      label="Managing Person"
                      value={shop.shop_managing_person}
                    />
                    <DetailRow
                      label="Manager Contact"
                      value={shop.managing_person_contact_no}
                    />
                    <DetailRow
                      label="Connected Room"
                      value={shop.connected_room || ""}
                    />
                  </div>
                  {waste && (
                    <div className="mt-3 rounded-lg border p-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Waste Management
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {waste.water && <Badge variant="secondary" className="text-xs">Water</Badge>}
                        {waste.foodWaste && <Badge variant="secondary" className="text-xs">Food Waste</Badge>}
                        {waste.paperWaste && <Badge variant="secondary" className="text-xs">Paper Waste</Badge>}
                        {waste.plasticWaste && <Badge variant="secondary" className="text-xs">Plastic Waste</Badge>}
                        {waste.otherWaste && <Badge variant="outline" className="text-xs">{waste.otherWaste}</Badge>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Timestamps */}
      <div className="text-xs text-muted-foreground">
        <p>Created: {new Date(building.created_at).toLocaleString()}</p>
        <p>Updated: {new Date(building.updated_at).toLocaleString()}</p>
      </div>
    </div>
  )
}
