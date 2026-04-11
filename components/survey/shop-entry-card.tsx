"use client"

import type { UseFormReturn } from "react-hook-form"
import { TrashIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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

interface ShopEntryCardProps {
  form: UseFormReturn<BuildingSurvey, any, any>
  index: number
  onRemove: () => void
  canRemove: boolean
  categories: { id: string; name: string }[]
}

export function ShopEntryCard({
  form,
  index,
  onRemove,
  canRemove,
  categories,
}: ShopEntryCardProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  const shopErrors = errors.shops?.[index]
  const prefix = `shops.${index}` as const
  const hasLicense = watch(`shops.${index}.hasLicense`)

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
          {/* Shop Name */}
          <Field data-invalid={shopErrors?.shopName ? true : undefined}>
            <FieldLabel htmlFor={`${prefix}.shopName`}>
              Shop Name
            </FieldLabel>
            <Input
              id={`${prefix}.shopName`}
              placeholder="Enter shop name"
              aria-invalid={!!shopErrors?.shopName}
              {...register(`shops.${index}.shopName`)}
            />
            {shopErrors?.shopName && (
              <FieldDescription>
                {shopErrors.shopName.message}
              </FieldDescription>
            )}
          </Field>

          {/* Shop Category */}
          <Field data-invalid={shopErrors?.shopCategory ? true : undefined}>
            <FieldLabel htmlFor={`${prefix}.shopCategory`}>
              Shop Category{" "}
              <span className="text-muted-foreground font-normal">(Optional)</span>
            </FieldLabel>
            <Select
              value={watch(`shops.${index}.shopCategory`) || ""}
              onValueChange={(val) =>
                setValue(`shops.${index}.shopCategory`, val, { shouldValidate: true })
              }
            >
              <SelectTrigger id={`${prefix}.shopCategory`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          {/* Room Number & Licence No */}
          <Field data-invalid={shopErrors?.roomNumber ? true : undefined}>
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

          {/* License Toggle */}
          <Field>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <FieldLabel htmlFor={`${prefix}.hasLicense`} className="text-base">
                  Has License?
                </FieldLabel>
              </div>
              <Switch
                id={`${prefix}.hasLicense`}
                checked={hasLicense}
                onCheckedChange={(checked) =>
                  setValue(`shops.${index}.hasLicense`, checked)
                }
              />
            </div>
          </Field>

          {/* License Fields - shown when hasLicense is true */}
          {hasLicense && (
            <>
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
            </>
          )}

          {/* Owner Fields - shown when hasLicense is false */}
          {!hasLicense && (
            <>
              <Field
                data-invalid={shopErrors?.ownerName ? true : undefined}
              >
                <FieldLabel htmlFor={`${prefix}.ownerName`}>
                  Owner Name
                </FieldLabel>
                <Input
                  id={`${prefix}.ownerName`}
                  placeholder="Owner name"
                  aria-invalid={!!shopErrors?.ownerName}
                  {...register(`shops.${index}.ownerName`)}
                />
                {shopErrors?.ownerName && (
                  <FieldDescription>
                    {shopErrors.ownerName.message}
                  </FieldDescription>
                )}
              </Field>

              <Field
                data-invalid={shopErrors?.ownerContactNo ? true : undefined}
              >
                <FieldLabel htmlFor={`${prefix}.ownerContactNo`}>
                  Owner Contact No
                </FieldLabel>
                <Input
                  id={`${prefix}.ownerContactNo`}
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit number"
                  aria-invalid={!!shopErrors?.ownerContactNo}
                  {...register(`shops.${index}.ownerContactNo`)}
                />
                {shopErrors?.ownerContactNo && (
                  <FieldDescription>
                    {shopErrors.ownerContactNo.message}
                  </FieldDescription>
                )}
              </Field>
            </>
          )}

          {/* Managing Person (always shown) */}
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

          {/* Connected Room */}
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

          {/* Waste Management Section */}
          <div className="flex flex-col gap-3 rounded-lg border p-3">
            <span className="text-sm font-medium">Waste Management</span>
            <Field>
              <FieldLabel htmlFor={`${prefix}.wasteManagement.water`}>Water</FieldLabel>
              <Input
                id={`${prefix}.wasteManagement.water`}
                placeholder="How is water waste managed?"
                {...register(`shops.${index}.wasteManagement.water`)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${prefix}.wasteManagement.foodWaste`}>Food Waste</FieldLabel>
              <Input
                id={`${prefix}.wasteManagement.foodWaste`}
                placeholder="How is food waste managed?"
                {...register(`shops.${index}.wasteManagement.foodWaste`)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${prefix}.wasteManagement.paperWaste`}>Paper Waste</FieldLabel>
              <Input
                id={`${prefix}.wasteManagement.paperWaste`}
                placeholder="How is paper waste managed?"
                {...register(`shops.${index}.wasteManagement.paperWaste`)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${prefix}.wasteManagement.plasticWaste`}>Plastic Waste</FieldLabel>
              <Input
                id={`${prefix}.wasteManagement.plasticWaste`}
                placeholder="How is plastic waste managed?"
                {...register(`shops.${index}.wasteManagement.plasticWaste`)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${prefix}.wasteManagement.otherWaste`}>
                Other Waste <span className="text-muted-foreground font-normal">(Optional)</span>
              </FieldLabel>
              <Input
                id={`${prefix}.wasteManagement.otherWaste`}
                placeholder="Any other waste management"
                {...register(`shops.${index}.wasteManagement.otherWaste`)}
              />
            </Field>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
