"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    const win = window as any;
    const renderGoogleButton = () => {
      if (!win.google?.accounts?.id || !containerRef.current) {
        return;
      }

      win.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          if (!response?.credential) {
            toast.error("Google authentication failed.");
            return;
          }

          try {
            await loginWithGoogle(response.credential);
          } catch (error) {
            const message = error instanceof Error ? error.message : JSON.stringify(error);
            toast.error(message || "Unable to sign in with Google.");
          }
        },
      });

      if (containerRef.current.childElementCount === 0) {
        win.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: "100%",
        });
      }
    };

    if (win.google?.accounts?.id) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [loginWithGoogle]);

  if (!GOOGLE_CLIENT_ID) {
    return <p className="text-sm text-red-500">Google sign-in is not configured.</p>;
  }

  return <div ref={containerRef} className="w-full" />;
}
