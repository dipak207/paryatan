"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../services/api";

export default function DestinationCard({ title, country, price, description, image, xid }: any) {
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
    } catch (err: any) {
      toast.error(err?.message || JSON.stringify(err));
    }
  };

  return (
    <article className="rounded-xl overflow-hidden flex flex-col bg-white shadow group">
      <div className="relative h-48 w-full overflow-hidden">
        <div className="bg-cover bg-center w-full h-full transform group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${image || '/placeholder.jpg'})` }} />
        <button onClick={toggleFavorite} className={`absolute top-2 left-2 p-2 rounded-full bg-white/80 ${isFav ? 'text-red-500' : 'text-gray-600'}`} aria-label="Favorite">
          {isFav ? '♥' : '♡'}
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          <span className="px-2 py-1 rounded bg-gray-100 text-sm">{price || "$$"}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">📍 {country}</p>
        <p className="text-sm text-gray-800 mb-4 line-clamp-2">{description}</p>
        <div className="mt-auto pt-3 border-t border-gray-100">
          <Link href={`/destination/${encodeURIComponent(xid || title)}`} className="w-full bg-primary/10 text-primary py-2 rounded-lg flex items-center justify-center gap-2">View Details →</Link>
        </div>
      </div>
    </article>
  );
}
