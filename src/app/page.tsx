import Link from "next/link";

function Navbar() {
  return (
    <header className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
        <div className="font-display-lg text-display-lg font-bold text-primary">Paryatan</div>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="#" className="text-on-surface-variant hover:text-primary">Home</Link>
          <Link href="/search" className="text-primary font-bold border-b-2 border-primary pb-1">Explore</Link>
          <Link href="#" className="text-on-surface-variant hover:text-primary">About</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button aria-label="Search" className="p-2 rounded-full">🔍</button>
          <Link href="/login" className="bg-primary text-on-primary px-4 py-2 rounded-full">Login</Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-surface-container-highest border-t mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 py-8 w-full max-w-7xl mx-auto">
        <div>
          <div className="font-display-lg-mobile text-display-lg-mobile font-bold">Paryatan</div>
          <p className="text-sm text-on-surface-variant">© 2026 Paryatan Travel Planning. All rights reserved.</p>
        </div>
        <div className="flex flex-col gap-2">
          <a href="#" className="text-sm text-on-surface-variant hover:text-primary">About</a>
          <a href="#" className="text-sm text-on-surface-variant hover:text-primary">Contact</a>
        </div>
        <div className="flex flex-col gap-2">
          <a href="#" className="text-sm text-on-surface-variant hover:text-primary">Privacy</a>
          <a href="#" className="text-sm text-on-surface-variant hover:text-primary">Terms</a>
        </div>
      </div>
    </footer>
  );
}

interface HomeDestination {
  title: string;
  country: string;
  price: string;
  description: string;
  image: string;
}

function DestinationCard({ title, country, price, description, image }: HomeDestination) {
  return (
    <article className="rounded-xl overflow-hidden flex flex-col bg-surface-container-lowest shadow-sm">
      <div className="relative h-48 w-full overflow-hidden">
        <div className="bg-cover bg-center w-full h-full" style={{ backgroundImage: `url(${image})` }} />
        <button className="absolute top-2 left-2 p-2 rounded-full bg-white/80">♡</button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-xs">{price}</span>
        </div>
        <p className="text-sm text-on-surface-variant mb-3 flex items-center gap-2">📍 {country}</p>
        <p className="text-sm text-on-surface mb-4 line-clamp-2">{description}</p>
        <div className="mt-auto pt-3 border-t border-outline-variant/50">
          <Link href={`/destination/${encodeURIComponent(title)}`} className="w-full bg-primary/10 text-primary py-2 rounded-lg flex items-center justify-center gap-2">View Details →</Link>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const sample = [
    {
      title: "Swiss Alps",
      country: "Switzerland",
      price: "$$$",
      description: "Experience the majestic peaks and pristine valleys of the Swiss Alps.",
      image: "https://images.unsplash.com/photo-1508264165352-c3d1a6d5a3b8?auto=format&fit=crop&w=1000&q=80",
    },
    {
      title: "Rocky Mountains",
      country: "USA",
      price: "$$",
      description: "Explore the rugged beauty of the Rockies.",
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80",
    },
    {
      title: "Mount Fuji",
      country: "Japan",
      price: "$$$",
      description: "Witness the iconic beauty of Mount Fuji.",
      image: "https://images.unsplash.com/photo-1505672678657-cc7037095e06?auto=format&fit=crop&w=1000&q=80",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
        <section className="flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold">Explore Destinations</h1>
          <div className="w-full max-w-2xl flex items-center bg-white rounded-full overflow-hidden shadow">
            <input className="flex-1 px-4 py-3" placeholder="Search destinations..." defaultValue="Mountains" />
            <button className="bg-primary text-on-primary px-6 py-3 rounded-full">Search</button>
          </div>
          <p className="text-sm text-on-surface-variant">Showing 124 results for &quot;Mountains&quot;</p>
        </section>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sample.map((s) => (
              <DestinationCard key={s.title} {...s} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
