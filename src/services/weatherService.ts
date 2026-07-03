import axios from "axios";

const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;

if (!OPENWEATHER_KEY) throw new Error("OPENWEATHER_API_KEY is not defined");

export async function fetchWeather(lat: number, lon: number) {
  const resp = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
    params: {
      lat,
      lon,
      units: "metric",
      appid: OPENWEATHER_KEY,
    },
  });
  return resp.data;
}
