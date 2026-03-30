"use client"

import type { UseFormReturn } from "react-hook-form"
import { TrashIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import type { BuildingSurvey } from "@/lib/schemas/building-survey"
import { WARD_OPTIONS } from "@/lib/constants/options"

interface ShopEntryCardProps {
  form: UseFormReturn<BuildingSurvey, any, any>
  index: number
  onRemove: () => void
  canRemove: boolean
}

export function ShopEntryCard({
  form,
  index,
  onRemove,
  canRemove,
}: ShopEntryCardProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  const shopErrors = errors.shops?.[index]
  const prefix = `shops.${index}` as const

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Shop {index + 1}</CardTitle>
          {canRemove && (
            <Button variant="ghost" size="icon" onClick={onRemove}>
              <TrashIcon data-icon="inline-start" className="text-destructive" />
              <span className="sr-only">Remove shop</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field data-invalid={shopErrors?.shopDetails ? true : undefined}>
            <FieldLabel htmlFor={`${prefix}.shopDetails`}>
              Shop Details
            </FieldLabel>
            <Textarea
              id={`${prefix}.shopDetails`}
              placeholder="Describe the shop"
              aria-invalid={!!shopErrors?.shopDetails}
              {...register(`shops.${index}.shopDetails`)}
            />
            {shopErrors?.shopDetails && (
              <FieldDescription>
                {shopErrors.shopDetails.message}
              </FieldDescription>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field
              data-invalid={shopErrors?.shopLicenceNo ? true : undefined}
            >
              <FieldLabel htmlFor={`${prefix}.shopLicenceNo`}>
                Licence No
              </FieldLabel>
              <Input
                id={`${prefix}.shopLicenceNo`}
                placeholder="Licence number"
                aria-invalid={!!shopErrors?.shopLicenceNo}
                {...register(`shops.${index}.shopLicenceNo`)}
              />
              {shopErrors?.shopLicenceNo && (
                <FieldDescription>
                  {shopErrors.shopLicenceNo.message}
                </FieldDescription>
              )}
            </Field>

            <Field
              data-invalid={shopErrors?.roomNumber ? true : undefined}
            >
              <FieldLabel htmlFor={`${prefix}.roomNumber`}>
                Room Number
              </FieldLabel>
              <Input
                id={`${prefix}.roomNumber`}
                placeholder="Room number"
                aria-invalid={!!shopErrors?.roomNumber}
                {...register(`shops.${index}.roomNumber`)}
              />
              {shopErrors?.roomNumber && (
                <FieldDescription>
                  {shopErrors.roomNumber.message}
                </FieldDescription>
              )}
            </Field>
          </div>

          <Field
            data-invalid={shopErrors?.shopLicenseeName ? true : undefined}
          >
            <FieldLabel htmlFor={`${prefix}.shopLicenseeName`}>
              Licensee Name
            </FieldLabel>
            <Input
              id={`${prefix}.shopLicenseeName`}
              placeholder="Licensee name"
              aria-invalid={!!shopErrors?.shopLicenseeName}
              {...register(`shops.${index}.shopLicenseeName`)}
            />
            {shopErrors?.shopLicenseeName && (
              <FieldDescription>
                {shopErrors.shopLicenseeName.message}
              </FieldDescription>
            )}
          </Field>

          <Field
            data-invalid={shopErrors?.licenseeContactNo ? true : undefined}
          >
            <FieldLabel htmlFor={`${prefix}.licenseeContactNo`}>
              Licensee Contact No
            </FieldLabel>
            <Input
              id={`${prefix}.licenseeContactNo`}
              type="tel"
              inputMode="numeric"
              placeholder="10-digit number"
              aria-invalid={!!shopErrors?.licenseeContactNo}
              {...register(`shops.${index}.licenseeContactNo`)}
            />
            {shopErrors?.licenseeContactNo && (
              <FieldDescription>
                {shopErrors.licenseeContactNo.message}
              </FieldDescription>
            )}
          </Field>

          <Field
            data-invalid={shopErrors?.shopManagingPerson ? true : undefined}
          >
            <FieldLabel htmlFor={`${prefix}.shopManagingPerson`}>
              Managing Person
            </FieldLabel>
            <Input
              id={`${prefix}.shopManagingPerson`}
              placeholder="Managing person name"
              aria-invalid={!!shopErrors?.shopManagingPerson}
              {...register(`shops.${index}.shopManagingPerson`)}
            />
            {shopErrors?.shopManagingPerson && (
              <FieldDescription>
                {shopErrors.shopManagingPerson.message}
              </FieldDescription>
            )}
          </Field>

          <Field
            data-invalid={
              shopErrors?.managingPersonContactNo ? true : undefined
            }
          >
            <FieldLabel htmlFor={`${prefix}.managingPersonContactNo`}>
              Managing Person Contact
            </FieldLabel>
            <Input
              id={`${prefix}.managingPersonContactNo`}
              type="tel"
              inputMode="numeric"
              placeholder="10-digit number"
              aria-invalid={!!shopErrors?.managingPersonContactNo}
              {...register(`shops.${index}.managingPersonContactNo`)}
            />
            {shopErrors?.managingPersonContactNo && (
              <FieldDescription>
                {shopErrors.managingPersonContactNo.message}
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor={`${prefix}.connectedRoom`}>
              Connected Room{" "}
              <span className="text-muted-foreground font-normal">
                (Optional)
              </span>
            </FieldLabel>
            <Input
              id={`${prefix}.connectedRoom`}
              placeholder="Under that License No"
              {...register(`shops.${index}.connectedRoom`)}
            />
          </Field>

          <Field data-invalid={shopErrors?.wardNumber ? true : undefined}>
            <FieldLabel htmlFor={`${prefix}.wardNumber`}>
              Ward Number
            </FieldLabel>
            <Select
              value={watch(`shops.${index}.wardNumber`)}
              onValueChange={(val) =>
                setValue(`shops.${index}.wardNumber`, val, { shouldValidate: true })
              }
            >
              <SelectTrigger
                id={`${prefix}.wardNumber`}
                aria-invalid={!!shopErrors?.wardNumber}
              >
                <SelectValue placeholder="Select ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {WARD_OPTIONS.map((ward) => (
                    <SelectItem key={ward.value} value={ward.value}>
                      {ward.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {shopErrors?.wardNumber && (
              <FieldDescription>
                {shopErrors.wardNumber.message}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={shopErrors?.locationName ? true : undefined}>
            <FieldLabel htmlFor={`${prefix}.locationName`}>
              Location Name (Municipality/Panchayath)
            </FieldLabel>
            <Input
              id={`${prefix}.locationName`}
              placeholder="Municipality or Panchayath name"
              aria-invalid={!!shopErrors?.locationName}
              {...register(`shops.${index}.locationName`)}
            />
            {shopErrors?.locationName && (
              <FieldDescription>
                {shopErrors.locationName.message}
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
