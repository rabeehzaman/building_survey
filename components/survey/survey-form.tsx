"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useForm, type FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
} from "@/components/ui/alert-dialog"
import { StepBuildingInfo } from "./step-building-info"
import { StepBuildingStatus } from "./step-building-status"
import { StepIfteoLicense } from "./step-ifteos-license"
import { SurveySummary } from "./survey-summary"
import { useMultiStepForm } from "@/hooks/use-multi-step-form"
import {
  buildingSurveySchema,
  step1Schema,
  step2Schema,
  step3Schema,
  type BuildingSurvey,
} from "@/lib/schemas/building-survey"
import {
  createBuilding,
  updateBuilding,
  uploadPhoto,
  checkDuplicate,
} from "@/lib/storage/survey-storage"
import { cn } from "@/lib/utils"

interface SurveyFormProps {
  defaultValues?: BuildingSurvey
  editId?: string
}

export type GpsStatus = "capturing" | "captured" | "failed" | "unsupported"

type Issue = { path: PropertyKey[]; message: string }

const STEPS = [
  { label: "Building", description: "Location, owner and floors" },
  { label: "Rooms", description: "Status, rooms and shops" },
  { label: "License", description: "IFTEOS license and review" },
]

// Which step each top-level field lives on, used to jump to the first error.
const STEP_FIELDS: (keyof BuildingSurvey)[][] = [
  ["oldWardNo", "newWardNo", "place", "roadName", "buildingNumber", "buildingOwnerName", "ownerMobNo1", "ownerMobNo2", "managerName", "managerContactNo", "numberOfFloors", "floors", "latitude", "longitude", "photos"],
  ["buildingStatus", "vacancyPeriod", "hasShops", "totalRooms", "rooms", "shops"],
  ["ifteoLicense", "ifteoValidity", "whichTrade"],
]

const defaultFormValues: BuildingSurvey = {
  oldWardNo: "",
  newWardNo: "",
  place: "",
  roadName: "",
  buildingNumber: "",
  buildingOwnerName: "",
  ownerMobNo1: "",
  ownerMobNo2: "",
  managerName: "",
  managerContactNo: "",
  numberOfFloors: 0,
  floors: [],
  buildingStatus: "working",
  vacancyPeriod: "",
  hasShops: false,
  totalRooms: 0,
  rooms: [],
  latitude: null,
  longitude: null,
  photos: [],
  shops: [],
  ifteoLicense: undefined,
  ifteoValidity: "",
  whichTrade: "",
}

