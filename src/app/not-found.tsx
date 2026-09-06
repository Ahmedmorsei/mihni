import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-24 min-h-[80vh]">
      <div className="not-found-scene mb-8" aria-hidden="true">
        <span className="not-found-orbit not-found-orbit--one" />
        <span className="not-found-orbit not-found-orbit--two" />
        <span className="not-found-fragment not-found-fragment--top" />
        <span className="not-found-fragment not-found-fragment--side" />
        <div className="not-found-beacon">
          <span className="not-found-beacon__label">404</span>
          <span className="not-found-beacon__dot" />
        </div>
      </div>

      <p className="text-sm font-semibold tracking-widest text-primary mb-2">
        ERROR 404
      </p>
      <h1 className="text-5xl sm:text-6xl font-bold mb-4">
        Page not found
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist, was renamed, or
        moved somewhere else. Let&apos;s get you back on track.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition shadow-sm shadow-primary/30"
        >
          Back to Home
        </Link>
        <Link
          href="/pricing"
          className="border border-gray-300 dark:border-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          View Pricing
        </Link>
      </div>
    </div>
  );
}
