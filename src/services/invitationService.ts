import { supabase } from "../lib/supabase";
import type { InvitationListItem } from "../types/collaborative";

export async function sendWalkInvitation(
  walkId: string,
  inviteeId: string,
  message?: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("walk_invitations").insert({
    walk_id: walkId,
    inviter_id: user.id,
    invitee_id: inviteeId,
    message: message ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("This user has already been invited to this walk.");
    }
    throw error;
  }
}

export async function getPendingInvitations(): Promise<InvitationListItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("walk_invitations")
    .select(`
      id,
      walk_id,
      message,
      created_at,
      expires_at,
      walks ( name, date ),
      inviter:profiles!walk_invitations_inviter_id_fkey2 ( id, username, display_name, avatar_id )
    `)
    .eq("invitee_id", user.id)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    walk_id: row.walk_id,
    walk_name: row.walks?.name ?? "Unknown Walk",
    walk_date: row.walks?.date ?? "",
    inviter_id: row.inviter?.id ?? "",
    inviter_username: row.inviter?.username ?? "",
    inviter_display_name: row.inviter?.display_name ?? "",
    inviter_avatar_id: row.inviter?.avatar_id ?? 1,
    message: row.message,
    created_at: row.created_at,
    expires_at: row.expires_at,
  }));
}

export async function acceptInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase.rpc("accept_walk_invitation", {
    invitation_uuid: invitationId,
  });
  if (error) throw error;
}

export async function declineInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase
    .from("walk_invitations")
    .update({ status: "declined", responded_at: new Date().toISOString() })
    .eq("id", invitationId);
  if (error) throw error;
}

export interface SentInvitation {
  id: string;
  invitee_id: string;
  invitee_username: string;
  invitee_display_name: string;
  invitee_avatar_id: number;
}

export async function getSentInvitationsForWalk(walkId: string): Promise<SentInvitation[]> {
  const { data, error } = await supabase
    .from("walk_invitations")
    .select("id, invitee_id, invitee:profiles!walk_invitations_invitee_id_fkey2(username, display_name, avatar_id)")
    .eq("walk_id", walkId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString());

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    invitee_id: row.invitee_id,
    invitee_username: row.invitee?.username ?? "",
    invitee_display_name: row.invitee?.display_name ?? "",
    invitee_avatar_id: row.invitee?.avatar_id ?? 1,
  }));
}

export async function cancelInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase
    .from("walk_invitations")
    .update({ status: "cancelled" })
    .eq("id", invitationId);
  if (error) throw error;
}

export async function getPendingInvitationCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("walk_invitations")
    .select("id", { count: "exact", head: true })
    .eq("invitee_id", user.id)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString());

  if (error) return 0;
  return count ?? 0;
}
