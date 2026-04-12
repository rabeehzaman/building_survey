export type FloorDetail = {
  floorNumber: number
  roofType: "terrace" | "sheet"
  staircaseCount: number
  liftCount: number
  totalToilets: number
  usableToilets: number
  unusableToilets: number
}

export type RoomDetail = {
  roomNumber: string
  status: "vacant" | "occupied"
}

export type WasteManagement = {
  water: string
  foodWaste: string
  paperWaste: string
  plasticWaste: string
  otherWaste: string
}

export type Database = {
  public: {
    Tables: {
      buildings: {
        Row: {
          id: string
          old_ward_no: number
          new_ward_no: number
          place: string
          road_name: string
          building_number: string
          building_owner_name: string
          owner_mob_no_1: string
          mob_no_2: string | null
          manager_name: string | null
          manager_contact_no: string | null
          number_of_floors: number
          floors: FloorDetail[] | null
          staircase_count: number
          lift_count: number
          total_toilets: number
          usable_toilets: number
          unusable_toilets: number
          building_status: "vacant" | "working"
          vacancy_period: string | null
          has_shops: boolean
          total_rooms: number
          rooms: RoomDetail[] | null
          latitude: number | null
          longitude: number | null
          photos: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          old_ward_no: number
          new_ward_no: number
          place: string
          road_name: string
          building_number: string
          building_owner_name: string
          owner_mob_no_1: string
          mob_no_2?: string | null
          manager_name?: string | null
          manager_contact_no?: string | null
          number_of_floors?: number
          floors?: FloorDetail[] | null
          staircase_count?: number
          lift_count?: number
          total_toilets?: number
          usable_toilets?: number
          unusable_toilets?: number
          building_status: "vacant" | "working"
          vacancy_period?: string | null
          has_shops?: boolean
          total_rooms?: number
          rooms?: RoomDetail[] | null
          latitude?: number | null
          longitude?: number | null
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          old_ward_no?: number
          new_ward_no?: number
          place?: string
          road_name?: string
          building_number?: string
          building_owner_name?: string
          owner_mob_no_1?: string
          mob_no_2?: string | null
          manager_name?: string | null
          manager_contact_no?: string | null
          number_of_floors?: number
          floors?: FloorDetail[] | null
          staircase_count?: number
          lift_count?: number
          total_toilets?: number
          usable_toilets?: number
          unusable_toilets?: number
          building_status?: "vacant" | "working"
          vacancy_period?: string | null
          has_shops?: boolean
          total_rooms?: number
          rooms?: RoomDetail[] | null
          latitude?: number | null
          longitude?: number | null
          photos?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: ""
            columns: []
            isOneToOne: false
            referencedRelation: ""
            referencedColumns: []
          },
        ]
      }
      shops: {
        Row: {
          id: string
          building_id: string
          shop_details: string
          shop_category: string | null
          has_license: boolean
          shop_licence_no: string | null
          shop_licensee_name: string | null
          licensee_contact_no: string | null
          owner_name: string | null
          owner_contact_no: string | null
          shop_managing_person: string
          managing_person_contact_no: string
          connected_room: string | null
          room_number: string
          waste_management: WasteManagement | null
          created_at: string
        }
        Insert: {
          id?: string
          building_id: string
          shop_details: string
          shop_category?: string | null
          has_license?: boolean
          shop_licence_no?: string | null
          shop_licensee_name?: string | null
          licensee_contact_no?: string | null
          owner_name?: string | null
          owner_contact_no?: string | null
          shop_managing_person: string
          managing_person_contact_no: string
          connected_room?: string | null
          room_number: string
          waste_management?: WasteManagement | null
          created_at?: string
        }
        Update: {
          id?: string
          building_id?: string
          shop_details?: string
          shop_category?: string | null
          has_license?: boolean
          shop_licence_no?: string | null
          shop_licensee_name?: string | null
          licensee_contact_no?: string | null
          owner_name?: string | null
          owner_contact_no?: string | null
          shop_managing_person?: string
          managing_person_contact_no?: string
          connected_room?: string | null
          room_number?: string
          waste_management?: WasteManagement | null
        }
        Relationships: [
          {
            foreignKeyName: "shops_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
