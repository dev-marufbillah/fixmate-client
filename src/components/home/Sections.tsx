import Link from "next/link";
import {
  Search,
  Send,
  Wrench,
  CreditCard,
  ShieldCheck,
  BadgeDollarSign,
  Clock3,
  Headset,
  Smartphone,
  Laptop,
  Snowflake,
  Refrigerator,
  Tv,
  WashingMachine,
  Zap,
  ArrowRight,
  Star,
} from "lucide-react";
import { Service } from "@/lib/types";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { CATEGORIES } from "@/lib/constants";

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone size={26} />,
  "Laptop & PC": <Laptop size={26} />,
  AC: <Snowflake size={26} />,
  Refrigerator: <Refrigerator size={26} />,
  TV: <Tv size={26} />,
  "Washing Machine": <WashingMachine size={26} />,
  Electrical: <Zap size={26} />,
};

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-base-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10" />
      <div className="absolute -top-24 -left-20 w-72 h-72 blob bg-primary/20" style={{ animationDelay: "0s" }} />
      <div className="absolute -bottom-28 right-[38%] w-80 h-80 blob bg-secondary/15" style={{ animationDelay: "3s" }} />
      <div className="container-px relative grid items-center gap-10 py-16 md:py-24 lg:grid-cols-2">
        <div className="animate-fade-up">
          <span className="badge badge-secondary badge-outline gap-1.5 mb-5">
            <ShieldCheck size={14} /> Verified Technicians · Pay After Service
          </span>
          <h1 className="page-h1 leading-[1.08]">
            Broken Device?{" "}
            <span className="gradient-text-anim">Get It Fixed</span>{" "}
            by Verified Technicians.
          </h1>
          <p className="mt-5 text-base md:text-lg opacity-75 max-w-xl leading-relaxed">
            Book trusted repair experts for phones, laptops, ACs, fridges and more. Track every step of
            the job — and pay only after the work is done.
          </p>

          <form action="/services" method="GET" className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
            <label className="flex-1 relative">
              <span className="sr-only">Search services</span>
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none"
              />
              <input
                name="search"
                placeholder="Search e.g. iPhone screen, AC servicing…"
                className="input input-bordered w-full rounded-xl h-12 pl-11 focus:border-primary focus:ring-2 focus:ring-primary/25"
              />
            </label>
            <button type="submit" className="btn btn-primary rounded-xl h-12 px-7 font-semibold">
              Search Services
            </button>
          </form>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold">
              <span className="flex text-secondary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} className="fill-current" />
                ))}
              </span>
              4.9 average rating
            </span>
            <span className="opacity-70">2,000+ jobs completed</span>
            <span className="opacity-70">No advance payment</span>
          </div>
        </div>

        <div className="relative hidden lg:block animate-fade-up">
          <div className="card-surface overflow-hidden shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero.jpg"
              alt="Verified FixMate technician ready for a repair job"
              className="w-full h-[430px] object-cover"
            />
          </div>
          <div className="absolute -left-6 top-8 card-surface animate-float px-4 py-3 flex items-center gap-3 shadow-lg">
            <span className="w-10 h-10 rounded-xl bg-success/15 text-success grid place-items-center">
              <Clock3 size={20} />
            </span>
            <div>
              <p className="text-xs opacity-60">Live tracking</p>
              <p className="text-sm font-bold">Step-by-step updates</p>
            </div>
          </div>
          <div className="absolute -right-4 bottom-8 card-surface animate-float-slow px-4 py-3 flex items-center gap-3 shadow-lg">
            <span className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary grid place-items-center">
              <BadgeDollarSign size={20} />
            </span>
            <div>
              <p className="text-xs opacity-60">Payment</p>
              <p className="text-sm font-bold">Only after completion</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export async function FeaturedServices({ services }: { services: Service[] | null }) {
  return (
    <section className="section-pad container-px">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-9">
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Featured</p>
          <h2 className="page-h2">Latest Approved Services</h2>
          <p className="opacity-70 mt-2 text-sm">Hand-picked jobs from our verified technicians.</p>
        </div>
        <Link href="/services" className="btn btn-outline btn-primary rounded-xl gap-2">
          View all services <ArrowRight size={16} />
        </Link>
      </div>

      {services && services.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s._id} delay={i * 65} className="h-full">
              <ServiceCard service={s} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="card-surface py-14 text-center">
          <p className="font-heading font-bold text-lg">No services yet</p>
          <p className="text-sm opacity-70 mt-1">New repairs will appear here soon.</p>
          <Link href="/services" className="btn btn-primary rounded-xl mt-5">
            Browse Services
          </Link>
        </div>
      )}
    </section>
  );
}

