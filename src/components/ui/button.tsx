import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
}

const variantClasses: Record<string, string> = {
  default: "bg-primary text-on-primary hover:bg-primary/90",
  secondary: "bg-surface-variant text-on-surface hover:bg-surface-variant/90",
  outline: "border border-outline text-on-surface hover:bg-surface/80",
};

const sizeClasses: Record<string, string> = {
  default: "h-11 px-5 text-sm",
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({ className = "", variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex select-none items-center justify-center rounded-full font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
