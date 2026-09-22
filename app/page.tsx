"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Building2Icon,
  PlusIcon,
  StoreIcon,
  ActivityIcon,
  DoorClosedIcon,
  ChevronRightIcon,
  LayoutListIcon,
  DownloadIcon,
  WifiOffIcon,
  RotateCwIcon,
  ClipboardListIcon,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getBuildings, type BuildingWithShops } from "@/lib/storage/survey-storage"
import { formatRelativeTime, getInitials, isToday, pluralize } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

type Tone = "primary" | "success" | "warning" | "neutral"

const TONE_CHIP: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/14 text-warning",
  neutral: "bg-muted text-muted-foreground",
}

function StatTile({
  href,
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  href: string
  label: string
  value: number
  icon: LucideIcon
  tone: Tone
  hint?: string
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-2xl border bg-card p-3.5 shadow-xs transition-colors outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99]"
    >
      <div className="flex items-center justify-between">
        <span className={cn("flex size-8 items-center justify-center rounded-lg", TONE_CHIP[tone])}>
          <Icon className="size-4" />
        </span>
        {hint && (
          <span className="text-xs font-medium text-muted-foreground tabular-nums">{hint}</span>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-2xl leading-none font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        <span className="mt-1.5 text-xs font-medium text-muted-foreground">{label}</span>
      </div>
    </Link>
  )
}

function ActionRow({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-foreground">
        <Icon className="size-[18px]" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      <ChevronRightIcon className="size-4 text-muted-foreground" />
    </Link>
  )
}

export default function HomePage() {
  const [buildings, setBuildings] = useState<BuildingWithShops[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)

  async function load() {
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

  useEffect(() => {
    load()
  }, [])

  const recentEntries = buildings.slice(0, 5)
  const workingCount = buildings.filter((b) => b.building_status === "working").length
  const vacantCount = buildings.filter((b) => b.building_status === "vacant").length
  const shopCount = buildings.reduce((sum, b) => sum + b.shops.length, 0)
  const todayCount = buildings.filter((b) => isToday(b.created_at)).length
  const share = (n: number) =>
    buildings.length ? `${Math.round((n / buildings.length) * 100)}%` : undefined

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[oklch(0.52_0.19_259)] to-[oklch(0.36_0.14_268)] p-5 text-white shadow-lg shadow-[oklch(0.52_0.19_259)]/25">
        <div aria-hidden className="pointer-events-none absolute -top-14 -right-12 size-44 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute top-20 -right-6 size-24 rounded-full bg-white/[0.07]" />
        <Building2Icon aria-hidden className="pointer-events-none absolute right-5 bottom-20 size-16 text-white/15" strokeWidth={1.25} />
        <div className="relative flex flex-col">
          <span className="text-[11px] font-semibold tracking-[0.14em] text-white/70 uppercase">
            Field survey
          </span>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">Ready to survey?</h1>
          <p className="mt-1 text-sm text-white/75">
            {loading
              ? "Checking today's progress…"
              : todayCount > 0
                ? `${pluralize(todayCount, "building")} recorded today`
                : "No buildings recorded today yet"}
          </p>
          <Button
            asChild
            size="lg"
            className="mt-5 w-full bg-white text-[oklch(0.45_0.19_262)] shadow-md hover:bg-white/90"
          >
            <Link href="/survey/new">
              <PlusIcon data-icon="inline-start" strokeWidth={2.5} />
              Start new survey
            </Link>
          </Button>
        </div>
      </section>

      {/* Load error */}
      {loadFailed && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-4">
          <WifiOffIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-semibold">Couldn&apos;t load entries</span>
            <span className="text-sm text-muted-foreground">
              Check your internet connection and try again.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true)
              load()
            }}
          >
            <RotateCwIcon data-icon="inline-start" />
            Retry
          </Button>
        </div>
      )}

      {/* Stats */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Overview</h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[108px] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatTile href="/entries" label="Buildings surveyed" value={buildings.length} icon={Building2Icon} tone="primary" />
            <StatTile href="/entries" label="Shops recorded" value={shopCount} icon={StoreIcon} tone="neutral" />
            <StatTile href="/entries?status=working" label="Working" value={workingCount} icon={ActivityIcon} tone="success" hint={share(workingCount)} />
            <StatTile href="/entries?status=vacant" label="Vacant" value={vacantCount} icon={DoorClosedIcon} tone="warning" hint={share(vacantCount)} />
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <div className="divide-y">
          <ActionRow href="/entries" icon={LayoutListIcon} title="Browse entries" description="Search, filter and edit surveys" />
          <ActionRow href="/entries?export=true" icon={DownloadIcon} title="Export data" description="Excel, CSV or PDF report" />
        </div>
      </section>

      {/* Recent entries */}
      {!loading && !loadFailed && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">Recent entries</h2>
            {buildings.length > 0 && (
              <Link href="/entries" className="text-sm font-medium text-primary hover:underline">
                View all
              </Link>
            )}
          </div>

          {recentEntries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center">
              <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <ClipboardListIcon className="size-5" />
              </span>
              <span className="mt-1 text-sm font-semibold">No surveys yet</span>
              <span className="text-sm text-muted-foreground">
                Buildings you record will show up here.
              </span>
            </div>
          ) : (
            <div className="divide-y overflow-hidden rounded-2xl border bg-card shadow-xs">
              {recentEntries.map((building) => {
                const working = building.building_status === "working"
                return (
                  <Link
                    key={building.id}
                    href={`/entries/${building.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-semibold",
                        working ? "bg-success/12 text-success" : "bg-warning/14 text-warning"
                      )}
                    >
                      {getInitials(building.building_owner_name)}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">
                        {building.building_owner_name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        Ward {building.new_ward_no} · #{building.building_number} · {building.place}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(building.created_at)}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
