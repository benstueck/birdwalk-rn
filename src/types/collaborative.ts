import type { Database } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type WalkCollaborator = Database["public"]["Tables"]["walk_collaborators"]["Row"];
export type WalkInvitation = Database["public"]["Tables"]["walk_invitations"]["Row"];

export interface ProfileWithStats extends Profile {
  total_walks: number;
  total_species: number;
}

export interface CollaboratorWithProfile extends WalkCollaborator {
  profile: Profile;
}

export interface InvitationListItem {
  id: string;
  walk_id: string;
  walk_name: string;
  walk_date: string;
  inviter_id: string;
  inviter_username: string;
  inviter_display_name: string;
  inviter_avatar_id: number;
  message: string | null;
  created_at: string;
  expires_at: string;
}
