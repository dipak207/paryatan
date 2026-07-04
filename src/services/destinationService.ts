import {
  fetchDestinationDetails,
  fetchDestinationSearch,
  type OpenTripMapPlace,
} from "@/services/openTripMapService";
import { fetchWikidataSummary } from "@/services/wikidataService";
import { fetchWikipediaImageWithTitle } from "@/services/wikipediaService";
import { fetchWeather } from "@/services/weatherService";

const SEARCH_RESULT_LIMIT = 9;
const SEARCH_CANDIDATE_LIMIT = 18;
const DETAIL_FETCH_CONCURRENCY = 1;
const SEARCH_DETAILS_LIMIT = 5;
const WIKIPEDIA_IMAGE_FALLBACK_LIMIT = 7;
const DETAILS_COOLDOWN_MS = 75_000;
const FALLBACK_DESTINATION_IMAGE = "/images/destination-placeholder.jpg";

let skipSearchDetailsUntil = 0;

interface ExternalImageData {
  wikidataLabel?: string | null;
  wikidataDescription?: string | null;
  wikidataImage?: string | null;
  wikipediaImage?: string | null;
}

interface EnrichedSearchDestination {
  xid: string;
  name: string;
  country: string;
  description: null;
  image: string;
}

function cleanText(value?: string | null) {
  if (!value) return null;

  const cleaned = value
    .replace(/<[^>]*>/g, "")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || null;
}

function containsNonEnglishScript(value?: string | null) {
  const text = cleanText(value);

  if (!text) return false;

  return /[\u0400-\u04FF\u0500-\u052F\u0600-\u06FF\u0750-\u077F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0900-\u097F]/.test(
    text
  );
}

function isEnglishLikeName(value?: string | null) {
  const text = cleanText(value);

  if (!text) return false;
  if (containsNonEnglishScript(text)) return false;

  return /[A-Za-z]{2,}/.test(text);
}

function isEnglishLikeText(value?: string | null) {
  const text = cleanText(value);

  if (!text) return false;
  if (containsNonEnglishScript(text)) return false;

  const words = text.match(/[A-Za-z]{2,}/g) || [];
  return words.length >= 3;
}

function isValidImageUrl(value?: string | null) {
  return Boolean(
    value &&
      typeof value === "string" &&
      (value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("/"))
  );
}

function looksLikeKinds(value?: string | null) {
  const text = cleanText(value)?.toLowerCase();

  if (!text) return false;

  return (
    text === "other" ||
    text.includes("unclassified objects") ||
    text.includes("unclassified_objects") ||
    text.includes("interesting places") ||
    text.includes("interesting_places")
  );
}

function isUsefulName(value?: string | null) {
  const text = cleanText(value);

  if (!text) return false;

  const normalized = text.toLowerCase();

  return (
    isEnglishLikeName(text) &&
    normalized !== "unknown" &&
    normalized !== "unknown destination" &&
    normalized !== "undefined" &&
    normalized !== "destination" &&
    normalized !== "other" &&
    !looksLikeKinds(text)
  );
}

function normalizeKind(kind: string) {
  return kind.replaceAll("_", " ").trim();
}

function isGenericKind(kind?: string | null) {
  const normalized = cleanText(kind)?.toLowerCase();

  return (
    !normalized ||
    normalized === "other" ||
    normalized === "interesting places" ||
    normalized === "interesting place" ||
    normalized === "unclassified objects" ||
    normalized === "unclassified object"
  );
}

function getUsefulKinds(kinds?: string | null) {
  if (!kinds) return [];

  const seen = new Set<string>();

  return kinds
    .split(",")
    .map(normalizeKind)
    .filter((kind) => !isGenericKind(kind))
    .filter((kind) => {
      const key = kind.toLowerCase();

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    })
    .slice(0, 4);
}

function getCountry(place: OpenTripMapPlace, fallback?: OpenTripMapPlace) {
  return (
    cleanText(place.address?.country) ||
    cleanText(place.country) ||
    cleanText(fallback?.address?.country) ||
    cleanText(fallback?.country) ||
    cleanText(place.address?.state) ||
    cleanText(place.address?.city) ||
    cleanText(fallback?.address?.state) ||
    cleanText(fallback?.address?.city) ||
    "Location unavailable"
  );
}

function getOpenTripMapImage(
  place: OpenTripMapPlace,
  fallback?: OpenTripMapPlace
) {
  const candidates = [
    place.preview?.source,
    place.image,
    fallback?.preview?.source,
    fallback?.image,
  ];

  return candidates.find(isValidImageUrl) || null;
}

