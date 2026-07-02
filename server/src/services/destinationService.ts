import axios from "axios";

const OTM_KEY = process.env.OPENTRIPMAP_API_KEY;
const OTM_BASE = "https://api.opentripmap.com/0.1/en/places";
const WIKI_API = process.env.WIKIPEDIA_API_URL || "https://en.wikipedia.org/w/api.php";
const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;

export async function searchDestination(q: string) {
  // use OpenTripMap geoname or bbox for search - simplified implementation using geoname
  const url = `${OTM_BASE}/geoname?name=${encodeURIComponent(q)}&apikey=${OTM_KEY}`;
  const resp = await axios.get(url);
  // return basic array
  return resp.data ? [resp.data] : [];
}

export async function getDestinationDetails(xid: string) {
  const detailsUrl = `${OTM_BASE}/xid/${encodeURIComponent(xid)}?apikey=${OTM_KEY}`;
  const detailsResp = await axios.get(detailsUrl);
  const details = detailsResp.data;

  // Wikipedia image fetch
  let image = null;
  try {
    if (details.wikipedia) {
      const wikiResp = await axios.get(WIKI_API, {
        params: {
          action: "query",
          prop: "pageimages|extracts",
          exintro: true,
          format: "json",
          piprop: "original",
          titles: details.wikipedia.split("/wiki/").pop(),
        },
      });
      const pages = wikiResp.data.query?.pages;
      if (pages) {
        const page = Object.values(pages)[0] as { original?: { source?: string } };
        image = page.original?.source || null;
      }
    }
  } catch (err) {
    console.warn("Wikipedia fetch failed", err?.message || err);
  }

  // OpenWeather
  let weather = null;
  try {
    if (details.point && details.point.lat && OPENWEATHER_KEY) {
      const wresp = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
        params: {
          lat: details.point.lat,
          lon: details.point.lon,
          units: "metric",
          appid: OPENWEATHER_KEY,
        },
      });
      weather = wresp.data;
    }
  } catch (err) {
    console.warn("OpenWeather failed", err?.message || err);
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
