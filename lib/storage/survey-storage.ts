import imageCompression from "browser-image-compression"
import { v4 as uuidv4 } from "uuid"
import { createClient } from "@/lib/supabase/client"
import type { BuildingSurvey, ShopDetail } from "@/lib/schemas/building-survey"
import type { Database } from "@/lib/supabase/types"

type BuildingRow = Database["public"]["Tables"]["buildings"]["Row"]
type ShopRow = Database["public"]["Tables"]["shops"]["Row"]

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
  wardNo: number,
  buildingNumber: string,
  excludeId?: string
): Promise<{ isDuplicate: boolean; ownerName?: string }> {
  const supabase = createClient()
  let query = supabase
    .from("buildings")
    .select("id, building_owner_name")
    .eq("ward_no", wardNo)
    .eq("building_number", buildingNumber)

  if (excludeId) query = query.neq("id", excludeId)

  const { data } = await query.limit(1)
  if (data && data.length > 0) {
    return { isDuplicate: true, ownerName: data[0].building_owner_name }
  }
  return { isDuplicate: false }
}

export async function createBuilding(
  survey: BuildingSurvey
): Promise<string> {
  const supabase = createClient()

  const { data: building, error: buildingError } = await supabase
    .from("buildings")
    .insert({
      ward_no: Number(survey.wardNo),
      location: survey.location,
      building_number: survey.buildingNumber,
      building_owner_name: survey.buildingOwnerName,
      owner_mob_no_1: survey.ownerMobNo1,
      mob_no_2: survey.ownerMobNo2 || null,
      building_status: survey.buildingStatus,
      vacancy_period:
        survey.buildingStatus === "vacant" ? survey.vacancyPeriod || null : null,
      has_shops: survey.hasShops,
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
      shop_details: shop.shopDetails,
      shop_licence_no: shop.shopLicenceNo,
      shop_licensee_name: shop.shopLicenseeName,
      licensee_contact_no: shop.licenseeContactNo,
      shop_managing_person: shop.shopManagingPerson,
      managing_person_contact_no: shop.managingPersonContactNo,
      connected_room: shop.connectedRoom || null,
      ward_number: Number(shop.wardNumber),
      room_number: shop.roomNumber,
      location_name: shop.locationName || "",
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
      ward_no: Number(survey.wardNo),
      location: survey.location,
      building_number: survey.buildingNumber,
      building_owner_name: survey.buildingOwnerName,
      owner_mob_no_1: survey.ownerMobNo1,
      mob_no_2: survey.ownerMobNo2 || null,
      building_status: survey.buildingStatus,
      vacancy_period:
        survey.buildingStatus === "vacant" ? survey.vacancyPeriod || null : null,
      has_shops: survey.hasShops,
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
      shop_details: shop.shopDetails,
      shop_licence_no: shop.shopLicenceNo,
      shop_licensee_name: shop.shopLicenseeName,
      licensee_contact_no: shop.licenseeContactNo,
      shop_managing_person: shop.shopManagingPerson,
      managing_person_contact_no: shop.managingPersonContactNo,
      connected_room: shop.connectedRoom || null,
      ward_number: Number(shop.wardNumber),
      room_number: shop.roomNumber,
      location_name: shop.locationName || "",
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
    wardNo: String(building.ward_no),
    location: building.location,
    buildingNumber: building.building_number,
    buildingOwnerName: building.building_owner_name,
    ownerMobNo1: building.owner_mob_no_1,
    ownerMobNo2: building.mob_no_2 || "",
    buildingStatus: building.building_status,
    vacancyPeriod: building.vacancy_period || "",
    hasShops: building.has_shops,
    latitude: building.latitude,
    longitude: building.longitude,
    photos: building.photos ?? [],
    shops: building.shops.map((shop) => ({
      shopDetails: shop.shop_details,
      shopLicenceNo: shop.shop_licence_no,
      shopLicenseeName: shop.shop_licensee_name,
      licenseeContactNo: shop.licensee_contact_no,
      shopManagingPerson: shop.shop_managing_person,
      managingPersonContactNo: shop.managing_person_contact_no,
      connectedRoom: shop.connected_room || "",
      wardNumber: String(shop.ward_number),
      roomNumber: shop.room_number,
      locationName: shop.location_name,
    })),
  }
}
