import * as React from "react";

export function Badge({ className = "", ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={`inline-flex items-center rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-on-secondary-container ${className}`} {...props} />;
}
