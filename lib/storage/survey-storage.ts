import imageCompression from "browser-image-compression"
import { v4 as uuidv4 } from "uuid"
import { createClient } from "@/lib/supabase/client"
import type { BuildingSurvey, ShopDetail } from "@/lib/schemas/building-survey"
import type { Database } from "@/lib/supabase/types"

type BuildingRow = Database["public"]["Tables"]["buildings"]["Row"]
type ShopRow = Database["public"]["Tables"]["shops"]["Row"]
type ShopCategoryRow = Database["public"]["Tables"]["shop_categories"]["Row"]

export type BuildingWithShops = BuildingRow & { shops: ShopRow[] }

export async function getBuildings(): Promise<BuildingWithShops[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("buildings")
    .select("*, shops(*)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as BuildingWithShops[]
}

export async function getBuildingById(
  id: string
): Promise<BuildingWithShops | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("buildings")
    .select("*, shops(*)")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }
  return data as BuildingWithShops
}

export async function uploadPhoto(file: File): Promise<string> {
  const supabase = createClient()
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  })
  const ext = file.name.split(".").pop() || "jpg"
  const path = `${uuidv4()}.${ext}`

  const { error } = await supabase.storage
    .from("building-photos")
    .upload(path, compressed, { contentType: compressed.type })

  if (error) throw error

  const { data } = supabase.storage
    .from("building-photos")
    .getPublicUrl(path)

  return data.publicUrl
}

export async function deletePhoto(url: string): Promise<void> {
  const supabase = createClient()
  const path = url.split("/building-photos/").pop()
  if (!path) return
  await supabase.storage.from("building-photos").remove([path])
}

export async function checkDuplicate(
  oldWardNo: number,
  buildingNumber: string,
  excludeId?: string
): Promise<{ isDuplicate: boolean; ownerName?: string }> {
  const supabase = createClient()
  let query = supabase
    .from("buildings")
    .select("id, building_owner_name")
    .eq("old_ward_no", oldWardNo)
    .eq("building_number", buildingNumber)

  if (excludeId) query = query.neq("id", excludeId)

  const { data } = await query.limit(1)
  if (data && data.length > 0) {
    return { isDuplicate: true, ownerName: data[0].building_owner_name }
  }
  return { isDuplicate: false }
}

// Shop Categories
export async function getShopCategories(): Promise<ShopCategoryRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("shop_categories")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function addShopCategory(name: string): Promise<ShopCategoryRow> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("shop_categories")
    .insert({ name })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteShopCategory(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("shop_categories")
    .delete()
    .eq("id", id)

  if (error) throw error
}

export async function createBuilding(
  survey: BuildingSurvey
): Promise<string> {
  const supabase = createClient()

  const { data: building, error: buildingError } = await supabase
    .from("buildings")
    .insert({
      old_ward_no: Number(survey.oldWardNo),
      new_ward_no: Number(survey.newWardNo),
      place: survey.place,
      road_name: survey.roadName,
      building_number: survey.buildingNumber,
      building_owner_name: survey.buildingOwnerName,
      owner_mob_no_1: survey.ownerMobNo1,
      mob_no_2: survey.ownerMobNo2 || null,
      manager_name: survey.managerName,
      manager_contact_no: survey.managerContactNo,
      number_of_floors: survey.numberOfFloors,
      terrace_floors: survey.terraceFloors,
      sheet_floors: survey.sheetFloors,
      staircase_count: survey.staircaseCount,
      lift_count: survey.liftCount,
      total_toilets: survey.totalToilets,
      usable_toilets: survey.usableToilets,
      unusable_toilets: survey.unusableToilets,
      building_status: survey.buildingStatus,
      vacancy_period:
        survey.buildingStatus === "vacant" ? survey.vacancyPeriod || null : null,
      has_shops: survey.hasShops,
      total_rooms: survey.totalRooms,
      rooms: survey.rooms,
      latitude: survey.latitude ?? null,
      longitude: survey.longitude ?? null,
      photos: survey.photos ?? [],
    })
    .select("id")
    .single()

  if (buildingError) throw buildingError

  if (survey.hasShops && survey.shops && survey.shops.length > 0) {
    const shopInserts = survey.shops.map((shop) => ({
      building_id: building.id,
      shop_details: shop.shopName,
      shop_category: shop.shopCategory || null,
      has_license: shop.hasLicense,
      shop_licence_no: shop.hasLicense ? shop.shopLicenceNo || null : null,
      shop_licensee_name: shop.hasLicense ? shop.shopLicenseeName || null : null,
      licensee_contact_no: shop.hasLicense ? shop.licenseeContactNo || null : null,
      owner_name: shop.hasLicense ? null : shop.ownerName || null,
      owner_contact_no: shop.hasLicense ? null : shop.ownerContactNo || null,
      shop_managing_person: shop.shopManagingPerson,
      managing_person_contact_no: shop.managingPersonContactNo,
      connected_room: shop.connectedRoom || null,
      room_number: shop.roomNumber,
      waste_management: {
        water: shop.wasteManagement.water || "",
        foodWaste: shop.wasteManagement.foodWaste || "",
        paperWaste: shop.wasteManagement.paperWaste || "",
        plasticWaste: shop.wasteManagement.plasticWaste || "",
        otherWaste: shop.wasteManagement.otherWaste || "",
      },
    }))

    const { error: shopsError } = await supabase
      .from("shops")
      .insert(shopInserts)

    if (shopsError) throw shopsError
  }

  return building.id
}

