import axios from "axios";

const OTM_KEY = process.env.OPENTRIPMAP_API_KEY;
const OTM_BASE = "https://api.opentripmap.com/0.1/en/places";
const CACHE_TTL_MS = 1000 * 60 * 30;

export interface OpenTripMapPlace {
  xid: string;
  name?: string;
  country?: string;
  kinds?: string;
  description?: string;
  wikipedia?: string;
  wikidata?: string;
  image?: string;
  preview?: {
    source?: string;
    height?: number;
    width?: number;
  };
  wikipedia_extracts?: {
    title?: string;
    text?: string;
    html?: string;
  };
  address?: {
    country?: string;
    state?: string;
    city?: string;
    road?: string;
    suburb?: string;
  };
  point?: {
    lat?: number;
    lon?: number;
  };
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

function requireOpenTripMapKey() {
  if (!OTM_KEY) {
    throw new Error("OPENTRIPMAP_API_KEY is not defined in .env");
  }

  return OTM_KEY;
}

function isRateLimitError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 429;
}

function getAxiosStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

function getCached<T>(cacheKey: string) {
  const entry = memoryCache.get(cacheKey);

  if (!entry) return undefined;

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(cacheKey);
    return undefined;
  }

  return entry.value as T;
}

function setCached<T>(cacheKey: string, value: T) {
  memoryCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

async function cachedGet<T>(
  cacheKey: string,
  url: string,
  params: Record<string, unknown>
): Promise<T> {
  const cached = getCached<T>(cacheKey);

  if (cached !== undefined) {
    return cached;
  }

  const response = await axios.get(url, {
    timeout: 10000,
    params,
  });

  setCached(cacheKey, response.data);

  return response.data as T;
}

function normalizeCountry(value?: string | null) {
  if (!value) return undefined;

  const cleaned = value.trim();

  if (/^[A-Z]{2}$/i.test(cleaned)) {
    try {
      const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
      return displayNames.of(cleaned.toUpperCase()) || cleaned;
    } catch {
      return cleaned;
    }
  }

  return cleaned;
}

export async function fetchDestinationSearch(
  q: string
): Promise<OpenTripMapPlace[]> {
  const apiKey = requireOpenTripMapKey();
  const cleanQuery = q.trim();

  try {
    const geoData = await cachedGet<{
      lat?: number;
      lon?: number;
      country?: string;
      name?: string;
    }>(`geoname:${cleanQuery.toLowerCase()}`, `${OTM_BASE}/geoname`, {
      name: cleanQuery,
      apikey: apiKey,
    });

    if (!geoData?.lat || !geoData?.lon) {
      return [];
    }

    const radiusData = await cachedGet<OpenTripMapPlace[]>(
      `radius:${geoData.lat}:${geoData.lon}:24`,
      `${OTM_BASE}/radius`,
      {
        radius: 20000,
        limit: 24,
        offset: 0,
        lon: geoData.lon,
        lat: geoData.lat,
        rate: 2,
        format: "json",
        apikey: apiKey,
      }
    );

    const countryFallback = normalizeCountry(geoData.country);

    return Array.isArray(radiusData)
      ? radiusData.map((place) => ({
          ...place,
          country:
            normalizeCountry(place.country) ||
            normalizeCountry(place.address?.country) ||
            countryFallback,
        }))
      : [];
  } catch (error) {
    if (isRateLimitError(error)) {
      console.warn("OpenTripMap rate limit reached during search.");
      return [];
    }

    console.warn("OpenTripMap search failed:", {
      query: cleanQuery,
      status: getAxiosStatus(error),
      message: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}

export async function fetchDestinationDetails(
  xid: string
): Promise<OpenTripMapPlace> {
  const apiKey = requireOpenTripMapKey();

  try {
    return await cachedGet<OpenTripMapPlace>(
      `details:${xid}`,
      `${OTM_BASE}/xid/${encodeURIComponent(xid)}`,
      {
        apikey: apiKey,
      }
    );
  } catch (error) {
    if (isRateLimitError(error)) {
      throw new Error(
        "OpenTripMap rate limit reached. Please wait for a minute and try again."
      );
    }

    console.warn("OpenTripMap details fetch failed:", {
      xid,
      status: getAxiosStatus(error),
      message: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}
