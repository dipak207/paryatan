import { fetchDestinationSearch, fetchDestinationDetails } from "@/services/openTripMapService";
import { fetchWikipediaImage } from "@/services/wikipediaService";
import { fetchWeather } from "@/services/weatherService";

export async function searchDestination(q: string) {
  const results = await fetchDestinationSearch(q);
  return results
    .filter((item) => !!item.xid)
    .map((item) => ({
      xid: item.xid,
      name: item.name,
      country: item.address?.country || item.country || "Unknown",
      description: item.kinds || item.wikipedia_extracts?.text || null,
      image: item.preview?.source || null,
    }));
}

export async function getDestinationDetails(xid: string) {
  const details = await fetchDestinationDetails(xid);

  const image = details.wikipedia
    ? await fetchWikipediaImage(details.wikipedia.split("/wiki/").pop() || "")
    : null;

  let weather = null;
  if (details.point?.lat && details.point?.lon) {
    weather = await fetchWeather(details.point.lat, details.point.lon).catch(() => null);
  }

  return {
    name: details.name,
    country: details.country || details.address?.country || null,
    description: details.description || details.wikipedia_extracts?.text || null,
    image,
    weather,
    attractions: details.kinds ? details.kinds.split(",") : [],
    coordinates: details.point || null,
  };
}
