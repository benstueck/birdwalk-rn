export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      walks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          location_lat: number | null;
          location_lng: number | null;
          date: string;
          start_time: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          location_lat?: number | null;
          location_lng?: number | null;
          date: string;
          start_time: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          location_lat?: number | null;
          location_lng?: number | null;
          date?: string;
          start_time?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      sightings: {
        Row: {
          id: string;
          walk_id: string;
          species_code: string;
          species_name: string;
          scientific_name: string | null;
          location_lat: number | null;
          location_lng: number | null;
          timestamp: string;
          type: "seen" | "heard";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          walk_id: string;
          species_code: string;
          species_name: string;
          scientific_name?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          timestamp?: string;
          type?: "seen" | "heard";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          walk_id?: string;
          species_code?: string;
          species_name?: string;
          scientific_name?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          timestamp?: string;
          type?: "seen" | "heard";
          notes?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Walk = Database["public"]["Tables"]["walks"]["Row"];
export type WalkInsert = Database["public"]["Tables"]["walks"]["Insert"];
export type WalkUpdate = Database["public"]["Tables"]["walks"]["Update"];

export type Sighting = Database["public"]["Tables"]["sightings"]["Row"];
export type SightingInsert = Database["public"]["Tables"]["sightings"]["Insert"];
export type SightingUpdate = Database["public"]["Tables"]["sightings"]["Update"];

export interface LiferSighting {
  id: string;
  timestamp: string;
  walk_id: string;
  walk_name: string;
  walk_date: string;
}

export interface Lifer {
  species_code: string;
  species_name: string;
  scientific_name: string | null;
  most_recent_sighting: string;
  total_sightings: number;
  sightings: LiferSighting[];
}
