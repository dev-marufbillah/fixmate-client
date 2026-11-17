import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4 py-16">
      <div className="text-center max-w-md">
        <svg viewBox="0 0 240 160" className="w-64 h-44 mx-auto mb-6" aria-hidden="true">
          <defs>
            <linearGradient id="g404" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
          <rect x="15" y="30" width="210" height="115" rx="14" fill="none" stroke="url(#g404)" strokeWidth="5" />
          <path d="M15 120 L75 78 L112 104 L165 66 L225 104" fill="none" stroke="url(#g404)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="75" cy="78" r="6" fill="#f59e0b" />
          <circle cx="165" cy="66" r="6" fill="#f59e0b" />
          <g transform="translate(156 84) rotate(-35)">
            <rect x="0" y="6" width="56" height="14" rx="7" fill="#1e293b" />
            <path d="M4 8 L-14 -2 L-16 8 L-4 14 Z" fill="#0f766e" />
            <circle cx="-10" cy="5" r="7" fill="none" stroke="#0f766e" strokeWidth="4" />
          </g>
          <text x="120" y="24" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="30" fill="#1e293b">
            4
          </text>
          <text x="76" y="24" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="30" fill="url(#g404)">
            0
          </text>
          <text x="164" y="24" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="30" fill="#1e293b">
            4
          </text>
        </svg>

        <h1 className="page-h1 text-3xl md:text-4xl mb-3">Page not found</h1>
        <p className="opacity-70 mb-8 leading-relaxed">
          Looks like this bolt doesn&rsquo;t belong anywhere — the page you&rsquo;re looking for was
          moved, deleted, or never existed. Let&rsquo;s get you back to fixing things.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn btn-primary rounded-xl px-7 h-11 font-semibold">
            Back to Home
          </Link>
          <Link href="/services" className="btn btn-outline btn-primary rounded-xl px-7 h-11 font-semibold">
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
}