const STEPS = [
  {
    icon: <Search size={24} />,
    title: "Find a Service",
    text: "Search 7 repair categories and pick a verified technician near you.",
  },
  {
    icon: <Send size={24} />,
    title: "Send a Request",
    text: "Describe the problem, choose a date — one tap, no advance payment.",
  },
  {
    icon: <Wrench size={24} />,
    title: "Technician Fixes It",
    text: "Track the job live: Accepted → In Progress → Completed.",
  },
  {
    icon: <CreditCard size={24} />,
    title: "Pay After Completion",
    text: "Pay securely with Stripe only when the repair is delivered.",
  },
];

export function HowItWorks() {
  return (
    <section className="section-pad bg-base-200/60 border-y border-base-300">
      <div className="container-px">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">How FixMate Works</p>
          <h2 className="page-h2">From broken to fixed in 4 simple steps</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 90} className="h-full">
              <div className="card-surface p-6 relative h-full hover-lift">
                <span className="absolute top-4 right-5 font-heading font-extrabold text-4xl opacity-10">
                  {i + 1}
                </span>
                <span className="w-12 h-12 rounded-xl bg-primary/12 text-primary grid place-items-center mb-4">
                  {s.icon}
                </span>
                <h3 className="font-heading font-bold mb-1.5">{s.title}</h3>
                <p className="text-sm opacity-70 leading-relaxed">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  return (
    <section className="section-pad container-px">
      <div className="text-center max-w-2xl mx-auto mb-11">
        <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Popular Categories</p>
        <h2 className="page-h2">What do you need fixed today?</h2>
      </div>
      <div className="grid gap-5 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c} delay={i * 55} className="h-full">
            <Link
              href={`/services?category=${encodeURIComponent(c)}`}
              className="card-surface p-5 h-full flex flex-col items-center text-center gap-3 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md transition group"
            >
              <span className="w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary grid place-items-center group-hover:from-primary group-hover:to-accent group-hover:text-white transition">
                {CATEGORY_ICON[c]}
              </span>
              <span className="text-xs font-bold leading-tight">{c}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const WHY = [
  {
    icon: <ShieldCheck size={22} />,
    title: "Verified Technicians",
    text: "Every specialist is reviewed and approved by our admin team before listing.",
  },
  {
    icon: <Clock3 size={22} />,
    title: "Live Job Tracking",
    text: "A clear status pipeline keeps you updated from request to completion.",
  },
  {
    icon: <BadgeDollarSign size={22} />,
    title: "Pay After Service",
    text: "Money moves only when the job is marked completed — never before.",
  },
  {
    icon: <Headset size={22} />,
    title: "Support That Cares",
    text: "Real humans backing every repair, with fair dispute handling.",
  },
];

const TESTIMONIALS = [
  {
    name: "Nusrat Jahan",
    area: "Dhanmondi, Dhaka",
    text: "My iPhone screen was replaced the same evening. I could track every step and paid afterwards — zero stress.",
  },
  {
    name: "Tanvir Hasan",
    area: "Uttara, Dhaka",
    text: "The AC servicing was thorough and the price matched the quote. The pay-after-service model won me over.",
  },
  {
    name: "Arif Mahmud",
    area: "Mirpur, Dhaka",
    text: "As a technician, FixMate brings me steady, organized jobs. The dashboard makes managing requests effortless.",
  },
];

export function WhyUsSection() {
  return (
    <section className="section-pad bg-base-200/60 border-y border-base-300">
      <div className="container-px grid gap-12 lg:grid-cols-2 items-start">
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Why Choose Us</p>
          <h2 className="page-h2 mb-7">Built on trust, designed for peace of mind</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 70} className="h-full">
                <div className="card-surface p-5 h-full hover-lift">
                  <span className="w-11 h-11 rounded-xl bg-primary/12 text-primary grid place-items-center mb-3">
                    {w.icon}
                  </span>
                  <h3 className="font-heading font-bold text-sm md:text-base">{w.title}</h3>
                  <p className="text-xs md:text-sm opacity-70 mt-1.5 leading-relaxed">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-7">
            {[
              { to: 50, suffix: "+", label: "Verified techs" },
              { to: 2000, suffix: "+", label: "Jobs completed" },
              { to: 4.9, suffix: "★", decimals: 1, label: "Avg. rating" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="card-surface p-4 text-center hover-lift">
                  <p className="font-heading font-extrabold text-xl text-primary">
                    <CountUp to={s.to} suffix={s.suffix} decimals={s.decimals ?? 0} />
                  </p>
                  <p className="text-[11px] opacity-65 mt-1">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <figure className="card-surface p-6 hover-lift">
                <div className="flex text-secondary mb-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} size={15} className="fill-current" />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed opacity-85">“{t.text}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-primary/15 text-primary grid place-items-center text-xs font-bold">
                    {t.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs opacity-60">{t.area}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
