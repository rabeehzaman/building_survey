import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import type { BuildingWithShops } from "@/lib/storage/survey-storage"
import type { FloorDetail, RoomDetail, WasteManagement } from "@/lib/supabase/types"

function formatRooms(rooms: RoomDetail[] | null): string {
  if (!rooms || rooms.length === 0) return ""
  return rooms
    .map((r) => `#${r.roomNumber}(${r.status})`)
    .join(", ")
}

function formatWaste(wm: WasteManagement | null): string {
  if (!wm) return ""
  const parts: string[] = []
  if (wm.water) parts.push(`Water: ${wm.water}`)
  if (wm.foodWaste) parts.push(`Food: ${wm.foodWaste}`)
  if (wm.paperWaste) parts.push(`Paper: ${wm.paperWaste}`)
  if (wm.plasticWaste) parts.push(`Plastic: ${wm.plasticWaste}`)
  if (wm.otherWaste) parts.push(`Other: ${wm.otherWaste}`)
  return parts.join("; ")
}

function flattenForExport(buildings: BuildingWithShops[]) {
  const rows: Record<string, string | number>[] = []

  for (const b of buildings) {
    const rooms = (b.rooms as RoomDetail[]) || []
    const vacantCount = rooms.filter((r) => r.status === "vacant").length
    const occupiedCount = rooms.filter((r) => r.status === "occupied").length

    const buildingFields = {
      "Old Ward No": b.old_ward_no,
      "New Ward No": b.new_ward_no,
      Place: b.place,
      "Road Name": b.road_name,
      "Building Number": b.building_number,
      "Building Owner Name": b.building_owner_name,
      "Owner Mob No 1": b.owner_mob_no_1,
      "Mob No 2": b.mob_no_2 || "",
      "Manager Name": b.manager_name || "",
      "Manager Contact": b.manager_contact_no || "",
      "Number of Floors": b.number_of_floors,
      "Floor Details": ((b.floors as any[]) || []).map((f: any) =>
        `Floor ${f.floorNumber}: ${f.roofType}, S:${f.staircaseCount ?? 0}, L:${f.liftCount ?? 0}, T:${f.totalToilets ?? 0}(U:${f.usableToilets ?? 0}/X:${f.unusableToilets ?? 0})`
      ).join(" | "),
      "Total Staircase": ((b.floors as any[]) || []).reduce((s: number, f: any) => s + (f.staircaseCount ?? 0), 0),
      "Total Lift": ((b.floors as any[]) || []).reduce((s: number, f: any) => s + (f.liftCount ?? 0), 0),
      "Total Toilets": ((b.floors as any[]) || []).reduce((s: number, f: any) => s + (f.totalToilets ?? 0), 0),
      "Total Usable Toilets": ((b.floors as any[]) || []).reduce((s: number, f: any) => s + (f.usableToilets ?? 0), 0),
      "Total Unusable Toilets": ((b.floors as any[]) || []).reduce((s: number, f: any) => s + (f.unusableToilets ?? 0), 0),
      "Building Status": b.building_status,
      "Vacancy Period": b.vacancy_period || "",
      "Total Rooms": b.total_rooms,
      "Occupied Rooms": occupiedCount,
      "Vacant Rooms": vacantCount,
      "Room Details": formatRooms(rooms),
      Latitude: b.latitude ?? "",
      Longitude: b.longitude ?? "",
      Photos: b.photos?.length ?? 0,
    }

    if (b.shops.length > 0) {
      for (const shop of b.shops) {
        rows.push({
          ...buildingFields,
          "Shop Name": shop.shop_details,
          "Shop Category": shop.shop_category || "",
          "Has License": shop.has_license ? "Yes" : "No",
          "Shop Licence No": shop.shop_licence_no || "",
          "Shop Licensee Name": shop.shop_licensee_name || "",
          "Licensee Contact No": shop.licensee_contact_no || "",
          "Owner Name (No License)": shop.owner_name || "",
          "Owner Contact (No License)": shop.owner_contact_no || "",
          "Shop Managing Person": shop.shop_managing_person,
          "Manager Contact No": shop.managing_person_contact_no,
          "Connected Room": shop.connected_room || "",
          "Room Number": shop.room_number,
          "Waste Management": formatWaste(
            shop.waste_management as WasteManagement | null
          ),
        })
      }
    } else {
      rows.push({
        ...buildingFields,
        "Shop Name": "",
        "Shop Category": "",
        "Has License": "",
        "Shop Licence No": "",
        "Shop Licensee Name": "",
        "Licensee Contact No": "",
        "Owner Name (No License)": "",
        "Owner Contact (No License)": "",
        "Shop Managing Person": "",
        "Manager Contact No": "",
        "Connected Room": "",
        "Room Number": "",
        "Waste Management": "",
      })
    }
  }

  return rows
}

export function exportToExcel(buildings: BuildingWithShops[]) {
  const rows = flattenForExport(buildings)
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Building Details")

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  saveAs(blob, `Building_Details_${new Date().toISOString().split("T")[0]}.xlsx`)
}

export function exportToCSV(buildings: BuildingWithShops[]) {
  const rows = flattenForExport(buildings)
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  saveAs(blob, `Building_Details_${new Date().toISOString().split("T")[0]}.csv`)
}
