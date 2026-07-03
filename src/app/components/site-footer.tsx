export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-semibold text-slate-900">Paryatan</div>
          <p className="mt-2 text-slate-500">Travel planning for memorable trips.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <a href="#" className="transition hover:text-slate-900">
            About
          </a>
          <a href="#" className="transition hover:text-slate-900">
            Contact
          </a>
          <a href="#" className="transition hover:text-slate-900">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
