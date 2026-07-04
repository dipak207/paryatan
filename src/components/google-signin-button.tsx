"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    if (window.google?.accounts?.id) {
      setTimeout(() => setScriptReady(true), 0);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existingScript) {
      if (window.google?.accounts?.id) {
        setTimeout(() => setScriptReady(true), 0);
      } else {
        existingScript.addEventListener("load", () => setScriptReady(true), {
          once: true,
        });
      }

      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () => toast.error("Failed to load Google sign-in.");

    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (
      !GOOGLE_CLIENT_ID ||
      !scriptReady ||
      !window.google?.accounts?.id ||
      !containerRef.current
    ) {
      return;
    }

    containerRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        if (!response.credential) {
          toast.error("Google authentication failed.");
          return;
        }

        try {
          await loginWithGoogle(response.credential);
          toast.success("Signed in with Google.");
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to sign in with Google.";

          toast.error(message);
        }
      },
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: 360,
    });
  }, [scriptReady, loginWithGoogle]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="text-sm text-red-500">
        Google sign-in is not configured.
      </p>
    );
  }

  return <div ref={containerRef} className="flex w-full justify-center" />;
}
