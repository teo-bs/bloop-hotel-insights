// Google Places Save Preview (authenticated Edge Function)
// Saves up to 5 recent Google reviews for a place into the user's account

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function inferSentiment(rating: number) {
  if (rating >= 4) return "positive";
  if (rating <= 2) return "negative";
  return "neutral";
}

function extractTopics(text: string) {
  const t = (text || "").toLowerCase();
  const topics: string[] = [];
  const map = [
    { key: "cleanliness", words: ["clean", "dirty", "smell", "mold"] },
    { key: "staff", words: ["staff", "reception", "host", "manager", "service"] },
    { key: "breakfast", words: ["breakfast", "buffet"] },
    { key: "wifi", words: ["wifi", "wi-fi", "internet"] },
    { key: "room", words: ["room", "suite", "bed", "bathroom"] },
    { key: "location", words: ["location", "close to", "near"] },
    { key: "noise", words: ["noise", "noisy", "loud", "quiet"] },
    { key: "check-in", words: ["check-in", "check in", "reception", "queue"] },
  ];
  for (const m of map) {
    if (m.words.some((w) => t.includes(w))) topics.push(m.key);
  }
  return Array.from(new Set(topics));
}

async function getDetails(placeId: string, key: string) {
  const fields = "name,formatted_address,url,rating,user_ratings_total,reviews,place_id";
  const r = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${key}`
  );
  const json = await r.json();
  if (json.status !== "OK") throw new Error(json.error_message || json.status || "DETAILS_ERROR");
  return json.result;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const GP_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY || !GP_KEY) {
    return new Response(JSON.stringify({ error: "MISSING_CONFIG" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const authHeader = req.headers.get("Authorization") || "";
  const accessToken = authHeader.replace("Bearer ", "");
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Verify user
  const { data: userRes, error: userErr } = await supabase.auth.getUser(accessToken);
  if (userErr || !userRes?.user) {
    return new Response(
      JSON.stringify({ error: "AUTH_REQUIRED", details: "Please sign in to save reviews." }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const user = userRes.user;

  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  const placeId: string | undefined = body?.placeId;
  const url: string | undefined = body?.url;

  if (!placeId && !url) {
    return new Response(JSON.stringify({ error: "BAD_REQUEST", details: "Missing placeId or url" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Resolve placeId if only URL provided by calling the public preview function
  let pid = placeId;
  if (!pid && url) {
    const previewUrl = `${SUPABASE_URL}/functions/v1/google-places-preview?url=${encodeURIComponent(url)}`;
    const prevRes = await fetch(previewUrl);
    const prevJson = await prevRes.json();
    pid = prevJson?.place?.id || prevJson?.place?.place_id || null;
    if (!pid) {
      return new Response(JSON.stringify({ error: "NO_PLACE_ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  // Fetch details directly from Google
  const details = await getDetails(pid as string, GP_KEY);
  const reviews = (details.reviews || []).slice(0, 5);

  // Map to existing reviews schema
  const rows = reviews.map((r: any) => {
    const created = r.time ? new Date(r.time * 1000) : new Date();
    const dateIso = created.toISOString().slice(0, 10);
    return {
      user_id: user.id,
      platform: "google",
      topics: extractTopics(r.text || ""),
      title: null,
      text: r.text || "",
      date: dateIso,
      rating: Number(r.rating || 0),
      sentiment: inferSentiment(Number(r.rating || 0)),
    } as const;
  });

  // Insert
  const { error: insertErr } = await supabase.from("reviews").insert(rows as any);
  if (insertErr) {
    return new Response(JSON.stringify({ error: "DB_ERROR", details: insertErr.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response(
    JSON.stringify({ saved: rows.length, place: { place_id: details.place_id, name: details.name } }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
});
