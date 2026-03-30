"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { SurveyForm } from "@/components/survey/survey-form"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getBuildingById,
  buildingToFormData,
} from "@/lib/storage/survey-storage"
import type { BuildingSurvey } from "@/lib/schemas/building-survey"

export default function EditSurveyPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [formData, setFormData] = useState<BuildingSurvey | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const building = await getBuildingById(id)
        if (!building) {
          toast.error("Building not found")
          router.push("/entries")
          return
        }
        setFormData(buildingToFormData(building))
      } catch {
        toast.error("Failed to load building data")
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-2 w-full" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!formData) return null

  return <SurveyForm defaultValues={formData} editId={id} />
}
