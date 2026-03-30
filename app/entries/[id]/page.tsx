"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { PencilIcon, ArrowLeftIcon, StoreIcon, FileTextIcon, MapPinIcon } from "lucide-react"
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
            Ward {building.ward_no} &middot; Building #{building.building_number}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Location" value={building.location} />
            <DetailRow
              label="Building Number"
              value={building.building_number}
            />
            <DetailRow label="Mobile No 1" value={building.owner_mob_no_1} />
            <DetailRow label="Mobile No 2" value={building.mob_no_2 || ""} />
            {building.building_status === "vacant" && (
              <DetailRow
                label="Vacancy Period"
                value={building.vacancy_period || ""}
              />
            )}
          </div>
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

      {/* Shop Details */}
      {building.shops.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <StoreIcon className="text-muted-foreground" />
            Shops ({building.shops.length})
          </h2>
          {building.shops.map((shop, index) => (
            <Card key={shop.id}>
              <CardHeader>
                <CardTitle className="text-base">Shop {index + 1}</CardTitle>
                <CardDescription>{shop.shop_details}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Licence No" value={shop.shop_licence_no} />
                  <DetailRow label="Room Number" value={shop.room_number} />
                  <DetailRow
                    label="Licensee Name"
                    value={shop.shop_licensee_name}
                  />
                  <DetailRow
                    label="Licensee Contact"
                    value={shop.licensee_contact_no}
                  />
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
                  <DetailRow
                    label="Ward Number"
                    value={String(shop.ward_number)}
                  />
                  <DetailRow
                    label="Location (Municipality)"
                    value={shop.location_name}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
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
