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
  XIcon,
  StoreIcon,
  MapPinIcon,
  WifiOffIcon,
  RotateCwIcon,
  PlusIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { StatusBadge } from "@/components/survey/status-badge"
import {
  getBuildings,
  deleteBuilding,
  type BuildingWithShops,
} from "@/lib/storage/survey-storage"
import { exportToExcel, exportToCSV } from "@/lib/utils/export-utils"
import { formatRelativeTime, pluralize } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | "working" | "vacant"

export default function EntriesPage() {
  return (
    <Suspense>
      <EntriesContent />
    </Suspense>
  )
}

function EntriesContent() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get("status")
  const [buildings, setBuildings] = useState<BuildingWithShops[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [search, setSearch] = useState("")
  const [wardFilter, setWardFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    initialStatus === "working" || initialStatus === "vacant" ? initialStatus : "all"
  )
  const [showExport, setShowExport] = useState(
    searchParams.get("export") === "true"
  )
  const [exportingPdf, setExportingPdf] = useState(false)

  useEffect(() => {
    loadBuildings()
  }, [])

  async function loadBuildings() {
    try {
      const data = await getBuildings()
      setBuildings(data)
      setLoadFailed(false)
    } catch {
      setLoadFailed(true)
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

  async function handlePdfExport() {
    setExportingPdf(true)
    try {
      const { exportBulkPDF } = await import("@/lib/utils/pdf-report")
      await exportBulkPDF(buildings)
      toast.success("PDF report downloaded")
    } catch {
      toast.error("Failed to generate PDF")
    } finally {
      setExportingPdf(false)
    }
  }

  const wardNumbers = [...new Set(buildings.map((b) => b.new_ward_no))].sort(
    (a, b) => a - b
  )

  const statusCounts = {
    all: buildings.length,
    working: buildings.filter((b) => b.building_status === "working").length,
    vacant: buildings.filter((b) => b.building_status === "vacant").length,
  }

  const filtered = buildings.filter((b) => {
    if (statusFilter !== "all" && b.building_status !== statusFilter) return false
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

  const hasFilters = !!search || wardFilter !== "all" || statusFilter !== "all"

  function clearFilters() {
    setSearch("")
    setWardFilter("all")
    setStatusFilter("all")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-semibold tracking-tight">Entries</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading surveys…" : `${pluralize(buildings.length, "building")} surveyed`}
          </p>
        </div>
        <Button
          variant={showExport ? "secondary" : "outline"}
          onClick={() => setShowExport(!showExport)}
          aria-expanded={showExport}
          disabled={buildings.length === 0}
        >
          <DownloadIcon data-icon="inline-start" />
          Export
        </Button>
      </div>

      {/* Export options */}
      {showExport && buildings.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-xs">
          <p className="px-1 text-xs text-muted-foreground">
            Download all {pluralize(buildings.length, "entry", "entries")}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Excel",
                icon: FileSpreadsheetIcon,
                tone: "text-success bg-success/10",
                onClick: () => {
                  exportToExcel(buildings)
                  toast.success("Excel file downloaded")
                },
              },
              {
                label: "CSV",
                icon: FileTextIcon,
                tone: "text-primary bg-primary/10",
                onClick: () => {
                  exportToCSV(buildings)
                  toast.success("CSV file downloaded")
                },
              },
              {
                label: "PDF",
                icon: FileIcon,
                tone: "text-destructive bg-destructive/10",
                onClick: handlePdfExport,
                busy: exportingPdf,
              },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={option.onClick}
                disabled={option.busy}
                className="flex flex-col items-center gap-2 rounded-xl border bg-background px-2 py-3 text-sm font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
              >
                <span className={cn("flex size-9 items-center justify-center rounded-lg", option.tone)}>
                  {option.busy ? <Spinner /> : <option.icon className="size-[18px]" />}
                </span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & filters */}
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 -mx-4 flex flex-col gap-3 bg-background/90 px-4 pt-1 pb-3 backdrop-blur-lg">
        <InputGroup className="h-11 rounded-xl">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            placeholder="Search name, place, road, ward…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="[&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" onClick={() => setSearch("")} aria-label="Clear search">
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>

        <div className="-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 [scrollbar-width:none]">
            {(["all", "working", "vacant"] as const).map((status) => {
              const active = statusFilter === status
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  aria-pressed={active}
                  className={cn(
                    "flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[13px] font-medium capitalize transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  {status}
                  <span className={cn("tabular-nums", active ? "text-background/70" : "text-muted-foreground/70")}>
                    {statusCounts[status]}
                  </span>
                </button>
              )
            })}
          {wardNumbers.length > 1 && (
            <Select value={wardFilter} onValueChange={setWardFilter}>
              <SelectTrigger
                size="sm"
                aria-label="Filter by ward"
                className={cn(
                  "ml-auto h-8 shrink-0 rounded-full px-2.5 text-[13px] font-medium shadow-none",
                  wardFilter !== "all" && "border-foreground bg-foreground text-background [&_svg]:text-background/70"
                )}
              >
                <MapPinIcon />
                <SelectValue>{wardFilter === "all" ? "Ward" : `Ward ${wardFilter}`}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectGroup>
                  <SelectItem value="all">All wards</SelectItem>
                  {wardNumbers.map((ward) => (
                    <SelectItem key={ward} value={String(ward)}>
                      Ward {ward}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px] rounded-2xl" />
          ))}
        </div>
      ) : loadFailed ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-11 rounded-xl bg-destructive/10 text-destructive">
              <WifiOffIcon className="size-5" />
            </EmptyMedia>
            <EmptyTitle>Couldn&apos;t load entries</EmptyTitle>
            <EmptyDescription>Check your internet connection and try again.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              onClick={() => {
                setLoading(true)
                loadBuildings()
              }}
            >
              <RotateCwIcon data-icon="inline-start" />
              Retry
            </Button>
          </EmptyContent>
        </Empty>
      ) : filtered.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-11 rounded-xl">
              {hasFilters ? <SearchIcon className="size-5" /> : <Building2Icon className="size-5" />}
            </EmptyMedia>
            <EmptyTitle>{hasFilters ? "No matching entries" : "No entries yet"}</EmptyTitle>
            <EmptyDescription>
              {hasFilters
                ? "Try a different search term or clear the filters."
                : "Start by creating a new building survey."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button asChild>
                <Link href="/survey/new">
                  <PlusIcon data-icon="inline-start" />
                  Create first entry
                </Link>
              </Button>
            )}
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {hasFilters && (
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-muted-foreground">
                Showing {filtered.length} of {buildings.length}
              </p>
              <button type="button" onClick={clearFilters} className="text-sm font-medium text-primary hover:underline">
                Clear filters
              </button>
            </div>
          )}
          {filtered.map((building) => (
            <EntryCard key={building.id} building={building} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

function EntryCard({
  building,
  onDelete,
}: {
  building: BuildingWithShops
  onDelete: (id: string) => void
}) {
  const working = building.building_status === "working"

  return (
    <div className="group relative flex gap-3 rounded-2xl border bg-card p-4 shadow-xs transition-colors has-[a:hover]:bg-muted/30">
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          working ? "bg-success/12 text-success" : "bg-warning/14 text-warning"
        )}
      >
        <Building2Icon className="size-5" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={`/entries/${building.id}`}
          className="truncate pr-16 text-[15px] font-semibold outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
        >
          {building.building_owner_name}
        </Link>
        <p className="truncate text-sm text-muted-foreground">
          Ward {building.new_ward_no} · #{building.building_number} · {building.place}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <StatusBadge status={building.building_status} />
          {building.has_shops && building.shops.length > 0 && (
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-muted px-2.5 text-xs font-medium text-muted-foreground">
              <StoreIcon className="size-3" />
              {pluralize(building.shops.length, "shop")}
            </span>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {formatRelativeTime(building.created_at)}
          </span>
        </div>
      </div>

      <div className="absolute top-2.5 right-2.5 z-10 flex">
        <Button asChild variant="ghost" size="icon-sm" className="text-muted-foreground">
          <Link href={`/survey/${building.id}/edit`}>
            <PencilIcon />
            <span className="sr-only">Edit</span>
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive">
              <TrashIcon />
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
                variant="destructive"
                onClick={() => onDelete(building.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
