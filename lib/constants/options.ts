export const WARD_OPTIONS = Array.from({ length: 56 }, (_, i) => ({
  value: String(i + 1),
  label: `Ward ${i + 1}`,
}))

export const BUILDING_STATUS_OPTIONS = [
  { value: "working", label: "Working" },
  { value: "vacant", label: "Vacant" },
] as const

export type BuildingStatus = (typeof BUILDING_STATUS_OPTIONS)[number]["value"]
