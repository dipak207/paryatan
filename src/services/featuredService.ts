import { searchDestination } from "@/services/destinationService";

export interface FeaturedDestination {
  xid: string;
  name: string;
  country: string;
  description?: string | null;
  image?: string | null;
}

const FEATURED_QUERIES = ["Paris", "Tokyo", "New York", "Rio de Janeiro", "Cape Town", "Sydney"];

export async function getFeaturedDestinations(): Promise<FeaturedDestination[]> {
  const results = await Promise.all(FEATURED_QUERIES.map((query) => searchDestination(query)));

  const deduped = new Map<string, FeaturedDestination>();
  for (const group of results) {
    for (const item of group) {
      if (!item.xid || deduped.has(item.xid)) continue;
      deduped.set(item.xid, {
        xid: item.xid,
        name: item.name,
        country: item.country,
        description: item.description ?? null,
        image: item.image ?? null,
      });
    }
  }

  return Array.from(deduped.values()).slice(0, 6);
}
