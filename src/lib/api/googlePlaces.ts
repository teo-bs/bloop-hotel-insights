
/**
 * Simple helper to call the public Edge Function for Google Places preview.
 * This uses a GET request to the full Supabase Functions URL.
 */
const FUNCTION_URL = "https://hewcaikalseorcmmjark.supabase.co/functions/v1/google-places-preview";
const AUTOCOMPLETE_FUNCTION_URL = "https://hewcaikalseorcmmjark.supabase.co/functions/v1/google-places-autocomplete";

export async function getPlacesPreview(placeId: string) {
  if (!placeId) throw new Error("placeId is required");
  const url = `${FUNCTION_URL}?placeId=${encodeURIComponent(placeId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Note: Function is public (verify_jwt=false), no Authorization header required.
    },
  });

  if (!res.ok) {
    // Try to surface upstream error details
    let details: any = undefined;
    try {
      details = await res.json();
    } catch {
      // ignore
    }
    throw new Error(details?.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export async function getPlaceSuggestions(input: string, sessiontoken?: string) {
  if (!input?.trim()) return [] as any[];
  const url = new URL(AUTOCOMPLETE_FUNCTION_URL);
  url.searchParams.set("input", input.trim());
  if (sessiontoken) url.searchParams.set("sessiontoken", sessiontoken);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.details || json?.error || `Autocomplete failed (${res.status})`);
  }
  return json?.suggestions || [];
}
