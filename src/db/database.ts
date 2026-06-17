import * as SQLite from "expo-sqlite";

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync("birdwalk.db");
  await migrate(_db);
  return _db;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS walks (
      id TEXT PRIMARY KEY,
      server_id TEXT,
      name TEXT NOT NULL,
      location_lat REAL,
      location_lng REAL,
      date TEXT,
      start_time TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      is_collaborative INTEGER NOT NULL DEFAULT 0,
      synced_at TEXT,
      is_dirty INTEGER NOT NULL DEFAULT 0,
      deleted_locally INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sightings (
      id TEXT PRIMARY KEY,
      server_id TEXT,
      walk_id TEXT NOT NULL,
      walk_server_id TEXT,
      species_code TEXT NOT NULL,
      species_name TEXT NOT NULL,
      scientific_name TEXT,
      location_lat REAL,
      location_lng REAL,
      timestamp TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'seen',
      notes TEXT,
      created_at TEXT NOT NULL,
      created_by TEXT,
      synced_at TEXT,
      is_dirty INTEGER NOT NULL DEFAULT 0,
      deleted_locally INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS walk_collaborators (
      walk_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'contributor',
      PRIMARY KEY (walk_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      username TEXT,
      display_name TEXT,
      bio TEXT,
      avatar_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS bird_packs (
      region_code TEXT PRIMARY KEY,
      region_name TEXT NOT NULL,
      species_count INTEGER NOT NULL DEFAULT 0,
      downloaded_at TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS bird_pack_species (
      pack_region_code TEXT NOT NULL,
      species_code TEXT NOT NULL,
      species_name TEXT NOT NULL,
      scientific_name TEXT,
      image_url TEXT,
      local_image_path TEXT,
      image_cached INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (pack_region_code, species_code)
    );
  `);
}

// ─── Walks ────────────────────────────────────────────────────────────────────

export type LocalWalk = {
  id: string;
  server_id: string | null;
  name: string;
  location_lat: number | null;
  location_lng: number | null;
  date: string | null;
  start_time: string | null;
  notes: string | null;
  created_at: string;
  is_collaborative: boolean;
  synced_at: string | null;
  is_dirty: boolean;
  deleted_locally: boolean;
};

export async function getLocalWalks(userId: string): Promise<LocalWalk[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`
    SELECT w.* FROM walks w
    INNER JOIN walk_collaborators wc ON wc.walk_id = w.server_id
    WHERE wc.user_id = ? AND w.deleted_locally = 0
    ORDER BY w.created_at DESC
  `, [userId]);
  return rows.map(rowToWalk);
}

export async function getLocalWalk(id: string): Promise<LocalWalk | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    `SELECT * FROM walks WHERE id = ? OR server_id = ?`,
    [id, id]
  );
  return row ? rowToWalk(row) : null;
}

export async function insertLocalWalk(walk: Omit<LocalWalk, "is_dirty" | "deleted_locally"> & { is_dirty?: boolean }): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`
    INSERT OR REPLACE INTO walks
      (id, server_id, name, location_lat, location_lng, date, start_time, notes, created_at, is_collaborative, synced_at, is_dirty, deleted_locally)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `, [
    walk.id, walk.server_id, walk.name, walk.location_lat ?? null,
    walk.location_lng ?? null, walk.date ?? null, walk.start_time ?? null,
    walk.notes ?? null, walk.created_at, walk.is_collaborative ? 1 : 0,
    walk.synced_at ?? null, walk.is_dirty ? 1 : 0,
  ]);
}

export async function updateLocalWalk(id: string, fields: Partial<Pick<LocalWalk, "name" | "notes" | "synced_at" | "server_id" | "is_dirty" | "deleted_locally">>): Promise<void> {
  const db = await getDatabase();
  const sets: string[] = [];
  const values: any[] = [];
  if (fields.name !== undefined) { sets.push("name = ?"); values.push(fields.name); }
  if (fields.notes !== undefined) { sets.push("notes = ?"); values.push(fields.notes); }
  if (fields.synced_at !== undefined) { sets.push("synced_at = ?"); values.push(fields.synced_at); }
  if (fields.server_id !== undefined) { sets.push("server_id = ?"); values.push(fields.server_id); }
  if (fields.is_dirty !== undefined) { sets.push("is_dirty = ?"); values.push(fields.is_dirty ? 1 : 0); }
  if (fields.deleted_locally !== undefined) { sets.push("deleted_locally = ?"); values.push(fields.deleted_locally ? 1 : 0); }
  if (sets.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE walks SET ${sets.join(", ")} WHERE id = ? OR server_id = ?`, [...values, id]);
}

function rowToWalk(row: any): LocalWalk {
  return {
    ...row,
    is_collaborative: !!row.is_collaborative,
    is_dirty: !!row.is_dirty,
    deleted_locally: !!row.deleted_locally,
  };
}

// ─── Sightings ────────────────────────────────────────────────────────────────

export type LocalSighting = {
  id: string;
  server_id: string | null;
  walk_id: string;
  walk_server_id: string | null;
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
  synced_at: string | null;
  is_dirty: boolean;
  deleted_locally: boolean;
};

export async function getLocalSightings(walkId: string): Promise<LocalSighting[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`
    SELECT * FROM sightings
    WHERE (walk_id = ? OR walk_server_id = ?) AND deleted_locally = 0
    ORDER BY timestamp DESC
  `, [walkId, walkId]);
  return rows.map(rowToSighting);
}

export async function insertLocalSighting(s: Omit<LocalSighting, "is_dirty" | "deleted_locally"> & { is_dirty?: boolean }): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`
    INSERT OR REPLACE INTO sightings
      (id, server_id, walk_id, walk_server_id, species_code, species_name, scientific_name,
       location_lat, location_lng, timestamp, type, notes, created_at, created_by, synced_at, is_dirty, deleted_locally)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `, [
    s.id, s.server_id, s.walk_id, s.walk_server_id, s.species_code, s.species_name,
    s.scientific_name ?? null, s.location_lat ?? null, s.location_lng ?? null,
    s.timestamp, s.type, s.notes ?? null, s.created_at, s.created_by ?? null,
    s.synced_at ?? null, s.is_dirty ? 1 : 0,
  ]);
}

