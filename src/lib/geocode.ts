/**
 * City lookup via Open-Meteo's geocoding API — free, no key, and it returns
 * the IANA timezone alongside the coordinates, which is exactly what the sky
 * calculation needs to resolve a local birth time correctly.
 */

export type Place = {
  id: number;
  name: string;
  /** state or province, where the API knows one */
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  /** IANA timezone, e.g. "Asia/Kolkata" */
  timezone: string;
  population?: number;
};

type ApiResult = {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
};

const ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

/** Human-readable "Pune, Maharashtra, India". */
export function placeLabel(p: Place): string {
  return [p.name, p.region, p.country].filter(Boolean).join(", ");
}

export async function searchPlaces(
  query: string,
  signal?: AbortSignal
): Promise<Place[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `${ENDPOINT}?name=${encodeURIComponent(
    trimmed
  )}&count=8&language=en&format=json`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Place search failed: ${res.status}`);

  const data = (await res.json()) as { results?: ApiResult[] };
  return (data.results ?? [])
    .filter((r) => r.timezone && r.country)
    .map((r) => ({
      id: r.id,
      name: r.name,
      region: r.admin1,
      country: r.country as string,
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
      population: r.population,
    }));
}