function getBestImage(
  place: OpenTripMapPlace,
  fallback?: OpenTripMapPlace,
  external?: ExternalImageData
) {
  const candidates = [
    getOpenTripMapImage(place, fallback),
    external?.wikidataImage,
    external?.wikipediaImage,
  ];

  return candidates.find(isValidImageUrl) || FALLBACK_DESTINATION_IMAGE;
}

function getName(
  place: OpenTripMapPlace,
  fallback?: OpenTripMapPlace,
  external?: ExternalImageData
) {
  const candidates = [
    cleanText(place.name),
    cleanText(fallback?.name),
    cleanText(place.wikipedia_extracts?.title),
    cleanText(fallback?.wikipedia_extracts?.title),
    cleanText(external?.wikidataLabel),
  ];

  return candidates.find(isUsefulName) || "Destination";
}

function getSafeWikipediaTitleFromPlace(place: OpenTripMapPlace) {
  const name = cleanText(place.name);

  if (isUsefulName(name)) {
    return name;
  }

  const extractTitle = cleanText(place.wikipedia_extracts?.title);

  if (isUsefulName(extractTitle)) {
    return extractTitle;
  }

  if (place.wikipedia && place.wikipedia.includes("en.wikipedia.org/wiki/")) {
    const rawTitle = place.wikipedia.split("/wiki/")[1];

    if (!rawTitle) return null;

    try {
      const decoded = decodeURIComponent(rawTitle.replaceAll("_", " "));
      return isUsefulName(decoded) ? decoded : null;
    } catch {
      const fallbackTitle = rawTitle.replaceAll("_", " ");
      return isUsefulName(fallbackTitle) ? fallbackTitle : null;
    }
  }

  return null;
}

async function getExternalImageDataForPlace(
  place: OpenTripMapPlace,
  options?: {
    allowWikipediaImage?: boolean;
  }
): Promise<ExternalImageData> {
  const wikidataPromise = place.wikidata
    ? fetchWikidataSummary(place.wikidata)
    : Promise.resolve(null);

  const wikipediaTitle = options?.allowWikipediaImage
    ? getSafeWikipediaTitleFromPlace(place)
    : null;

  const wikipediaPromise = wikipediaTitle
    ? fetchWikipediaImageWithTitle(wikipediaTitle)
    : Promise.resolve({ title: null, image: null });

  const [wikidataData, wikipediaData] = await Promise.all([
    wikidataPromise,
    wikipediaPromise,
  ]);

  return {
    wikidataLabel: isUsefulName(wikidataData?.label)
      ? wikidataData?.label || null
      : null,
    wikidataDescription: isEnglishLikeText(wikidataData?.description)
      ? wikidataData?.description || null
      : null,
    wikidataImage: wikidataData?.image || null,
    wikipediaImage: wikipediaData?.image || null,
  };
}

function getRawDescription(place: OpenTripMapPlace, fallback?: OpenTripMapPlace) {
  const candidates = [
    cleanText(place.description),
    cleanText(place.wikipedia_extracts?.text),
    cleanText(fallback?.description),
    cleanText(fallback?.wikipedia_extracts?.text),
  ];

  return (
    candidates.find(
      (description) =>
        Boolean(description) &&
        isEnglishLikeText(description) &&
        !looksLikeKinds(description)
    ) || null
  );
}

function formatKindList(kinds: string[]) {
  if (kinds.length === 0) return null;
  if (kinds.length === 1) return kinds[0];
  if (kinds.length === 2) return `${kinds[0]} and ${kinds[1]}`;

  return `${kinds.slice(0, -1).join(", ")}, and ${kinds[kinds.length - 1]}`;
}

function buildCategoryDescription({
  name,
  country,
  kinds,
}: {
  name?: string | null;
  country?: string | null;
  kinds?: string | null;
}) {
  const destinationName = cleanText(name) || "This destination";
  const destinationCountry = cleanText(country);
  const usefulKinds = getUsefulKinds(kinds);
  const kindText = formatKindList(usefulKinds);

  if (kindText && destinationCountry) {
    return `${destinationName} is known for ${kindText} in ${destinationCountry}.`;
  }

  if (kindText) {
    return `${destinationName} is known for ${kindText}.`;
  }

  if (destinationCountry) {
    return `${destinationName} is a destination in ${destinationCountry}.`;
  }

  return `${destinationName} is a destination worth exploring.`;
}

