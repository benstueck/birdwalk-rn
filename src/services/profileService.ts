import { supabase } from "../lib/supabase";
import type { Profile, ProfileInsert, ProfileUpdate, ProfileWithStats } from "../types/collaborative";

export async function createProfile(profile: ProfileInsert): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .insert(profile)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  let query = supabase
    .from("profiles")
    .select("id")
    .ilike("username", username);
  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data === null;
}

export async function searchUsers(query: string, limit = 20): Promise<ProfileWithStats[]> {
  const { data, error } = await supabase.rpc("search_users_with_stats", {
    search_query: query,
    limit_count: limit,
  });
  if (error) throw error;
  return (data ?? []) as ProfileWithStats[];
}
