import axios from "axios";

const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;

export interface WeatherResponse {
  temp?: number;
  feels_like?: number;
  humidity?: number;
  weather?: {
    main?: string;
    description?: string;
    icon?: string;
  }[];
}

export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherResponse | null> {
  if (!OPENWEATHER_KEY) {
    console.warn("OPENWEATHER_API_KEY is not defined in .env");
    return null;
  }

  const resp = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
    timeout: 10000,
    params: {
      lat,
      lon,
      units: "metric",
      appid: OPENWEATHER_KEY,
    },
  });

  return {
    temp: resp.data?.main?.temp,
    feels_like: resp.data?.main?.feels_like,
    humidity: resp.data?.main?.humidity,
    weather: resp.data?.weather,
  };
}
