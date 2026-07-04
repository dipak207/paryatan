/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FALLBACK_DESTINATION_IMAGE = "/images/destination-placeholder.jpg";

export interface DestinationCardProps {
  xid: string;
  name?: string | null;
  title?: string | null;
  country?: string | null;
  description?: string | null;
  image?: string | null;
  href?: string;
}

function cleanText(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/<[^>]*>/g, "")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidImageUrl(image?: string | null) {
  return Boolean(
    image &&
      typeof image === "string" &&
      (image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("/"))
  );
}

function getSafeImage(image?: string | null) {
  return isValidImageUrl(image) ? (image as string) : FALLBACK_DESTINATION_IMAGE;
}

function isBadTitle(value?: string | null) {
  const text = cleanText(value).toLowerCase();

  return (
    !text ||
    text === "unknown" ||
    text === "unknown destination" ||
    text === "undefined" ||
    text === "destination" ||
    text === "other" ||
    text.includes("unclassified objects") ||
    text.includes("unclassified_objects") ||
    text.includes("interesting places") ||
    text.includes("interesting_places")
  );
}

function getDisplayName(name?: string | null, title?: string | null) {
  const cleanedName = cleanText(name);
  const cleanedTitle = cleanText(title);

  if (!isBadTitle(cleanedName)) return cleanedName;
  if (!isBadTitle(cleanedTitle)) return cleanedTitle;

  return "Destination";
}

function formatLocation(country?: string | null) {
  const cleanedCountry = cleanText(country);

  if (
    !cleanedCountry ||
    cleanedCountry.toLowerCase() === "unknown" ||
    cleanedCountry.toLowerCase() === "undefined"
  ) {
    return "Location unavailable";
  }

  return cleanedCountry;
}

export default function DestinationCard({
  xid,
  name,
  title,
  country,
  image,
  href,
}: DestinationCardProps) {
  const destinationName = getDisplayName(name, title);
  const displayLocation = formatLocation(country);
  const [currentImage, setCurrentImage] = useState(getSafeImage(image));

  useEffect(() => {
    setCurrentImage(getSafeImage(image));
  }, [image]);

  const detailsHref = href || `/destination/${encodeURIComponent(xid)}`;

  return (
    <Card className="group overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-80 w-full overflow-hidden bg-slate-100">
        <img
          src={currentImage}
          alt={`${destinationName} travel image`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            if (currentImage !== FALLBACK_DESTINATION_IMAGE) {
              setCurrentImage(FALLBACK_DESTINATION_IMAGE);
            }
          }}
        />

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />

        <button
          type="button"
          aria-label="Add to favorites"
          className="absolute right-5 top-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-md backdrop-blur transition hover:bg-white"
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>

      <CardContent className="space-y-5 p-7">
        <div>
          <h3 className="line-clamp-2 text-xl font-bold leading-snug text-slate-950">
            {destinationName}
          </h3>

          <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{displayLocation}</span>
          </p>
        </div>

        <Link href={detailsHref}>
          <Button className="rounded-2xl px-6">View details</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