export async function updateBuilding(
  id: string,
  survey: BuildingSurvey
): Promise<void> {
  const supabase = createClient()

  const { error: buildingError } = await supabase
    .from("buildings")
    .update({
      old_ward_no: Number(survey.oldWardNo),
      new_ward_no: Number(survey.newWardNo),
      place: survey.place,
      road_name: survey.roadName,
      building_number: survey.buildingNumber,
      building_owner_name: survey.buildingOwnerName,
      owner_mob_no_1: survey.ownerMobNo1,
      mob_no_2: survey.ownerMobNo2 || null,
      manager_name: survey.managerName,
      manager_contact_no: survey.managerContactNo,
      number_of_floors: survey.numberOfFloors,
      terrace_floors: survey.terraceFloors,
      sheet_floors: survey.sheetFloors,
      staircase_count: survey.staircaseCount,
      lift_count: survey.liftCount,
      total_toilets: survey.totalToilets,
      usable_toilets: survey.usableToilets,
      unusable_toilets: survey.unusableToilets,
      building_status: survey.buildingStatus,
      vacancy_period:
        survey.buildingStatus === "vacant" ? survey.vacancyPeriod || null : null,
      has_shops: survey.hasShops,
      total_rooms: survey.totalRooms,
      rooms: survey.rooms,
      latitude: survey.latitude ?? null,
      longitude: survey.longitude ?? null,
      photos: survey.photos ?? [],
    })
    .eq("id", id)

  if (buildingError) throw buildingError

  // Delete existing shops and re-insert
  const { error: deleteError } = await supabase
    .from("shops")
    .delete()
    .eq("building_id", id)

  if (deleteError) throw deleteError

  if (survey.hasShops && survey.shops && survey.shops.length > 0) {
    const shopInserts = survey.shops.map((shop) => ({
      building_id: id,
      shop_details: shop.shopName,
      shop_category: shop.shopCategory || null,
      has_license: shop.hasLicense,
      shop_licence_no: shop.hasLicense ? shop.shopLicenceNo || null : null,
      shop_licensee_name: shop.hasLicense ? shop.shopLicenseeName || null : null,
      licensee_contact_no: shop.hasLicense ? shop.licenseeContactNo || null : null,
      owner_name: shop.hasLicense ? null : shop.ownerName || null,
      owner_contact_no: shop.hasLicense ? null : shop.ownerContactNo || null,
      shop_managing_person: shop.shopManagingPerson,
      managing_person_contact_no: shop.managingPersonContactNo,
      connected_room: shop.connectedRoom || null,
      room_number: shop.roomNumber,
      waste_management: {
        water: shop.wasteManagement.water || "",
        foodWaste: shop.wasteManagement.foodWaste || "",
        paperWaste: shop.wasteManagement.paperWaste || "",
        plasticWaste: shop.wasteManagement.plasticWaste || "",
        otherWaste: shop.wasteManagement.otherWaste || "",
      },
    }))

    const { error: shopsError } = await supabase
      .from("shops")
      .insert(shopInserts)

    if (shopsError) throw shopsError
  }
}

export async function deleteBuilding(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("buildings").delete().eq("id", id)
  if (error) throw error
}

export async function getBuildingCount(): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from("buildings")
    .select("*", { count: "exact", head: true })

  if (error) throw error
  return count ?? 0
}

// Convert DB row back to form format
export function buildingToFormData(building: BuildingWithShops): BuildingSurvey {
  return {
    oldWardNo: String(building.old_ward_no),
    newWardNo: String(building.new_ward_no),
    place: building.place,
    roadName: building.road_name,
    buildingNumber: building.building_number,
    buildingOwnerName: building.building_owner_name,
    ownerMobNo1: building.owner_mob_no_1,
    ownerMobNo2: building.mob_no_2 || "",
    managerName: building.manager_name || "",
    managerContactNo: building.manager_contact_no || "",
    numberOfFloors: building.number_of_floors || 0,
    terraceFloors: building.terrace_floors || 0,
    sheetFloors: building.sheet_floors || 0,
    staircaseCount: building.staircase_count || 0,
    liftCount: building.lift_count || 0,
    totalToilets: building.total_toilets || 0,
    usableToilets: building.usable_toilets || 0,
    unusableToilets: building.unusable_toilets || 0,
    buildingStatus: building.building_status,
    vacancyPeriod: building.vacancy_period || "",
    hasShops: building.has_shops,
    totalRooms: building.total_rooms || 0,
    rooms: (building.rooms as any[]) || [],
    latitude: building.latitude,
    longitude: building.longitude,
    photos: building.photos ?? [],
    shops: building.shops.map((shop) => ({
      shopName: shop.shop_details,
      shopCategory: shop.shop_category || "",
      hasLicense: shop.has_license ?? true,
      shopLicenceNo: shop.shop_licence_no || "",
      shopLicenseeName: shop.shop_licensee_name || "",
      licenseeContactNo: shop.licensee_contact_no || "",
      ownerName: shop.owner_name || "",
      ownerContactNo: shop.owner_contact_no || "",
      shopManagingPerson: shop.shop_managing_person,
      managingPersonContactNo: shop.managing_person_contact_no,
      connectedRoom: shop.connected_room || "",
      roomNumber: shop.room_number,
      wasteManagement: (shop.waste_management as any) || {
        water: "",
        foodWaste: "",
        paperWaste: "",
        plasticWaste: "",
        otherWaste: "",
      },
    })),
  }
}
