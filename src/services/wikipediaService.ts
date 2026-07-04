import axios from "axios";

const WIKI_REST_SUMMARY =
  process.env.WIKIPEDIA_REST_SUMMARY_URL ||
  "https://en.wikipedia.org/api/rest_v1/page/summary";

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

const WIKI_HEADERS = {
  "User-Agent": "ParyatanTravelPlanner/1.0 (student-project)",
  "Api-User-Agent": "ParyatanTravelPlanner/1.0 (student-project)",
  Accept: "application/json",
};

export interface WikipediaSummary {
  title: string | null;
  description: string | null;
  extract: string | null;
  image: string | null;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface WikipediaSummaryResponse {
  title?: string;
  description?: string;
  extract?: string;
  thumbnail?: {
    source?: string;
  };
  originalimage?: {
    source?: string;
  };
}

const summaryCache = new Map<string, CacheEntry<WikipediaSummary | null>>();

function getCached<T>(cache: Map<string, CacheEntry<T>>, key: string) {
  const entry = cache.get(key);

  if (!entry) return undefined;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }

  return entry.value;
}

function setCached<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function cleanWikipediaTitle(title?: string | null) {
  if (!title) return null;

  const cleaned = title
    .replace("https://en.wikipedia.org/wiki/", "")
    .replace("http://en.wikipedia.org/wiki/", "")
    .replaceAll("_", " ")
    .trim();

  if (!cleaned) return null;

  /**
   * Reject non-English wiki-prefix style titles:
   * nl:Mount Amuyao
   * ru:Храм...
   */
  if (/^[a-z]{2,3}:/i.test(cleaned)) {
    const prefix = cleaned.split(":")[0].toLowerCase();

    if (prefix !== "en") {
      return null;
    }

    return cleaned.replace(/^en:/i, "").trim() || null;
  }

  return cleaned;
}

function containsNonEnglishScript(value?: string | null) {
  if (!value) return false;

  return /[\u0400-\u04FF\u0500-\u052F\u0600-\u06FF\u0750-\u077F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0900-\u097F]/.test(
    value
  );
}

function isSafeEnglishTitle(title?: string | null) {
  const cleaned = cleanWikipediaTitle(title);

  if (!cleaned) return false;
  if (containsNonEnglishScript(cleaned)) return false;

  return /[A-Za-z]{2,}/.test(cleaned);
}

export async function fetchWikipediaSummaryWithTitle(
  pageTitle?: string | null
): Promise<WikipediaSummary | null> {
  const cleanTitle = cleanWikipediaTitle(pageTitle);

  if (!cleanTitle || !isSafeEnglishTitle(cleanTitle)) {
    return null;
  }

  const cacheKey = cleanTitle.toLowerCase();
  const cached = getCached(summaryCache, cacheKey);

  if (cached !== undefined) {
    return cached;
  }

  try {
    const response = await axios.get<WikipediaSummaryResponse>(
      `${WIKI_REST_SUMMARY}/${encodeURIComponent(cleanTitle)}`,
      {
        timeout: 8000,
        headers: WIKI_HEADERS,
      }
    );

    const result: WikipediaSummary = {
      title: response.data?.title || cleanTitle,
      description: response.data?.description || null,
      extract: response.data?.extract || null,
      image:
        response.data?.thumbnail?.source ||
        response.data?.originalimage?.source ||
        null,
    };

    setCached(summaryCache, cacheKey, result);
    return result;
  } catch {
    /**
     * Silent fallback.
     * We do not want 404/504/429 Wikipedia messages filling the terminal.
     */
    setCached(summaryCache, cacheKey, null);
    return null;
  }
}

export async function fetchWikipediaImageWithTitle(
  pageTitle?: string | null
): Promise<{ title: string | null; image: string | null }> {
  const summary = await fetchWikipediaSummaryWithTitle(pageTitle);

  return {
    title: summary?.title || null,
    image: summary?.image || null,
  };
}

export async function fetchWikipediaImage(
  pageTitle: string
): Promise<string | null> {
  const summary = await fetchWikipediaSummaryWithTitle(pageTitle);
  return summary?.image || null;
}
