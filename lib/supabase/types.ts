export type Database = {
  public: {
    Tables: {
      buildings: {
        Row: {
          id: string
          ward_no: number
          location: string
          building_number: string
          building_owner_name: string
          owner_mob_no_1: string
          mob_no_2: string | null
          building_status: "vacant" | "working"
          vacancy_period: string | null
          has_shops: boolean
          latitude: number | null
          longitude: number | null
          photos: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ward_no: number
          location: string
          building_number: string
          building_owner_name: string
          owner_mob_no_1: string
          mob_no_2?: string | null
          building_status: "vacant" | "working"
          vacancy_period?: string | null
          has_shops?: boolean
          latitude?: number | null
          longitude?: number | null
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ward_no?: number
          location?: string
          building_number?: string
          building_owner_name?: string
          owner_mob_no_1?: string
          mob_no_2?: string | null
          building_status?: "vacant" | "working"
          vacancy_period?: string | null
          has_shops?: boolean
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
          shop_licence_no: string
          shop_licensee_name: string
          licensee_contact_no: string
          shop_managing_person: string
          managing_person_contact_no: string
          connected_room: string | null
          ward_number: number
          room_number: string
          location_name: string
          created_at: string
        }
        Insert: {
          id?: string
          building_id: string
          shop_details: string
          shop_licence_no: string
          shop_licensee_name: string
          licensee_contact_no: string
          shop_managing_person: string
          managing_person_contact_no: string
          connected_room?: string | null
          ward_number: number
          room_number: string
          location_name: string
          created_at?: string
        }
        Update: {
          id?: string
          building_id?: string
          shop_details?: string
          shop_licence_no?: string
          shop_licensee_name?: string
          licensee_contact_no?: string
          shop_managing_person?: string
          managing_person_contact_no?: string
          connected_room?: string | null
          ward_number?: number
          room_number?: string
          location_name?: string
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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
