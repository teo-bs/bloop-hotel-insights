
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

  const url = new URL(req.url);
  const placeId = url.searchParams.get("placeId");

  if (!placeId) {
    const body = JSON.stringify({ error: "Missing placeId", details: "Provide placeId query parameter." });
    return new Response(body, { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }

  const key = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!key) {
    const body = JSON.stringify({ error: "Missing server key", details: "GOOGLE_PLACES_API_KEY not configured." });
    return new Response(body, { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }

  const fields = "name,formatted_address,url,rating,user_ratings_total,reviews,place_id";
  const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
    placeId
  )}&fields=${encodeURIComponent(fields)}&key=${encodeURIComponent(key)}`;

  console.log("[google-places-preview] Fetching details", { placeId });

  const upstream = await fetch(apiUrl);
  const json = await upstream.json();

  if (!upstream.ok) {
    const body = JSON.stringify({
      error: "Upstream HTTP error",
      details: { status: upstream.status, statusText: upstream.statusText, data: json },
    });
    return new Response(body, { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }

  if (json.status !== "OK") {
    const body = JSON.stringify({
      error: "Google Places API error",
      details: { status: json.status, message: json.error_message ?? "Unknown error", data: json },
    });
    return new Response(body, { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
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

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
  });
});
