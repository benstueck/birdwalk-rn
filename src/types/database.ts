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
        Relationships: [];
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
          created_by: string | null;
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
          created_by?: string | null;
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
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sightings_walk_id_fkey";
            columns: ["walk_id"];
            referencedRelation: "walks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sightings_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          bio: string | null;
          avatar_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          bio?: string | null;
          avatar_id?: number;  // defaults to 1
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          bio?: string | null;
          avatar_id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      walk_collaborators: {
        Row: {
          id: string;
          walk_id: string;
          user_id: string;
          role: "owner" | "contributor";
          joined_at: string;
        };
        Insert: {
          id?: string;
          walk_id: string;
          user_id: string;
          role?: "owner" | "contributor";
          joined_at?: string;
        };
        Update: {
          id?: string;
          walk_id?: string;
          user_id?: string;
          role?: "owner" | "contributor";
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "walk_collaborators_walk_id_fkey";
            columns: ["walk_id"];
            referencedRelation: "walks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "walk_collaborators_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      walk_invitations: {
        Row: {
          id: string;
          walk_id: string;
          inviter_id: string;
          invitee_id: string;
          message: string | null;
          status: "pending" | "accepted" | "declined" | "cancelled";
          created_at: string;
          expires_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          walk_id: string;
          inviter_id: string;
          invitee_id: string;
          message?: string | null;
          status?: "pending" | "accepted" | "declined" | "cancelled";
          created_at?: string;
          expires_at?: string;
          responded_at?: string | null;
        };
        Update: {
          id?: string;
          walk_id?: string;
          inviter_id?: string;
          invitee_id?: string;
          message?: string | null;
          status?: "pending" | "accepted" | "declined" | "cancelled";
          created_at?: string;
          expires_at?: string;
          responded_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "walk_invitations_walk_id_fkey";
            columns: ["walk_id"];
            referencedRelation: "walks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "walk_invitations_inviter_id_fkey";
            columns: ["inviter_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "walk_invitations_invitee_id_fkey";
            columns: ["invitee_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_walk_invitation: {
        Args: { invitation_uuid: string };
        Returns: void;
      };
      search_users_with_stats: {
        Args: { search_query: string; limit_count?: number };
        Returns: Array<{
          id: string;
          username: string;
          display_name: string;
          bio: string | null;
          avatar_id: number;
          created_at: string;
          updated_at: string;
          total_walks: number;
          total_species: number;
        }>;
      };
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
