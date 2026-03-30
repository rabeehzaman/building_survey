"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { StepBuildingInfo } from "./step-building-info"
import { StepBuildingStatus } from "./step-building-status"
import { StepShopDetails } from "./step-shop-details"
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
} from "@/lib/storage/survey-storage"

interface SurveyFormProps {
  defaultValues?: BuildingSurvey
  editId?: string
}

const defaultFormValues: BuildingSurvey = {
  wardNo: "",
  location: "",
  buildingNumber: "",
  buildingOwnerName: "",
  ownerMobNo1: "",
  ownerMobNo2: "",
  buildingStatus: "working",
  vacancyPeriod: "",
  hasShops: false,
  shops: [],
}

export function SurveyForm({ defaultValues, editId }: SurveyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<BuildingSurvey>({
    resolver: zodResolver(buildingSurveySchema),
    defaultValues: defaultValues || defaultFormValues,
    mode: "onTouched",
  })

  const hasShops = form.watch("hasShops")
  const totalSteps = hasShops ? 3 : 2
  const { currentStep, goNext, goPrev, isFirstStep, isLastStep, progress } =
    useMultiStepForm(totalSteps)

  const stepLabels = hasShops
    ? ["Building Info", "Status", "Shop Details"]
    : ["Building Info", "Status"]

  async function validateCurrentStep(): Promise<boolean> {
    const values = form.getValues()

    if (currentStep === 0) {
      const result = step1Schema.safeParse(values)
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof BuildingSurvey
          form.setError(path, { message: issue.message })
        })
        return false
      }
      // Also trigger RHF validation for the fields
      return await form.trigger([
        "wardNo",
        "location",
        "buildingNumber",
        "buildingOwnerName",
        "ownerMobNo1",
        "ownerMobNo2",
      ])
    }

    if (currentStep === 1) {
      const result = step2Schema.safeParse(values)
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof BuildingSurvey
          form.setError(path, { message: issue.message })
        })
        return false
      }
      // If enabling shops and no shops yet, add an empty one
      if (values.hasShops && (!values.shops || values.shops.length === 0)) {
        form.setValue("shops", [
          {
            shopDetails: "",
            shopLicenceNo: "",
            shopLicenseeName: "",
            licenseeContactNo: "",
            shopManagingPerson: "",
            managingPersonContactNo: "",
            connectedRoom: "",
            wardNumber: values.wardNo,
            roomNumber: "",
            locationName: "",
          },
        ])
      }
      return true
    }

    if (currentStep === 2) {
      const result = step3Schema.safeParse({ shops: values.shops })
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const path = issue.path.join(".") as any
          form.setError(path, { message: issue.message })
        })
        return false
      }
      return await form.trigger("shops")
    }

    return true
  }

  async function handleNext() {
    const valid = await validateCurrentStep()
    if (valid) goNext()
  }

  async function handleSubmit() {
    const valid = await validateCurrentStep()
    if (!valid) return

    const values = form.getValues()

    // Final full validation
    const fullResult = buildingSurveySchema.safeParse(values)
    if (!fullResult.success) {
      toast.error("Please check all fields and try again")
      return
    }

    setIsSubmitting(true)
    try {
      if (editId) {
        await updateBuilding(editId, values)
        toast.success("Building updated successfully")
      } else {
        await createBuilding(values)
        toast.success("Building survey saved successfully")
      }
      router.push("/entries")
      router.refresh()
    } catch (error) {
      toast.error("Failed to save. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span>{stepLabels[currentStep]}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step content */}
      <form onSubmit={(e) => e.preventDefault()}>
        {currentStep === 0 && <StepBuildingInfo form={form} />}
        {currentStep === 1 && <StepBuildingStatus form={form} />}
        {currentStep === 2 && hasShops && <StepShopDetails form={form} />}
      </form>

      {/* Navigation */}
      <div className="sticky bottom-16 flex gap-3 border-t bg-background/95 pt-4 pb-2 backdrop-blur">
        {!isFirstStep && (
          <Button
            variant="outline"
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
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner data-icon="inline-start" />
                Saving...
              </>
            ) : (
              <>
                <CheckIcon data-icon="inline-start" />
                {editId ? "Update" : "Submit"}
              </>
            )}
          </Button>
        ) : (
          <Button className="flex-1" onClick={handleNext}>
            Next
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        )}
      </div>
    </div>
  )
}