function getDetailDescription(
  place: OpenTripMapPlace,
  fallback?: OpenTripMapPlace,
  external?: ExternalImageData
) {
  const candidates = [
    getRawDescription(place, fallback),
    cleanText(external?.wikidataDescription),
  ];

  const englishDescription = candidates.find(
    (description) =>
      Boolean(description) &&
      isEnglishLikeText(description) &&
      !looksLikeKinds(description)
  );

  if (englishDescription) {
    return englishDescription;
  }

  return buildCategoryDescription({
    name: getName(place, fallback, external),
    country: getCountry(place, fallback),
    kinds: place.kinds || fallback?.kinds,
  });
}

function isRateLimitMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("429")
  );
}

async function fetchDetailsForSearchCard(
  place: OpenTripMapPlace,
  index: number
) {
  if (index >= SEARCH_DETAILS_LIMIT) {
    return null;
  }

  if (Date.now() < skipSearchDetailsUntil) {
    return null;
  }

  try {
    return await fetchDestinationDetails(place.xid);
  } catch (error) {
    if (isRateLimitMessage(error)) {
      skipSearchDetailsUntil = Date.now() + DETAILS_COOLDOWN_MS;
      console.warn(
        "OpenTripMap details rate limit reached. Search detail enrichment paused briefly."
      );
      return null;
    }

    console.warn("OpenTripMap details fetch failed for search card:", {
      xid: place.xid,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return null;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;

      if (index >= items.length) break;

      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );

  return results;
}

async function enrichSearchResult(
  place: OpenTripMapPlace,
  index: number
): Promise<EnrichedSearchDestination | null> {
  if (!place.xid) return null;

  const details = await fetchDetailsForSearchCard(place, index);
  const mainPlace = details || place;

  const openTripMapImage = getOpenTripMapImage(mainPlace, place);

  const external =
    openTripMapImage && isUsefulName(mainPlace.name || place.name)
      ? {
          wikidataLabel: null,
          wikidataDescription: null,
          wikidataImage: null,
          wikipediaImage: null,
        }
      : await getExternalImageDataForPlace(mainPlace, {
          allowWikipediaImage: index < WIKIPEDIA_IMAGE_FALLBACK_LIMIT,
        });

  const name = getName(mainPlace, place, external);

  if (!isUsefulName(name)) {
    return null;
  }

  return {
    xid: mainPlace.xid || place.xid,
    name,
    country: getCountry(mainPlace, place),
    description: null,
    image: getBestImage(mainPlace, place, external),
  };
}

function normalizeForDedupe(value?: string | null) {
  return (
    cleanText(value)
      ?.toLowerCase()
      .replace(/\b(sri|shri|shree|temple|mandir)\b/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim() || ""
  );
}

function dedupeResults(results: EnrichedSearchDestination[]) {
  const seenNames = new Set<string>();

  return results.filter((result) => {
    const nameKey = normalizeForDedupe(result.name);

    if (nameKey && seenNames.has(nameKey)) {
      return false;
    }

    if (nameKey) {
      seenNames.add(nameKey);
    }

    return true;
  });
}

export async function searchDestination(q: string) {
  const results = await fetchDestinationSearch(q);

  const candidates = results
    .filter((item) => Boolean(item.xid))
    .slice(0, SEARCH_CANDIDATE_LIMIT);

  const enrichedResults = await mapWithConcurrency(
    candidates,
    DETAIL_FETCH_CONCURRENCY,
    enrichSearchResult
  );

  const validResults = enrichedResults.filter(
    (item): item is EnrichedSearchDestination => Boolean(item)
  );

  return dedupeResults(validResults).slice(0, SEARCH_RESULT_LIMIT);
}

export async function getDestinationDetails(xid: string) {
  const details = await fetchDestinationDetails(xid);

  const external = await getExternalImageDataForPlace(details, {
    allowWikipediaImage: true,
  });

  let weather = null;

  if (details.point?.lat && details.point?.lon) {
    weather = await fetchWeather(details.point.lat, details.point.lon).catch(
      (error) => {
        console.warn("Weather fetch failed:", {
          xid,
          message: error instanceof Error ? error.message : "Unknown error",
        });

        return null;
      }
    );
  }

  return {
    xid,
    name: getName(details, undefined, external),
    country: getCountry(details),
    description: getDetailDescription(details, undefined, external),
    image: getBestImage(details, undefined, external),
    weather,
    attractions: getUsefulKinds(details.kinds),
    coordinates: details.point || null,
  };
}
