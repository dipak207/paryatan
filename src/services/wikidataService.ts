import axios from "axios";

const WIKIDATA_ENTITY_BASE = "https://www.wikidata.org/wiki/Special:EntityData";
const COMMONS_FILE_PATH = "https://commons.wikimedia.org/wiki/Special:FilePath/";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

const WIKI_HEADERS = {
  "User-Agent": "ParyatanTravelPlanner/1.0 (student-project)",
  "Api-User-Agent": "ParyatanTravelPlanner/1.0 (student-project)",
  Accept: "application/json",
};

export interface WikidataSummary {
  label: string | null;
  description: string | null;
  image: string | null;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface WikidataEntityResponse {
  entities?: Record<
    string,
    {
      labels?: Record<string, { value?: string }>;
      descriptions?: Record<string, { value?: string }>;
      claims?: {
        P18?: Array<{
          mainsnak?: {
            datavalue?: {
              value?: string;
            };
          };
        }>;
      };
    }
  >;
}

const wikidataCache = new Map<string, CacheEntry<WikidataSummary | null>>();

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

function cleanQid(value?: string | null) {
  if (!value) return null;

  const match = value.match(/Q\d+/i);
  return match ? match[0].toUpperCase() : null;
}

function commonsImageUrl(filename?: string | null) {
  if (!filename) return null;

  const safeFilename = filename.replaceAll(" ", "_");
  return `${COMMONS_FILE_PATH}${encodeURIComponent(safeFilename)}`;
}

function getAxiosStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export async function fetchWikidataSummary(
  value?: string | null
): Promise<WikidataSummary | null> {
  const qid = cleanQid(value);

  if (!qid) return null;

  const cached = getCached(wikidataCache, qid);

  if (cached !== undefined) {
    return cached;
  }

  try {
    const response = await axios.get<WikidataEntityResponse>(
      `${WIKIDATA_ENTITY_BASE}/${qid}.json`,
      {
        timeout: 10000,
        headers: WIKI_HEADERS,
      }
    );

    const entity = response.data?.entities?.[qid];

    if (!entity) {
      setCached(wikidataCache, qid, null);
      return null;
    }

    const imageFilename =
      entity.claims?.P18?.[0]?.mainsnak?.datavalue?.value || null;

    const result: WikidataSummary = {
      label: entity.labels?.en?.value || null,
      description: entity.descriptions?.en?.value || null,
      image: commonsImageUrl(imageFilename),
    };

    setCached(wikidataCache, qid, result);
    return result;
  } catch (error) {
    console.warn("Wikidata request failed:", {
      qid,
      status: getAxiosStatus(error),
      message: error instanceof Error ? error.message : "Unknown error",
    });

    setCached(wikidataCache, qid, null);
    return null;
  }
}
