import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import { CATEGORIES } from "@/lib/constants";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "How It Works" },
];

function XLogo({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-base-300 bg-base-200/60">
      <div className="container-px py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm opacity-70 leading-relaxed max-w-xs">
            Verified hands for every fix — book trusted device &amp; appliance repair experts and pay
            only after the job is done.
          </p>
          <div className="flex items-center gap-2">
            {[
              { label: "X", href: "https://x.com", icon: <XLogo /> },
              {
                label: "Facebook",
                href: "https://facebook.com",
                icon: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
                  </svg>
                ),
              },
              {
                label: "YouTube",
                href: "https://youtube.com",
                icon: (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6z" />
                  </svg>
                ),
              },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="btn btn-circle btn-sm btn-ghost border border-base-300 hover:btn-primary hover:border-primary"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-heading font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="opacity-70 hover:opacity-100 hover:text-primary transition">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/sign-up" className="opacity-70 hover:opacity-100 hover:text-primary transition">
                Become a Technician
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-bold mb-4">Popular Categories</h4>
          <ul className="space-y-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link
                  href={`/services?category=${encodeURIComponent(c)}`}
                  className="opacity-70 hover:opacity-100 hover:text-primary transition"
                >
                  {c} Repair
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-bold mb-4">Contact</h4>
          <ul className="space-y-3.5 text-sm opacity-80">
            <li className="flex items-start gap-3">
              <Mail size={16} className="text-primary mt-0.5 shrink-0" />
              support@fixmate.com
            </li>
            <li className="flex items-start gap-3">
              <Phone size={16} className="text-primary mt-0.5 shrink-0" />
              +880 1700-000000
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
              House 12, Road 5, Mirpur, Dhaka 1216, Bangladesh
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-base-300">
        <div className="container-px py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-70">
          <p>© {new Date().getFullYear()} FixMate. All rights reserved.</p>
          <p>Smart Device &amp; Home Appliance Repair Service Platform</p>
        </div>
      </div>
    </footer>
  );
}
