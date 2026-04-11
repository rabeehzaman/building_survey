export const WARD_OPTIONS = Array.from({ length: 56 }, (_, i) => ({
  value: String(i + 1),
  label: `Ward ${i + 1}`,
}))

export const BUILDING_STATUS_OPTIONS = [
  { value: "working", label: "Working" },
  { value: "vacant", label: "Vacant" },
] as const

export const TOILET_STATUS_OPTIONS = [
  { value: "usable", label: "Usable" },
  { value: "unusable", label: "Unusable" },
  { value: "none", label: "None" },
] as const

export const ROOM_STATUS_OPTIONS = [
  { value: "vacant", label: "Vacant" },
  { value: "occupied", label: "Occupied" },
] as const

export type BuildingStatus = (typeof BUILDING_STATUS_OPTIONS)[number]["value"]
export type ToiletStatus = (typeof TOILET_STATUS_OPTIONS)[number]["value"]
export type RoomStatus = (typeof ROOM_STATUS_OPTIONS)[number]["value"]
