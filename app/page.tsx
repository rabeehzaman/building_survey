"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Building2Icon,
  PlusCircleIcon,
  ListIcon,
  DownloadIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getBuildings, type BuildingWithShops } from "@/lib/storage/survey-storage"

export default function HomePage() {
  const [buildings, setBuildings] = useState<BuildingWithShops[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getBuildings()
        setBuildings(data)
      } catch {
        // Supabase not configured yet — show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const recentEntries = buildings.slice(0, 5)
  const workingCount = buildings.filter(
    (b) => b.building_status === "working"
  ).length
  const vacantCount = buildings.filter(
    (b) => b.building_status === "vacant"
  ).length

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Building Survey</h1>
        <p className="text-muted-foreground">
          Municipal building data collection
        </p>
      </div>

      {/* Quick Action */}
      <Link href="/survey/new">
        <Button size="lg" className="w-full text-base">
          <PlusCircleIcon data-icon="inline-start" />
          New Survey Entry
        </Button>
      </Link>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center gap-1 pt-4 pb-4">
              <span className="text-2xl font-bold">{buildings.length}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-1 pt-4 pb-4">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {workingCount}
              </span>
              <span className="text-xs text-muted-foreground">Working</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-1 pt-4 pb-4">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {vacantCount}
              </span>
              <span className="text-xs text-muted-foreground">Vacant</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/entries">
          <Button variant="outline" className="w-full">
            <ListIcon data-icon="inline-start" />
            All Entries
          </Button>
        </Link>
        <Link href="/entries?export=true">
          <Button variant="outline" className="w-full">
            <DownloadIcon data-icon="inline-start" />
            Export
          </Button>
        </Link>
      </div>

      {/* Recent Entries */}
      {!loading && recentEntries.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Recent Entries</h2>
          {recentEntries.map((building) => (
            <Link key={building.id} href={`/entries/${building.id}`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center justify-between pt-4 pb-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">
                      {building.building_owner_name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Ward {building.new_ward_no} &middot; #{building.building_number}
                    </span>
                  </div>
                  <Badge
                    variant={
                      building.building_status === "working"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {building.building_status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
