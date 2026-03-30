"use client"

import type { UseFormReturn } from "react-hook-form"
import { useFieldArray } from "react-hook-form"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShopEntryCard } from "./shop-entry-card"
import type { BuildingSurvey } from "@/lib/schemas/building-survey"

interface StepShopDetailsProps {
  form: UseFormReturn<BuildingSurvey, any, any>
}

const emptyShop = {
  shopDetails: "",
  shopLicenceNo: "",
  shopLicenseeName: "",
  licenseeContactNo: "",
  shopManagingPerson: "",
  managingPersonContactNo: "",
  connectedRoom: "",
  wardNumber: "",
  roomNumber: "",
  locationName: "",
}

export function StepShopDetails({ form }: StepShopDetailsProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "shops",
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Shop Details</h2>
        <p className="text-sm text-muted-foreground">
          Add details for each shop in this building
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <ShopEntryCard
            key={field.id}
            form={form}
            index={index}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
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
    </div>
  )
}