export async function updateLocalSighting(id: string, fields: Partial<Pick<LocalSighting, "species_code" | "species_name" | "scientific_name" | "type" | "notes" | "server_id" | "synced_at" | "is_dirty" | "deleted_locally">>): Promise<void> {
  const db = await getDatabase();
  const sets: string[] = [];
  const values: any[] = [];
  if (fields.species_code !== undefined) { sets.push("species_code = ?"); values.push(fields.species_code); }
  if (fields.species_name !== undefined) { sets.push("species_name = ?"); values.push(fields.species_name); }
  if (fields.scientific_name !== undefined) { sets.push("scientific_name = ?"); values.push(fields.scientific_name); }
  if (fields.type !== undefined) { sets.push("type = ?"); values.push(fields.type); }
  if (fields.notes !== undefined) { sets.push("notes = ?"); values.push(fields.notes); }
  if (fields.server_id !== undefined) { sets.push("server_id = ?"); values.push(fields.server_id); }
  if (fields.synced_at !== undefined) { sets.push("synced_at = ?"); values.push(fields.synced_at); }
  if (fields.is_dirty !== undefined) { sets.push("is_dirty = ?"); values.push(fields.is_dirty ? 1 : 0); }
  if (fields.deleted_locally !== undefined) { sets.push("deleted_locally = ?"); values.push(fields.deleted_locally ? 1 : 0); }
  if (sets.length === 0) return;
  values.push(id, id);
  await db.runAsync(`UPDATE sightings SET ${sets.join(", ")} WHERE id = ? OR server_id = ?`, values);
}

