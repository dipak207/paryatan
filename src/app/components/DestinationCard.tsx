"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Heart, MapPin, ArrowRight, CloudSun, DollarSign, Calendar } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../services/api";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import Image from "next/image";

interface DestinationCardProps {
  title: string;
  country?: string;
  price?: string;
  description?: string;
  image?: string;
  xid: string;
}

export default function DestinationCard({ title, country, price, description, image, xid }: DestinationCardProps) {
  const { token } = useAuth();
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    // No global favorites cache — optimistic UI only. Could fetch user favorites to set this.
  }, []);

  const toggleFavorite = async () => {
    if (!token) return toast.error("Please login to favorite");
    try {
      if (!isFav) {
        await api.addFavorite(token, { xid: xid || title, destinationName: title, image, country });
        setIsFav(true);
        toast.success("Added to favorites");
      } else {
        await api.removeFavorite(token, xid || title);
        setIsFav(false);
        toast.success("Removed from favorites");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      toast.error(message);
    }
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={image || "/placeholder.jpg"}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <button
          onClick={toggleFavorite}
          className={`absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white ${isFav ? "text-red-600" : "text-slate-700"}`}
          aria-label="Favorite"
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>
      <CardContent className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              <span>{country || "Unknown"}</span>
            </div>
          </div>
          <Badge>{price || "$200+"}</Badge>
        </div>
        <p className="text-sm leading-6 text-slate-600 line-clamp-3">{description}</p>
      </CardContent>
      <CardFooter className="gap-3 px-6 pb-6 pt-0">
        <Button className="w-full gap-2 justify-center text-sm font-semibold" variant="outline">
          <Link href={`/destination/${encodeURIComponent(xid)}`} className="inline-flex items-center gap-2">
            View Details <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
