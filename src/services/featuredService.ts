export interface FeaturedDestination {
  xid: string;
  name: string;
  country: string;
  description?: string | null;
  image?: string | null;
  href?: string;
}

const FEATURED_DESTINATIONS: FeaturedDestination[] = [
  {
    xid: "Q90",
    name: "Paris",
    country: "France",
    description:
      "Paris is known for the Eiffel Tower, museums, architecture, cafes, and romantic city experiences.",
    image: "/images/featured/paris.jpg",
    href: "/search?q=Paris",
  },
  {
    xid: "Q1490",
    name: "Tokyo",
    country: "Japan",
    description:
      "Tokyo blends modern city life, historic temples, food culture, shopping districts, and technology.",
    image: "/images/featured/tokyo.jpg",
    href: "/search?q=Tokyo",
  },
  {
    xid: "Q60",
    name: "New York City",
    country: "United States",
    description:
      "New York City is famous for Times Square, Central Park, skyscrapers, museums, and global culture.",
    image: "/images/featured/new-york.jpg",
    href: "/search?q=New%20York%20City",
  },
  {
    xid: "Q8678",
    name: "Rio de Janeiro",
    country: "Brazil",
    description:
      "Rio de Janeiro is known for beaches, mountains, Carnival, Christ the Redeemer, and scenic views.",
    image: "/images/featured/rio.jpg",
    href: "/search?q=Rio%20de%20Janeiro",
  },
  {
    xid: "Q5465",
    name: "Cape Town",
    country: "South Africa",
    description:
      "Cape Town offers Table Mountain, beaches, coastal drives, wildlife, food, and cultural history.",
    image: "/images/featured/cape-town.jpg",
    href: "/search?q=Cape%20Town",
  },
  {
    xid: "Q3130",
    name: "Sydney",
    country: "Australia",
    description:
      "Sydney is known for its harbour, Opera House, beaches, city life, and coastal attractions.",
    image: "/images/featured/sydney.jpg",
    href: "/search?q=Sydney",
  },
];

export async function getFeaturedDestinations(): Promise<FeaturedDestination[]> {
  return FEATURED_DESTINATIONS;
}