function rowToSighting(row: any): LocalSighting {
  return {
    ...row,
    is_dirty: !!row.is_dirty,
    deleted_locally: !!row.deleted_locally,
  };
}

// ─── Walk Collaborators ───────────────────────────────────────────────────────

export async function replaceLocalCollaborators(walkServerId: string, collaborators: { user_id: string; role: string }[]): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM walk_collaborators WHERE walk_id = ?`, [walkServerId]);
  for (const c of collaborators) {
    await db.runAsync(
      `INSERT INTO walk_collaborators (walk_id, user_id, role) VALUES (?, ?, ?)`,
      [walkServerId, c.user_id, c.role]
    );
  }
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

export async function upsertLocalProfile(p: { id: string; username: string | null; display_name: string | null; bio: string | null; avatar_id: number | null }): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO profiles (id, username, display_name, bio, avatar_id) VALUES (?, ?, ?, ?, ?)`,
    [p.id, p.username ?? null, p.display_name ?? null, p.bio ?? null, p.avatar_id ?? null]
  );
}

// ─── Bird Packs ───────────────────────────────────────────────────────────────

export type LocalBirdPack = {
  region_code: string;
  region_name: string;
  species_count: number;
  downloaded_at: string;
  is_active: boolean;
};

export async function getLocalBirdPacks(): Promise<LocalBirdPack[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`SELECT * FROM bird_packs`);
  return rows.map((r) => ({ ...r, is_active: !!r.is_active }));
}

export async function upsertBirdPack(pack: LocalBirdPack): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO bird_packs (region_code, region_name, species_count, downloaded_at, is_active) VALUES (?, ?, ?, ?, ?)`,
    [pack.region_code, pack.region_name, pack.species_count, pack.downloaded_at, pack.is_active ? 1 : 0]
  );
}

export async function deleteLocalBirdPack(regionCode: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM bird_packs WHERE region_code = ?`, [regionCode]);
  await db.runAsync(`DELETE FROM bird_pack_species WHERE pack_region_code = ?`, [regionCode]);
}

// ─── Bird Pack Species ────────────────────────────────────────────────────────

export type LocalBirdPackSpecies = {
  pack_region_code: string;
  species_code: string;
  species_name: string;
  scientific_name: string | null;
  image_url: string | null;
  local_image_path: string | null;
  image_cached: boolean;
};

export async function searchLocalSpecies(regionCode: string, query: string): Promise<LocalBirdPackSpecies[]> {
  const db = await getDatabase();
  const like = `%${query}%`;
  const rows = await db.getAllAsync<any>(`
    SELECT * FROM bird_pack_species
    WHERE pack_region_code = ? AND (species_name LIKE ? OR scientific_name LIKE ?)
    LIMIT 20
  `, [regionCode, like, like]);
  return rows.map((r) => ({ ...r, image_cached: !!r.image_cached }));
}

export async function insertBirdPackSpeciesBatch(species: LocalBirdPackSpecies[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const s of species) {
      await db.runAsync(`
        INSERT OR REPLACE INTO bird_pack_species
          (pack_region_code, species_code, species_name, scientific_name, image_url, local_image_path, image_cached)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [s.pack_region_code, s.species_code, s.species_name, s.scientific_name ?? null,
          s.image_url ?? null, s.local_image_path ?? null, s.image_cached ? 1 : 0]);
    }
  });
}

export async function updateSpeciesImagePath(regionCode: string, speciesCode: string, localPath: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE bird_pack_species SET local_image_path = ?, image_cached = 1 WHERE pack_region_code = ? AND species_code = ?`,
    [localPath, regionCode, speciesCode]
  );
}

export async function getDirtyWalks(): Promise<LocalWalk[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`SELECT * FROM walks WHERE is_dirty = 1`);
  return rows.map(rowToWalk);
}

export async function getDirtySightings(): Promise<LocalSighting[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(`SELECT * FROM sightings WHERE is_dirty = 1`);
  return rows.map(rowToSighting);
}