function StepIndicator({
  current,
  onSelect,
}: {
  current: number
  onSelect: (step: number) => void
}) {
  return (
    <ol className="grid grid-cols-3 gap-2">
      {STEPS.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={step.label}>
            <button
              type="button"
              disabled={!done}
              onClick={() => onSelect(i)}
              aria-current={active ? "step" : undefined}
              className="flex w-full flex-col gap-2 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default"
            >
              <span
                className={cn(
                  "h-1.5 rounded-full transition-colors",
                  done || active ? "bg-primary" : "bg-border"
                )}
              />
              <span className="flex items-center gap-1.5 text-xs font-medium">
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors",
                    done && "bg-primary text-primary-foreground",
                    active && "bg-primary/12 text-primary ring-1 ring-primary",
                    !done && !active && "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <CheckIcon className="size-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn("truncate", active ? "text-foreground" : "text-muted-foreground")}>
                  {step.label}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

export function SurveyForm({ defaultValues, editId }: SurveyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("capturing")
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([])
  const [duplicate, setDuplicate] = useState<{ ownerName: string; buildingNumber: string; ward: string } | null>(null)
  const [confirmExit, setConfirmExit] = useState(false)
  const initialValues = useRef(defaultValues || defaultFormValues)

  const form = useForm<BuildingSurvey>({
    resolver: zodResolver(buildingSurveySchema) as any,
    defaultValues: defaultValues || defaultFormValues,
    mode: "onTouched",
  })

  const captureGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus("unsupported")
      return
    }
    setGpsStatus("capturing")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        form.setValue("latitude", pos.coords.latitude)
        form.setValue("longitude", pos.coords.longitude)
        setGpsStatus("captured")
      },
      () => setGpsStatus("failed"),
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }, [form])

  useEffect(() => {
    if (!editId) captureGps()
    else if (defaultValues?.latitude) setGpsStatus("captured")
    else setGpsStatus("unsupported")
  }, [editId, defaultValues, captureGps])

  const { currentStep, goNext, goPrev, goTo, isFirstStep, isLastStep } =
    useMultiStepForm(STEPS.length)

  // Start each step at the top of the page
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentStep])

  function applyIssues(issues: readonly Issue[], prefix?: string) {
    for (const issue of issues) {
      const name = [prefix, ...issue.path]
        .filter((part) => part !== undefined)
        .map(String)
        .join(".")
      form.setError(name as FieldPath<BuildingSurvey>, { message: issue.message })
    }
  }

  function revealErrors(message = "Please fix the highlighted fields") {
    toast.error(message)
    // Wait for the error state to render, then bring the first problem into view
    setTimeout(() => {
      document
        .querySelector<HTMLElement>('form [aria-invalid="true"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 60)
  }

  async function validateCurrentStep(): Promise<boolean> {
    const values = form.getValues()

    if (currentStep === 0) {
      const result = step1Schema.safeParse(values)
      if (!result.success) {
        applyIssues(result.error.issues)
        return false
      }
      return await form.trigger([
        "oldWardNo",
        "newWardNo",
        "place",
        "roadName",
        "buildingNumber",
        "buildingOwnerName",
        "ownerMobNo1",
        "ownerMobNo2",
        "managerName",
        "managerContactNo",
      ])
    }

    if (currentStep === 1) {
      const result = step2Schema.safeParse(values)
      const shopsResult = buildingSurveySchema.shape.shops.safeParse(values.shops ?? [])
      if (!result.success) applyIssues(result.error.issues)
      if (!shopsResult.success) applyIssues(shopsResult.error.issues, "shops")
      return result.success && shopsResult.success
    }

    if (currentStep === 2) {
      const result = step3Schema.safeParse(values)
      if (!result.success) {
        applyIssues(result.error.issues)
        return false
      }
      return true
    }

    return true
  }

  async function handleNext() {
    const valid = await validateCurrentStep()
    if (valid) goNext()
    else revealErrors()
  }

  async function handleSubmit() {
    const valid = await validateCurrentStep()
    if (!valid) {
      revealErrors()
      return
    }

    const values = form.getValues()

    // Final full validation — jump to the step holding the first problem
    const fullResult = buildingSurveySchema.safeParse(values)
    if (!fullResult.success) {
      applyIssues(fullResult.error.issues)
      const firstField = fullResult.error.issues[0]?.path[0] as keyof BuildingSurvey
      const step = STEP_FIELDS.findIndex((fields) => fields.includes(firstField))
      if (step >= 0 && step !== currentStep) goTo(step)
      revealErrors("Some details need attention before saving")
      return
    }

    // Duplicate detection (warning only)
    try {
      const { isDuplicate, ownerName } = await checkDuplicate(
        Number(values.oldWardNo),
        values.buildingNumber,
        editId
      )
      if (isDuplicate) {
        setDuplicate({
          ownerName: ownerName ?? "unknown",
          buildingNumber: values.buildingNumber,
          ward: values.oldWardNo,
        })
        return
      }
    } catch {
      // Skip check on error, proceed with save
    }

    await save()
  }

  async function save() {
    const values = { ...form.getValues() }

    // Auto-set hasShops based on whether shops exist
    values.hasShops = (values.shops && values.shops.length > 0) || false

    setIsSubmitting(true)
    try {
      // Upload pending photos first
      if (pendingPhotos.length > 0) {
        const uploadedUrls = await Promise.all(
          pendingPhotos.map((file) => uploadPhoto(file))
        )
        const photos = [...(values.photos || []), ...uploadedUrls]
        // Keep them in form state so a retry doesn't upload them twice
        form.setValue("photos", photos)
        setPendingPhotos([])
        values.photos = photos
      }

      if (editId) {
        await updateBuilding(editId, values)
        toast.success("Building updated successfully")
      } else {
        await createBuilding(values)
        toast.success("Building survey saved successfully")
      }
      router.push("/entries")
      router.refresh()
    } catch {
      toast.error("Failed to save. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function hasChanges() {
    // GPS is captured automatically, so it doesn't count as the user's input
    const serialize = (v: BuildingSurvey) =>
      JSON.stringify({ ...v, latitude: null, longitude: null })
    return (
      pendingPhotos.length > 0 ||
      serialize(form.getValues()) !== serialize(initialValues.current)
    )
  }

  function leave() {
    router.push(editId ? `/entries/${editId}` : "/")
  }

  function requestExit() {
    if (hasChanges()) setConfirmExit(true)
    else leave()
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Title & progress */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 rounded-full"
            onClick={requestExit}
            disabled={isSubmitting}
          >
            <XIcon className="size-5" />
            <span className="sr-only">Close form</span>
          </Button>
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="text-lg leading-tight font-semibold tracking-tight">
              {editId ? "Edit survey" : "New survey"}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length} · {STEPS[currentStep].description}
            </p>
          </div>
        </div>
        <StepIndicator current={currentStep} onSelect={goTo} />
      </div>

      {/* Step content */}
      <form onSubmit={(e) => e.preventDefault()} noValidate>
        {currentStep === 0 && (
          <StepBuildingInfo
            form={form}
            gpsStatus={gpsStatus}
            onRetryGps={captureGps}
            pendingPhotos={pendingPhotos}
            setPendingPhotos={setPendingPhotos}
          />
        )}
        {currentStep === 1 && <StepBuildingStatus form={form} />}
        {currentStep === 2 && (
          <div className="flex flex-col gap-4">
            <StepIfteoLicense form={form} />
            <SurveySummary
              form={form}
              pendingPhotoCount={pendingPhotos.length}
              onEditStep={goTo}
            />
          </div>
        )}
      </form>

      {/* Navigation */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex max-w-lg gap-3 px-4 py-3">
          {!isFirstStep && (
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={goPrev}
              disabled={isSubmitting}
            >
              <ChevronLeftIcon data-icon="inline-start" />
              Back
            </Button>
          )}
          {isLastStep ? (
            <Button
              size="lg"
              className="flex-[2]"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckIcon data-icon="inline-start" />
                  {editId ? "Save changes" : "Submit survey"}
                </>
              )}
            </Button>
          ) : (
            <Button size="lg" className="flex-[2]" onClick={handleNext}>
              Continue
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          )}
        </div>
      </div>

      {/* Duplicate warning */}
      <AlertDialog
        open={duplicate !== null}
        onOpenChange={(open) => {
          if (!open) setDuplicate(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Possible duplicate</AlertDialogTitle>
            <AlertDialogDescription>
              Building #{duplicate?.buildingNumber} already exists in Ward{" "}
              {duplicate?.ward} (owner: <strong>{duplicate?.ownerName}</strong>).
              Do you still want to save this entry?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDuplicate(null)
                save()
              }}
            >
              Save anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard confirmation */}
      <AlertDialog open={confirmExit} onOpenChange={setConfirmExit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard {editId ? "changes" : "this survey"}?</AlertDialogTitle>
            <AlertDialogDescription>
              {editId
                ? "Your edits haven't been saved and will be lost."
                : "The details you've entered haven't been saved and will be lost."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={leave}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
