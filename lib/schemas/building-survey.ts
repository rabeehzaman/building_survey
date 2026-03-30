import { z } from "zod"

const phoneSchema = z
  .string()
  .regex(/^[0-9]{10}$/, "Must be a 10-digit phone number")

const optionalPhoneSchema = z
  .string()
  .regex(/^[0-9]{10}$/, "Must be a 10-digit phone number")
  .or(z.literal(""))
  .optional()

export const shopDetailSchema = z.object({
  shopDetails: z.string().min(1, "Shop details are required"),
  shopLicenceNo: z.string().min(1, "Licence number is required"),
  shopLicenseeName: z.string().min(1, "Licensee name is required"),
  licenseeContactNo: phoneSchema,
  shopManagingPerson: z.string().min(1, "Managing person is required"),
  managingPersonContactNo: phoneSchema,
  connectedRoom: z.string().optional(),
  wardNumber: z.string().min(1, "Ward number is required"),
  roomNumber: z.string().min(1, "Room number is required"),
  locationName: z.string().min(1, "Location name is required"),
})

export const buildingSurveySchema = z.object({
  // Step 1: Building Information
  wardNo: z.string().min(1, "Ward number is required"),
  location: z.string().min(1, "Location is required"),
  buildingNumber: z.string().min(1, "Building number is required"),
  buildingOwnerName: z.string().min(1, "Owner name is required"),
  ownerMobNo1: phoneSchema,
  ownerMobNo2: optionalPhoneSchema,

  // Step 2: Building Status
  buildingStatus: z.enum(["working", "vacant"]),
  vacancyPeriod: z.string().optional(),
  hasShops: z.boolean(),

  // GPS coordinates (auto-captured)
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),

  // Step 3: Shop Details (conditional)
  shops: z.array(shopDetailSchema).optional(),
})

// Per-step schemas for validation
export const step1Schema = z.object({
  wardNo: z.string().min(1, "Ward number is required"),
  location: z.string().min(1, "Location is required"),
  buildingNumber: z.string().min(1, "Building number is required"),
  buildingOwnerName: z.string().min(1, "Owner name is required"),
  ownerMobNo1: phoneSchema,
  ownerMobNo2: optionalPhoneSchema,
})

export const step2Schema = z
  .object({
    buildingStatus: z.enum(["working", "vacant"]),
    vacancyPeriod: z.string().optional(),
    hasShops: z.boolean(),
  })
  .refine(
    (data) =>
      data.buildingStatus !== "vacant" ||
      (data.vacancyPeriod && data.vacancyPeriod.length > 0),
    {
      message: "Vacancy period is required when status is Vacant",
      path: ["vacancyPeriod"],
    }
  )

export const step3Schema = z.object({
  shops: z.array(shopDetailSchema).min(1, "At least one shop is required"),
})

export type ShopDetail = z.infer<typeof shopDetailSchema>
export type BuildingSurvey = z.infer<typeof buildingSurveySchema>
