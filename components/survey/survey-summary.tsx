"use client"

import type { UseFormReturn } from "react-hook-form"
import { ClipboardCheckIcon, MapPinIcon, ImageIcon } from "lucide-react"
import { FormSection } from "./form-section"
import { StatusBadge } from "./status-badge"
import type { BuildingSurvey } from "@/lib/schemas/building-survey"
import { pluralize } from "@/lib/utils/format"

interface SurveySummaryProps {
  form: UseFormReturn<BuildingSurvey>
  pendingPhotoCount: number
  onEditStep: (step: number) => void
}

function SummaryBlock({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        {children}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="rounded-md px-1.5 py-0.5 text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Edit
      </button>
    </div>
  )
}

export function SurveySummary({ form, pendingPhotoCount, onEditStep }: SurveySummaryProps) {
  const values = form.watch()
  const rooms = values.rooms || []
  const occupied = rooms.filter((r) => r.status === "occupied").length
  const shopCount = (values.shops || []).length
  const photoCount = (values.photos || []).length + pendingPhotoCount
  const hasLocation = values.latitude != null && values.longitude != null

  return (
    <FormSection
      icon={ClipboardCheckIcon}
      title="Review"
      description="Check the details before submitting"
    >
      <div className="flex flex-col divide-y">
        <SummaryBlock title="Building" onEdit={() => onEditStep(0)}>
          <span className="truncate text-sm font-semibold">
            {values.buildingOwnerName || "—"}
          </span>
          <span className="text-sm text-muted-foreground">
            Ward {values.oldWardNo || "?"} → {values.newWardNo || "?"} · #
            {values.buildingNumber || "?"}
            {values.place ? ` · ${values.place}` : ""}
          </span>
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5">
              <MapPinIcon className="size-3" />
              {hasLocation ? "GPS captured" : "No GPS"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5">
              <ImageIcon className="size-3" />
              {pluralize(photoCount, "photo")}
            </span>
            <span className="rounded-md bg-muted px-1.5 py-0.5">
              {pluralize(values.numberOfFloors || 0, "floor")}
            </span>
          </div>
        </SummaryBlock>

        <SummaryBlock title="Status & rooms" onEdit={() => onEditStep(1)}>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={values.buildingStatus} />
            {values.buildingStatus === "vacant" && values.vacancyPeriod && (
              <span className="text-sm text-muted-foreground">for {values.vacancyPeriod}</span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {pluralize(rooms.length, "room")}
            {rooms.length > 0 && ` (${occupied} occupied, ${rooms.length - occupied} vacant)`}
            {` · ${pluralize(shopCount, "shop")} recorded`}
          </span>
        </SummaryBlock>
      </div>
    </FormSection>
  )
}
