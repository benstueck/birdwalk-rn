#!/usr/bin/env node
// Run: node supabase/scripts/send_test_invitation.js
// Reads SUPABASE_SERVICE_ROLE_KEY from .env in project root

const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "../../.env");
const envVars = fs.readFileSync(envPath, "utf8")
  .split("\n")
  .reduce((acc, line) => {
    const [k, ...v] = line.split("=");
    if (k && v.length) acc[k.trim()] = v.join("=").trim();
    return acc;
  }, {});

const SUPABASE_URL = envVars.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("Add SUPABASE_SERVICE_ROLE_KEY to .env (Supabase dashboard → Project Settings → API)");
  process.exit(1);
}

const INVITER_ID = "c2588d03-194f-4c90-9e0a-b292ca15de2c"; // user 2 (walk owner)
const INVITEE_ID = "79057491-ef51-4460-8c8b-9577d0728e2e"; // user 1 (receives invite)
const WALK_ID    = "3765cca9-074a-47f4-96d0-82685517b62b";

async function main() {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const res = await fetch(`${SUPABASE_URL}/rest/v1/walk_invitations`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      walk_id: WALK_ID,
      inviter_id: INVITER_ID,
      invitee_id: INVITEE_ID,
      message: "Hey, join me on this walk!",
      status: "pending",
      expires_at: expiresAt,
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    console.error("Error:", JSON.stringify(body, null, 2));
    process.exit(1);
  }

  console.log("Invitation created:", JSON.stringify(body, null, 2));
}

main().catch(console.error);
