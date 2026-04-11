import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer"
import { saveAs } from "file-saver"
import type { BuildingWithShops } from "@/lib/storage/survey-storage"
import type { RoomDetail, WasteManagement } from "@/lib/supabase/types"

const colors = {
  primary: "#18181b",
  secondary: "#71717a",
  accent: "#f4f4f5",
  border: "#e4e4e7",
  white: "#ffffff",
  green: "#16a34a",
  orange: "#ea580c",
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.primary,
  },
  // Header
  header: {
    marginBottom: 24,
    borderBottom: `2px solid ${colors.primary}`,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: colors.secondary,
  },
  // Section
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    marginTop: 20,
    paddingBottom: 6,
    borderBottom: `1px solid ${colors.border}`,
  },
  // Table
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowLast: {
    flexDirection: "row",
  },
  tableLabel: {
    width: "35%",
    padding: 8,
    backgroundColor: colors.accent,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: colors.secondary,
  },
  tableValue: {
    width: "65%",
    padding: 8,
    fontSize: 10,
  },
  // Status badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    alignSelf: "flex-start",
  },
  statusWorking: {
    backgroundColor: "#dcfce7",
    color: colors.green,
  },
  statusVacant: {
    backgroundColor: "#fff7ed",
    color: colors.orange,
  },
  // Shop card
  shopCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    marginBottom: 10,
    overflow: "hidden",
  },
  shopHeader: {
    backgroundColor: colors.accent,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  shopHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  shopDescription: {
    fontSize: 9,
    color: colors.secondary,
    marginTop: 2,
  },
  shopGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  shopField: {
    width: "50%",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  shopFieldLabel: {
    fontSize: 8,
    color: colors.secondary,
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
  },
  shopFieldValue: {
    fontSize: 10,
  },
  // Footer
  footer: {
    marginTop: 24,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: colors.secondary,
  },
  // Page number
  pageNumber: {
    position: "absolute",
    bottom: 20,
    right: 40,
    fontSize: 8,
    color: colors.secondary,
  },
})

function InfoRow({
  label,
  value,
  isLast,
}: {
  label: string
  value: string
  isLast?: boolean
}) {
  if (!value) return null
  return (
    <View style={isLast ? styles.tableRowLast : styles.tableRow}>
      <Text style={styles.tableLabel}>{label}</Text>
      <Text style={styles.tableValue}>{value}</Text>
    </View>
  )
}

function ShopField({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <View style={styles.shopField}>
      <Text style={styles.shopFieldLabel}>{label}</Text>
      <Text style={styles.shopFieldValue}>{value}</Text>
    </View>
  )
}

function formatWasteForPDF(wm: WasteManagement | null): string {
  if (!wm) return ""
  const parts: string[] = []
  if (wm.water) parts.push("Water")
  if (wm.foodWaste) parts.push("Food Waste")
  if (wm.paperWaste) parts.push("Paper Waste")
  if (wm.plasticWaste) parts.push("Plastic Waste")
  if (wm.otherWaste) parts.push(wm.otherWaste)
  return parts.join(", ")
}

