import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-forest-950 px-6 text-center">
      <span className="text-xs font-medium uppercase tracking-[0.3em] text-clay-400">404</span>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-stone-50 sm:text-5xl">
        This Page Doesn&apos;t Exist
      </h1>
      <p className="mx-auto mt-4 max-w-md text-stone-200/80">
        The page you&apos;re looking for may have been moved or the link may be outdated.
      </p>
      <Link
        href="/projects"
        className="mt-8 rounded-full bg-clay-500 px-7 py-3.5 text-sm font-semibold text-stone-50 transition-colors hover:bg-clay-600"
      >
        View All Projects
      </Link>
    </main>
  );
}
