import Image, { ImageProps } from "next/image";

export function NextImage({ alt, ...props }: ImageProps) {
  return <Image className="rounded-t-3xl object-cover" alt={alt || ""} {...props} />;
}
