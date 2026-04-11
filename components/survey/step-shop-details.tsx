"use client"

import { useState, useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import { useFieldArray } from "react-hook-form"
import { PlusIcon, SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShopEntryCard } from "./shop-entry-card"
import { ShopCategoryManager } from "./shop-category-manager"
import { getShopCategories } from "@/lib/storage/survey-storage"
import type { BuildingSurvey } from "@/lib/schemas/building-survey"

interface StepShopDetailsProps {
  form: UseFormReturn<BuildingSurvey, any, any>
}

const emptyShop = {
  shopName: "",
  shopCategory: "",
  hasLicense: true,
  shopLicenceNo: "",
  shopLicenseeName: "",
  licenseeContactNo: "",
  ownerName: "",
  ownerContactNo: "",
  shopManagingPerson: "",
  managingPersonContactNo: "",
  connectedRoom: "",
  roomNumber: "",
  wasteManagement: {
    water: false,
    foodWaste: false,
    paperWaste: false,
    plasticWaste: false,
    otherWaste: "",
  },
}

export function StepShopDetails({ form }: StepShopDetailsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "shops",
  })

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [showCategoryManager, setShowCategoryManager] = useState(false)

  async function loadCategories() {
    try {
      const cats = await getShopCategories()
      setCategories(cats)
    } catch {
      // silently fail - categories are optional
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Shop Details</h2>
          <p className="text-sm text-muted-foreground">
            Add details for each shop in this building
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowCategoryManager(true)}
        >
          <SettingsIcon data-icon="inline-start" />
          Categories
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <ShopEntryCard
            key={field.id}
            form={form}
            index={index}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
            categories={categories}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => append(emptyShop)}
      >
        <PlusIcon data-icon="inline-start" />
        Add Another Shop
      </Button>

      <ShopCategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
        onCategoriesChange={loadCategories}
      />
    </div>
  )
}
