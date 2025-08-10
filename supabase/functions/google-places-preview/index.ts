
/**
 * Google Places Preview (public Edge Function)
 *
 * Important:
 * - This function uses the server-side GOOGLE_PLACES_API_KEY and must remain secret.
 * - The browser-safe key (e.g., for Maps JS SDK) is different and can be exposed publicly.
 *
 * Endpoint:
 *   GET /functions/v1/google-places-preview?placeId=...
 * Query:
 *   placeId (required)
 * Returns:
 *   {
 *     place: { id, name, address, url, rating, totalReviews },
 *     reviews: [{ author_name, profile_photo_url, rating, relative_time_description, text }]
 *   }
 * Errors:
 *   400 with { error, details } when validation or the upstream API fails
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Helpers
  // Helpers
  function extractPlaceIdFromUrl(u: string): string | null {
    try {
      const url = decodeURIComponent(u);
      // 1) q=place_id:ChIJ... or place_id=ChIJ...
      const m1 = url.match(/(?:[?&]q=|[?&]place_id=|place_id[:=])([A-Za-z0-9_-]{10,})/i);
      if (m1) return m1[1];
      // 2) Long maps URLs often contain ...!1s<PLACE_ID>! or end
      const m2 = url.match(/!1s([A-Za-z0-9_-]{10,})(?:!|$)/);
      if (m2) return m2[1];
      // 3) Some blobs use !2s<PLACE_ID>
      const m3 = url.match(/!2s([A-Za-z0-9_-]{10,})(?:!|$)/);
      if (m3) return m3[1];
      // 4) place_id parameter directly
      const uobj = new URL(url);
      const pid = uobj.searchParams.get("place_id");
      if (pid) return pid;
      return null;
    } catch {
      return null;
    }
  }

  function extractNameAndCoords(urlStr: string) {
    try {
      const u = decodeURIComponent(urlStr);
      // Name is usually between /place/ and /@
      const nameMatch = u.match(/\/maps\/place\/([^/]+)\//);
      const name = nameMatch ? nameMatch[1].replace(/\+/g, " ") : undefined;
      // Coords after @lat,lng
      const at = u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      const lat = at ? parseFloat(at[1]) : undefined;
      const lng = at ? parseFloat(at[2]) : undefined;
      return { name, lat, lng } as { name?: string; lat?: number; lng?: number };
    } catch {
      return {} as { name?: string; lat?: number; lng?: number };
    }
  }

  async function expandIfShort(u: string): Promise<string> {
    try {
      const r = await fetch(u, { redirect: "follow" });
      return (r as Response).url || u;
    } catch {
      return u;
    }
  }

  async function findPlaceIdByText(input: string, key: string, lat?: number, lng?: number): Promise<string | null> {
    try {
      const endpoint = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json";
      const qs = new URLSearchParams({
        input,
        inputtype: "textquery",
        fields: "place_id",
        key,
      });
      if (lat != null && lng != null) {
        qs.set("locationbias", `point:${lat},${lng}`);
      }
      const resp = await fetch(`${endpoint}?${qs.toString()}`);
      const json = await resp.json();
      if (json.status === "OK" && json.candidates?.[0]?.place_id) {
        return json.candidates[0].place_id as string;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function textSearchAsLastResort(query: string, key: string, lat?: number, lng?: number): Promise<string | null> {
    try {
      const endpoint = "https://maps.googleapis.com/maps/api/place/textsearch/json";
      const qs = new URLSearchParams({ query, key });
      if (lat != null && lng != null) {
        qs.set("location", `${lat},${lng}`);
        qs.set("radius", "1000");
      }
      const resp = await fetch(`${endpoint}?${qs.toString()}`);
      const json = await resp.json();
      if (json.status === "OK" && json.results?.[0]?.place_id) {
        return json.results[0].place_id as string;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function getDetails(placeId: string, key: string) {
    const fields = "name,formatted_address,url,rating,user_ratings_total,reviews,place_id";
    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=${encodeURIComponent(fields)}&key=${encodeURIComponent(key)}`;

    const upstream = await fetch(apiUrl);
    const json = await upstream.json();

    if (!upstream.ok) {
      return {
        ok: false,
        status: upstream.status,
        error: "Upstream HTTP error",
        details: { status: upstream.status, statusText: upstream.statusText, data: json },
      } as const;
    }

    if (json.status !== "OK") {
      return {
        ok: false,
        status: 400,
        error: "Google Places API error",
        details: { status: json.status, message: json.error_message ?? "Unknown error", data: json },
      } as const;
    }

    const result = json.result ?? {};
    const reviews = Array.isArray(result.reviews) ? result.reviews : [];

    const payload = {
      place: {
        id: result.place_id ?? null,
        name: result.name ?? null,
        address: result.formatted_address ?? null,
        url: result.url ?? null,
        rating: typeof result.rating === "number" ? result.rating : null,
        totalReviews: typeof result.user_ratings_total === "number" ? result.user_ratings_total : 0,
      },
      reviews: reviews.slice(0, 5).map((r: any) => ({
        author_name: r.author_name ?? null,
        profile_photo_url: r.profile_photo_url ?? null,
        rating: r.rating ?? null,
        relative_time_description: r.relative_time_description ?? null,
        text: r.text ?? "",
      })),
    };

    return { ok: true, payload } as const;
  }

  const url = new URL(req.url);
  const rawPlaceId = url.searchParams.get("placeId");
  const rawUrl = url.searchParams.get("url");

  const key = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!key) {
    const body = JSON.stringify({ error: "Missing server key", details: "GOOGLE_PLACES_API_KEY not configured." });
    return new Response(body, { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }

  let placeId = rawPlaceId || null;

  if (!placeId && rawUrl) {
    console.log("[google-places-preview] Expanding URL", { rawUrl });
    const expanded = await expandIfShort(rawUrl);
    placeId = extractPlaceIdFromUrl(expanded);
    if (!placeId) {
      const { name, lat, lng } = extractNameAndCoords(expanded);
      console.log("[google-places-preview] No PID in URL, attempting text-based lookup", { name, lat, lng });
      if (name) {
        placeId = await findPlaceIdByText(name, key, lat, lng);
        if (!placeId) {
          placeId = await textSearchAsLastResort(name, key, lat, lng);
        }
      }
      if (!placeId) {
        console.log("[google-places-preview] Last attempt: find by expanded URL as text");
        placeId = await findPlaceIdByText(expanded, key);
      }
    }
  }

  if (!placeId) {
    const body = JSON.stringify({ error: "NO_PLACE_ID", details: "Could not resolve Place ID." });
    return new Response(body, { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }

  console.log("[google-places-preview] Fetching details", { placeId });
  const details = await getDetails(placeId, key);
  if (!details.ok) {
    const body = JSON.stringify({ error: details.error, details: details.details });
    return new Response(body, { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }

  return new Response(JSON.stringify(details.payload), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
  });
});
