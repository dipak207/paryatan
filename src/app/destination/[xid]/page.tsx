"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import * as api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Heart, MapPin, CloudSun, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface WeatherInfo {
  temp?: number;
  feels_like?: number;
  humidity?: number;
  weather?: {
    main?: string;
    description?: string;
    icon?: string;
  }[];
}

interface DestinationDetailsData {
  name: string;
  country?: string | null;
  description?: string | null;
  image?: string | null;
  weather?: WeatherInfo | null;
  attractions?: string[];
  coordinates?: {
    lat?: number;
    lon?: number;
  } | null;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

export default function DestinationDetails() {
  const params = useParams() as { xid?: string | string[] };
  const xid = Array.isArray(params.xid) ? params.xid[0] : params.xid;

  const [data, setData] = useState<DestinationDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { token } = useAuth();
  const [isFav, setIsFav] = useState(false);

  const markVisited = async () => {
    if (!token) {
      toast.error("Please login to mark visited");
      return;
    }

    if (!xid || !data) {
      toast.error("Destination data is unavailable");
      return;
    }

    try {
      await api.addVisited(token, {
        xid,
        destinationName: data.name,
        image: data.image || FALLBACK_IMAGE,
        country: data.country || "Unknown",
      });

      toast.success("Marked visited");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to mark visited";
      toast.error(message);
    }
  };

  const toggleFavorite = async () => {
    if (!token) {
      toast.error("Please login to favorite");
      return;
    }

    if (!xid || !data) {
      toast.error("Destination data is unavailable");
      return;
    }

    try {
      if (!isFav) {
        await api.addFavorite(token, {
          xid,
          destinationName: data.name,
          image: data.image || FALLBACK_IMAGE,
          country: data.country || "Unknown",
        });

        setIsFav(true);
        toast.success("Added to favorites");
      } else {
        await api.removeFavorite(token, xid);

        setIsFav(false);
        toast.success("Removed from favorites");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update favorites";
      toast.error(message);
    }
  };

  useEffect(() => {
    async function load(destinationId: string) {
      setLoading(true);
      setErrorMessage("");

      try {
        const destination = await api.getDestination(destinationId);
        setData(destination);
      } catch (err) {
        console.error(err);

        const message =
          err instanceof Error
            ? err.message
            : "Could not load destination details. Please try again.";

        setErrorMessage(message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    if (xid) {
      load(xid);
    }
  }, [xid]);

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-3xl border border-border bg-surface p-8 text-center text-on-surface-variant">
            Loading destination...
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-[calc(100vh-8rem)] bg-background py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-3xl border border-border bg-surface p-8 text-center">
            <h1 className="text-2xl font-semibold text-foreground">
              Destination not found
            </h1>

            <p className="mt-3 text-on-surface-variant">
              {errorMessage || "We could not load this destination right now."}
            </p>

            <Button
              className="mt-6"
              onClick={() => {
                window.location.href = "/search";
              }}
            >
              Back to Search
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const weather = data.weather || {};
  const weatherDescription =
    weather.weather?.[0]?.description || "Enjoy the outdoors";

  const imageUrl = data.image || FALLBACK_IMAGE;

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-background py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <Card className="overflow-hidden">
            <div className="relative h-96 w-full overflow-hidden">
              <Image
                src={imageUrl}
                alt={data.name}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />

              <button
                type="button"
                onClick={toggleFavorite}
                className={`absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-md transition hover:bg-surface ${
                  isFav ? "text-rose-600" : ""
                }`}
                aria-label="Toggle favorite"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>

            <CardContent className="space-y-6 p-8">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.25em] text-on-surface-variant">
                  <MapPin className="h-4 w-4" />
                  <span>{data.country || "Unknown destination"}</span>
                </div>

                <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                  {data.name}
                </h1>

                <p className="max-w-3xl text-base leading-7 text-on-surface-variant">
                  {data.description ||
                    "Discover a destination with exceptional scenery, local flavor, and unforgettable experiences."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-3 text-foreground">
                    <CloudSun className="h-5 w-5" />
                    <span className="text-sm font-semibold">Weather</span>
                  </div>

                  <p className="mt-4 text-2xl font-semibold text-foreground">
                    {weather.temp !== undefined ? `${Math.round(weather.temp)}°C` : "--"}
                  </p>

                  <p className="mt-1 text-sm capitalize text-on-surface-variant">
                    {weatherDescription}
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-3 text-foreground">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm font-semibold">Budget</span>
                  </div>

                  <p className="mt-4 text-2xl font-semibold text-foreground">
                    $200+
                  </p>

                  <p className="mt-1 text-sm text-on-surface-variant">
                    Estimated travel cost
                  </p>
                </div>

                <div className="rounded-3xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-3 text-foreground">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm font-semibold">Best Time</span>
                  </div>

                  <p className="mt-4 text-2xl font-semibold text-foreground">
                    All year
                  </p>

                  <p className="mt-1 text-sm text-on-surface-variant">
                    Perfect for every mood
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 p-8 sm:flex-row sm:items-center sm:justify-between">
              <Button
                onClick={markVisited}
                className="w-full sm:w-auto"
                variant="default"
              >
                Mark visited
              </Button>

              <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
                <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-2">
                  <CloudSun className="h-4 w-4" />
                  Weather insights
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-2">
                  <MapPin className="h-4 w-4" />
                  {data.country || "Global"}
                </span>
              </div>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-foreground">
                  Trip overview
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl border border-border bg-surface p-5">
                    <p className="text-sm text-on-surface-variant">
                      Destination
                    </p>

                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {data.name}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-border bg-surface p-5">
                    <p className="text-sm text-on-surface-variant">Country</p>

                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {data.country || "Unknown"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-border bg-surface p-5">
                    <p className="text-sm text-on-surface-variant">Why go</p>

                    <p className="mt-2 text-lg font-semibold text-foreground">
                      Stunning views, curated experiences, and travel ease.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold text-foreground">
                  Weather insights
                </h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-border bg-surface p-5">
                    <p className="text-sm text-on-surface-variant">
                      Feels like
                    </p>

                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {weather.feels_like !== undefined
                        ? `${Math.round(weather.feels_like)}°C`
                        : "--"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-border bg-surface p-5">
                    <p className="text-sm text-on-surface-variant">Humidity</p>

                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {weather.humidity !== undefined
                        ? `${weather.humidity}%`
                        : "--"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
