"use client"

import { useState, useCallback } from "react"

export function useMultiStepForm(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0)

  const goNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))
  }, [totalSteps])

  const goPrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const goTo = useCallback(
    (step: number) => {
      setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)))
    },
    [totalSteps]
  )

  return {
    currentStep,
    totalSteps,
    goNext,
    goPrev,
    goTo,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
    progress: ((currentStep + 1) / totalSteps) * 100,
  }
}
