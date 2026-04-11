"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  SearchIcon,
  TrashIcon,
  PencilIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileIcon,
  Building2Icon,
  FilterIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import {
  getBuildings,
  deleteBuilding,
  type BuildingWithShops,
} from "@/lib/storage/survey-storage"
import { exportToExcel, exportToCSV } from "@/lib/utils/export-utils"

export default function EntriesPage() {
  return (
    <Suspense>
      <EntriesContent />
    </Suspense>
  )
}

function EntriesContent() {
  const searchParams = useSearchParams()
  const [buildings, setBuildings] = useState<BuildingWithShops[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [wardFilter, setWardFilter] = useState<string>("all")
  const [showExport, setShowExport] = useState(
    searchParams.get("export") === "true"
  )

  useEffect(() => {
    loadBuildings()
  }, [])

  async function loadBuildings() {
    try {
      const data = await getBuildings()
      setBuildings(data)
    } catch {
      // Supabase not configured
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteBuilding(id)
      setBuildings((prev) => prev.filter((b) => b.id !== id))
      toast.success("Entry deleted")
    } catch {
      toast.error("Failed to delete entry")
    }
  }

  const wardNumbers = [...new Set(buildings.map((b) => b.new_ward_no))].sort(
    (a, b) => a - b
  )

  const filtered = buildings.filter((b) => {
    if (wardFilter !== "all" && String(b.new_ward_no) !== wardFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      b.building_owner_name.toLowerCase().includes(q) ||
      b.place.toLowerCase().includes(q) ||
      b.road_name.toLowerCase().includes(q) ||
      b.building_number.toLowerCase().includes(q) ||
      String(b.old_ward_no).includes(q) ||
      String(b.new_ward_no).includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">All Entries</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExport(!showExport)}
        >
          <DownloadIcon data-icon="inline-start" />
          Export
        </Button>
      </div>

      {/* Export buttons */}
      {showExport && buildings.length > 0 && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              exportToExcel(buildings)
              toast.success("Excel file downloaded")
            }}
          >
            <FileSpreadsheetIcon data-icon="inline-start" />
            Excel
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              exportToCSV(buildings)
              toast.success("CSV file downloaded")
            }}
          >
            <FileTextIcon data-icon="inline-start" />
            CSV
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={async () => {
              const { exportBulkPDF } = await import("@/lib/utils/pdf-report")
              await exportBulkPDF(buildings)
              toast.success("PDF report downloaded")
            }}
          >
            <FileIcon data-icon="inline-start" />
            PDF
          </Button>
        </div>
      )}

      {/* Search */}
      <InputGroup>
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <InputGroupInput
          placeholder="Search by name, place, ward..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </InputGroup>

      {/* Ward Filter */}
      {wardNumbers.length > 1 && (
        <Select value={wardFilter} onValueChange={setWardFilter}>
          <SelectTrigger>
            <FilterIcon className="mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by ward" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Wards</SelectItem>
              {wardNumbers.map((ward) => (
                <SelectItem key={ward} value={String(ward)}>
                  Ward {ward}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2Icon />
            </EmptyMedia>
            <EmptyTitle>
              {search ? "No matching entries" : "No entries yet"}
            </EmptyTitle>
            <EmptyDescription>
              {search
                ? "Try a different search term"
                : "Start by creating a new building survey"}
            </EmptyDescription>
          </EmptyHeader>
          {!search && (
            <EmptyContent>
              <Link href="/survey/new">
                <Button>Create First Entry</Button>
              </Link>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </p>
          {filtered.map((building) => (
            <Card key={building.id} className="overflow-hidden">
              <CardContent className="flex items-start justify-between gap-3 pt-4 pb-4">
                <Link
                  href={`/entries/${building.id}`}
                  className="flex flex-1 flex-col gap-1"
                >
                  <span className="font-medium">
                    {building.building_owner_name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Ward {building.new_ward_no} &middot; #{building.building_number}{" "}
                    &middot; {building.place}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        building.building_status === "working"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {building.building_status}
                    </Badge>
                    {building.has_shops && (
                      <Badge variant="secondary">
                        {building.shops.length} shop
                        {building.shops.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </Link>

                <div className="flex gap-1">
                  <Link href={`/survey/${building.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <PencilIcon />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <TrashIcon className="text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the building survey for{" "}
                          <strong>{building.building_owner_name}</strong> and all
                          associated shop details.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(building.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
