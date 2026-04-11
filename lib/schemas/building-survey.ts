import { z } from "zod"

const phoneSchema = z
  .string()
  .regex(/^[0-9]{10}$/, "Must be a 10-digit phone number")

const optionalPhoneSchema = z
  .string()
  .regex(/^[0-9]{10}$/, "Must be a 10-digit phone number")
  .or(z.literal(""))
  .optional()

export const roomDetailSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  status: z.enum(["vacant", "occupied"]),
})

export const wasteManagementSchema = z.object({
  water: z.boolean(),
  foodWaste: z.boolean(),
  paperWaste: z.boolean(),
  plasticWaste: z.boolean(),
  otherWaste: z.string().optional(),
})

export const shopDetailSchema = z
  .object({
    shopName: z.string().min(1, "Shop name is required"),
    shopCategory: z.string().optional(),
    hasLicense: z.boolean(),
    shopLicenceNo: z.string().optional(),
    shopLicenseeName: z.string().optional(),
    licenseeContactNo: z.string().optional(),
    ownerName: z.string().optional(),
    ownerContactNo: z.string().optional(),
    shopManagingPerson: z.string().min(1, "Managing person is required"),
    managingPersonContactNo: phoneSchema,
    connectedRoom: z.string().optional(),
    roomNumber: z.string().min(1, "Room number is required"),
    wasteManagement: wasteManagementSchema,
  })
  .superRefine((data, ctx) => {
    if (data.hasLicense) {
      if (!data.shopLicenceNo || data.shopLicenceNo.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Licence number is required",
          path: ["shopLicenceNo"],
        })
      }
      if (!data.shopLicenseeName || data.shopLicenseeName.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Licensee name is required",
          path: ["shopLicenseeName"],
        })
      }
      if (
        !data.licenseeContactNo ||
        !/^[0-9]{10}$/.test(data.licenseeContactNo)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must be a 10-digit phone number",
          path: ["licenseeContactNo"],
        })
      }
    } else {
      if (!data.ownerName || data.ownerName.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Owner name is required",
          path: ["ownerName"],
        })
      }
      if (!data.ownerContactNo || !/^[0-9]{10}$/.test(data.ownerContactNo)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must be a 10-digit phone number",
          path: ["ownerContactNo"],
        })
      }
    }
  })

export const buildingSurveySchema = z
  .object({
    // Step 1: Building Information
    oldWardNo: z.string().min(1, "Old ward number is required"),
    newWardNo: z.string().min(1, "New ward number is required"),
    place: z.string().min(1, "Place is required"),
    roadName: z.string().min(1, "Road name is required"),
    buildingNumber: z.string().min(1, "Building number is required"),
    buildingOwnerName: z.string().min(1, "Owner name is required"),
    ownerMobNo1: phoneSchema,
    ownerMobNo2: optionalPhoneSchema,
    managerName: z.string().min(1, "Manager name is required"),
    managerContactNo: phoneSchema,

    // Floor details
    numberOfFloors: z.coerce.number().min(0, "Must be 0 or more"),
    terraceFloors: z.coerce.number().min(0, "Must be 0 or more"),
    sheetFloors: z.coerce.number().min(0, "Must be 0 or more"),

    // Floor base
    staircaseCount: z.coerce.number().min(0, "Must be 0 or more"),
    liftCount: z.coerce.number().min(0, "Must be 0 or more"),
    totalToilets: z.coerce.number().min(0, "Must be 0 or more"),
    usableToilets: z.coerce.number().min(0, "Must be 0 or more"),
    unusableToilets: z.coerce.number().min(0, "Must be 0 or more"),

    // Step 2: Building Status
    buildingStatus: z.enum(["working", "vacant"]),
    vacancyPeriod: z.string().optional(),
    hasShops: z.boolean(),

    // Room details
    totalRooms: z.coerce.number().min(0, "Must be 0 or more"),
    rooms: z.array(roomDetailSchema),

    // GPS coordinates (auto-captured)
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),

    // Photos (optional)
    photos: z.array(z.string()).optional(),

    // Step 3: Shop Details (conditional)
    shops: z.array(shopDetailSchema).optional(),
  })
  .refine(
    (data) =>
      data.numberOfFloors === 0 ||
      data.terraceFloors + data.sheetFloors === data.numberOfFloors,
    {
      message: "Terrace floors + Sheet floors must equal total number of floors",
      path: ["sheetFloors"],
    }
  )

// Per-step schemas for validation
export const step1Schema = z
  .object({
    oldWardNo: z.string().min(1, "Old ward number is required"),
    newWardNo: z.string().min(1, "New ward number is required"),
    place: z.string().min(1, "Place is required"),
    roadName: z.string().min(1, "Road name is required"),
    buildingNumber: z.string().min(1, "Building number is required"),
    buildingOwnerName: z.string().min(1, "Owner name is required"),
    ownerMobNo1: phoneSchema,
    ownerMobNo2: optionalPhoneSchema,
    managerName: z.string().min(1, "Manager name is required"),
    managerContactNo: phoneSchema,
    numberOfFloors: z.coerce.number().min(0, "Must be 0 or more"),
    terraceFloors: z.coerce.number().min(0, "Must be 0 or more"),
    sheetFloors: z.coerce.number().min(0, "Must be 0 or more"),
  })
  .refine(
    (data) =>
      data.numberOfFloors === 0 ||
      data.terraceFloors + data.sheetFloors === data.numberOfFloors,
    {
      message:
        "Terrace floors + Sheet floors must equal total number of floors",
      path: ["sheetFloors"],
    }
  )

export const step2Schema = z
  .object({
    buildingStatus: z.enum(["working", "vacant"]),
    vacancyPeriod: z.string().optional(),
    hasShops: z.boolean(),
    totalRooms: z.coerce.number().min(0, "Must be 0 or more"),
    rooms: z.array(roomDetailSchema),
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

export type RoomDetail = z.infer<typeof roomDetailSchema>
export type WasteManagement = z.infer<typeof wasteManagementSchema>
export type ShopDetail = z.infer<typeof shopDetailSchema>
export type BuildingSurvey = z.infer<typeof buildingSurveySchema>