function BuildingPage({ building }: { building: BuildingWithShops }) {
  const rooms = (building.rooms as RoomDetail[]) || []
  const vacantCount = rooms.filter((r) => r.status === "vacant").length
  const occupiedCount = rooms.filter((r) => r.status === "occupied").length

  const infoRows = [
    { label: "Old Ward No", value: String(building.old_ward_no) },
    { label: "New Ward No", value: String(building.new_ward_no) },
    { label: "Place", value: building.place },
    { label: "Road Name", value: building.road_name },
    { label: "Building Number", value: building.building_number },
    { label: "Owner Name", value: building.building_owner_name },
    { label: "Owner Mobile 1", value: building.owner_mob_no_1 },
    { label: "Owner Mobile 2", value: building.mob_no_2 || "" },
    { label: "Manager Name", value: building.manager_name || "" },
    { label: "Manager Contact", value: building.manager_contact_no || "" },
    { label: "Floors", value: building.number_of_floors > 0 ? `${building.number_of_floors} (Terrace: ${building.terrace_floors}, Sheet: ${building.sheet_floors})` : "" },
    { label: "Staircase", value: building.has_staircase ? "Yes" : "No" },
    { label: "Lift", value: building.has_lift ? "Yes" : "No" },
    { label: "Toilet", value: building.toilet_status },
    { label: "Building Status", value: building.building_status.toUpperCase() },
    ...(building.building_status === "vacant"
      ? [{ label: "Vacancy Period", value: building.vacancy_period || "" }]
      : []),
    { label: "Total Rooms", value: building.total_rooms > 0 ? `${building.total_rooms} (Occupied: ${occupiedCount}, Vacant: ${vacantCount})` : "" },
    ...(building.latitude && building.longitude
      ? [{ label: "GPS Coordinates", value: `${Number(building.latitude).toFixed(6)}, ${Number(building.longitude).toFixed(6)}` }]
      : []),
  ].filter((r) => r.value)

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Building Survey Report</Text>
        <Text style={styles.subtitle}>
          Generated on {new Date().toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      {/* Building Info */}
      <Text style={styles.sectionTitle}>Building Information</Text>
      <View style={styles.table}>
        {infoRows.map((row, i) => (
          <InfoRow
            key={row.label}
            label={row.label}
            value={row.value}
            isLast={i === infoRows.length - 1}
          />
        ))}
      </View>

      {/* Status Badge */}
      <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
        <View
          style={[
            styles.statusBadge,
            building.building_status === "working"
              ? styles.statusWorking
              : styles.statusVacant,
          ]}
        >
          <Text>{building.building_status.toUpperCase()}</Text>
        </View>
        {building.has_shops && (
          <View
            style={[styles.statusBadge, { backgroundColor: colors.accent, color: colors.primary }]}
          >
            <Text>{building.shops.length} Shop{building.shops.length !== 1 ? "s" : ""}</Text>
          </View>
        )}
      </View>

      {/* Shop Details */}
      {building.shops.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            Shop Details ({building.shops.length})
          </Text>
          {building.shops.map((shop, index) => (
            <View key={shop.id} style={styles.shopCard}>
              <View style={styles.shopHeader}>
                <Text style={styles.shopHeaderText}>Shop {index + 1}</Text>
                <Text style={styles.shopDescription}>
                  {shop.shop_details}
                </Text>
              </View>
              <View style={styles.shopGrid}>
                {shop.shop_category && (
                  <ShopField label="Category" value={shop.shop_category} />
                )}
                <ShopField label="Room Number" value={shop.room_number} />
                <ShopField label="License" value={shop.has_license ? "Yes" : "No"} />
                {shop.has_license ? (
                  <>
                    <ShopField label="Licence No" value={shop.shop_licence_no || ""} />
                    <ShopField label="Licensee Name" value={shop.shop_licensee_name || ""} />
                    <ShopField label="Licensee Contact" value={shop.licensee_contact_no || ""} />
                  </>
                ) : (
                  <>
                    <ShopField label="Owner Name" value={shop.owner_name || ""} />
                    <ShopField label="Owner Contact" value={shop.owner_contact_no || ""} />
                  </>
                )}
                <ShopField
                  label="Managing Person"
                  value={shop.shop_managing_person}
                />
                <ShopField
                  label="Manager Contact"
                  value={shop.managing_person_contact_no}
                />
                <ShopField
                  label="Connected Room"
                  value={shop.connected_room || ""}
                />
                <ShopField
                  label="Waste Management"
                  value={formatWasteForPDF(shop.waste_management as WasteManagement | null)}
                />
              </View>
            </View>
          ))}
        </>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          Created: {new Date(building.created_at).toLocaleString()}
        </Text>
        <Text>
          Updated: {new Date(building.updated_at).toLocaleString()}
        </Text>
      </View>

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) =>
          `${pageNumber} / ${totalPages}`
        }
        fixed
      />
    </Page>
  )
}

function BuildingReportDocument({
  buildings,
}: {
  buildings: BuildingWithShops[]
}) {
  return (
    <Document>
      {buildings.map((building) => (
        <BuildingPage key={building.id} building={building} />
      ))}
    </Document>
  )
}

export async function exportSinglePDF(building: BuildingWithShops) {
  const rawBlob = await pdf(
    <BuildingReportDocument buildings={[building]} />
  ).toBlob()
  const pdfBlob = new Blob([rawBlob], { type: "application/pdf" })
  saveAs(
    pdfBlob,
    `Building_${building.building_number}_Ward${building.new_ward_no}.pdf`
  )
}

export async function exportBulkPDF(buildings: BuildingWithShops[]) {
  const rawBlob = await pdf(
    <BuildingReportDocument buildings={buildings} />
  ).toBlob()
  const pdfBlob = new Blob([rawBlob], { type: "application/pdf" })
  saveAs(
    pdfBlob,
    `Building_Details_${new Date().toISOString().split("T")[0]}.pdf`
  )
}
