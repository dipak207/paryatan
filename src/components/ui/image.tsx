import Image, { ImageProps } from "next/image";

export function NextImage(props: ImageProps) {
  return <Image className="rounded-t-3xl object-cover" {...props} />;
}
