import axios from "axios";

const OTM_KEY = process.env.OPENTRIPMAP_API_KEY;
const OTM_BASE = "https://api.opentripmap.com/0.1/en/places";

if (!OTM_KEY) throw new Error("OPENTRIPMAP_API_KEY is not defined");

export async function fetchDestinationSearch(q: string) {
  const geoUrl = `${OTM_BASE}/geoname?name=${encodeURIComponent(q)}&apikey=${OTM_KEY}`;
  const geoResp = await axios.get(geoUrl);
  const geoData = geoResp.data;
  if (!geoData?.lat || !geoData?.lon) return [];

  const radiusUrl = `${OTM_BASE}/radius?radius=20000&limit=20&offset=0&lon=${encodeURIComponent(
    geoData.lon,
  )}&lat=${encodeURIComponent(geoData.lat)}&rate=2&format=json&apikey=${OTM_KEY}`;
  const radiusResp = await axios.get(radiusUrl);
  return Array.isArray(radiusResp.data) ? radiusResp.data : [];
}

export async function fetchDestinationDetails(xid: string) {
  const url = `${OTM_BASE}/xid/${encodeURIComponent(xid)}?apikey=${OTM_KEY}`;
  const resp = await axios.get(url);
  return resp.data;
}
