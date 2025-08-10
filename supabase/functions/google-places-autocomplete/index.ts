import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const key = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!key) {
    return new Response(JSON.stringify({ error: "MISSING_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const input = (url.searchParams.get("input") || "").trim();
    const sessiontoken = (url.searchParams.get("sessiontoken") || "").trim();

    if (!input) {
      return new Response(JSON.stringify({ error: "MISSING_INPUT" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const params = new URLSearchParams({ input, types: "establishment", key });
    if (sessiontoken) params.set("sessiontoken", sessiontoken);

    const r = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
    );
    const j = await r.json();

    if (j.status !== "OK" && j.status !== "ZERO_RESULTS") {
      return new Response(
        JSON.stringify({ error: "AUTOCOMPLETE_FAILED", details: j.status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const suggestions = (j.predictions || []).slice(0, 6).map((p: any) => ({
      description: p.description,
      place_id: p.place_id,
      main_text: p.structured_formatting?.main_text,
      secondary_text: p.structured_formatting?.secondary_text,
    }));

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "SERVER_ERROR", details: (e as any)?.message || String(e) }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
