import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";

interface DestinationCardProps {
  xid?: string;
  name?: string;
  title?: string;
  country?: string;
  description?: string;
  image?: string;
  price?: string;
}

export default function DestinationCard({ xid, name, title, country, description, image, price }: DestinationCardProps) {
  const label = name || title || "Destination";
  const href = xid ? `/destination/${encodeURIComponent(xid)}` : "/search";

  return (
    <article className="group overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-64 w-full overflow-hidden bg-surface-container-high">
        {image ? (
          <Image
            src={image}
            alt={label}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-surface-container-high text-on-surface-variant">
            <div className="text-4xl">✈️</div>
            <span className="text-sm">No preview available</span>
          </div>
        )}
        <div className="absolute right-4 top-4 rounded-full bg-surface/90 p-3 shadow-sm">
          <Heart className="h-5 w-5 text-foreground" />
        </div>
      </div>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-foreground">{label}</h3>
            <p className="text-sm text-on-surface-variant">{country || "Unknown location"}</p>
          </div>
          <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
            {price || "Flexible"}
          </span>
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-on-surface">{description || "A beautiful destination to explore."}</p>
        <Link href={href} className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary/90">
          View details
        </Link>
      </div>
    </article>
  );
}
