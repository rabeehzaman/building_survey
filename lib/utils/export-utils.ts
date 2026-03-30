import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import type { BuildingWithShops } from "@/lib/storage/survey-storage"

function flattenForExport(buildings: BuildingWithShops[]) {
  const rows: Record<string, string | number>[] = []

  for (const b of buildings) {
    if (b.shops.length > 0) {
      for (const shop of b.shops) {
        rows.push({
          "Ward No": b.ward_no,
          Location: b.location,
          "Building Number": b.building_number,
          "Building Owner Name": b.building_owner_name,
          "Owner Mob No 1": b.owner_mob_no_1,
          "Mob No 2": b.mob_no_2 || "",
          "Building Status": b.building_status,
          "Vacancy period": b.vacancy_period || "",
          Latitude: b.latitude ?? "",
          Longitude: b.longitude ?? "",
          "Shop Details": shop.shop_details,
          "Shop Licence No": shop.shop_licence_no,
          "Shop Licensee Name": shop.shop_licensee_name,
          "Licensee Contact No": shop.licensee_contact_no,
          "Shop Managing person": shop.shop_managing_person,
          "Contact No": shop.managing_person_contact_no,
          "Connected room (Under that License No)":
            shop.connected_room || "",
          "Ward Number": shop.ward_number,
          "Room Number": shop.room_number,
          "Location Name (Municipality/Panchayath)": shop.location_name,
        })
      }
    } else {
      rows.push({
        "Ward No": b.ward_no,
        Location: b.location,
        "Building Number": b.building_number,
        "Building Owner Name": b.building_owner_name,
        "Owner Mob No 1": b.owner_mob_no_1,
        "Mob No 2": b.mob_no_2 || "",
        "Building Status": b.building_status,
        "Vacancy period": b.vacancy_period || "",
        "Shop Details": "",
        "Shop Licence No": "",
        "Shop Licensee Name": "",
        "Licensee Contact No": "",
        "Shop Managing person": "",
        "Contact No": "",
        "Connected room (Under that License No)": "",
        "Ward Number": "",
        "Room Number": "",
        "Location Name (Municipality/Panchayath)": "",
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

  // Set column widths
  worksheet["!cols"] = [
    { wch: 8 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
    { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
    { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 20 },
    { wch: 12 }, { wch: 12 }, { wch: 25 },
  ]

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
