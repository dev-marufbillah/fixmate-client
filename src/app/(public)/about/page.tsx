import Link from "next/link";
import type { Metadata } from "next";
import {
  Search,
  Send,
  Wrench,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Wallet,
  ListChecks,
  Lock,
  ChevronDown,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how FixMate connects customers with verified repair technicians — request, track, and pay only after the job is completed.",
};

const STEPS = [
  {
    icon: <Search size={26} />,
    title: "1 · Find a Service",
    text: "Browse approved services across 7 categories — smartphone, laptop, AC, refrigerator, TV, washing machine and electrical. Search, filter and sort until the right fit appears.",
  },
  {
    icon: <Send size={26} />,
    title: "2 · Send a Request",
    text: "Open a service, tap Request Repair, and share your phone, address, preferred date and a short problem description. No payment is needed to get started.",
  },
  {
    icon: <Wrench size={26} />,
    title: "3 · Technician Fixes It",
    text: "The technician accepts the job and walks it through Accepted → In Progress → Completed. You watch every step live in My Bookings.",
  },
  {
    icon: <CreditCard size={26} />,
    title: "4 · Pay After Completion",
    text: "Only when the job is marked completed does the Pay Now button appear. Pay securely with Stripe — card, in test mode 4242 4242 4242 4242.",
  },
];

const FAQS = [
  {
    q: "Do I pay before the repair starts?",
    a: "No. FixMate is strictly pay-after-service. The Pay Now button only appears once the technician marks your job as completed.",
  },
  {
    q: "How do I know the technician is trustworthy?",
    a: "Every technician goes through admin approval. Services stay hidden until an admin verifies and approves each listing.",
  },
  {
    q: "Can I track my repair job?",
    a: "Yes — each job moves through a status pipeline (Requested → Accepted → In Progress → Completed → Paid) with timestamps you can see in your dashboard.",
  },
  {
    q: "What if I need to cancel?",
    a: "You can cancel free of charge any time while the job is still in the Requested state, directly from My Bookings.",
  },
  {
    q: "Which devices do you cover?",
    a: "Smartphones, laptops & PCs, ACs, refrigerators, TVs, washing machines and general home electrical work.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-base-300 bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10">
        <div className="container-px py-16 md:py-20 text-center max-w-3xl mx-auto">
          <span className="badge badge-primary badge-soft mb-4">How It Works</span>
          <h1 className="page-h1">Repair without the guesswork</h1>
          <p className="mt-4 opacity-75 text-lg leading-relaxed">
            FixMate removes the two biggest headaches of device repair — finding someone you can trust,
            and paying before anything is fixed.
          </p>
        </div>
      </section>

      <section className="section-pad container-px">
        <div className="grid gap-6 md:grid-cols-2">
          {STEPS.map((s) => (
            <div key={s.title} className="card-surface p-7 flex gap-5">
              <span className="w-14 h-14 shrink-0 rounded-2xl bg-primary/12 text-primary grid place-items-center">
                {s.icon}
              </span>
              <div>
                <h2 className="font-heading font-bold text-lg mb-2">{s.title}</h2>
                <p className="text-sm opacity-75 leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad bg-base-200/60 border-y border-base-300">
        <div className="container-px grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
              Pay after service
            </p>
            <h2 className="page-h2 mb-5">Your money stays safe until the job is done</h2>
            <ul className="space-y-4">
              {[
                {
                  icon: <Lock size={18} />,
                  t: "No advance payments",
                  d: "Request repairs for free — your card is only asked for at the very end.",
                },
                {
                  icon: <ListChecks size={18} />,
                  t: "Server-enforced pipeline",
                  d: "Jobs can only move one step at a time, and only the owning technician can move them.",
                },
                {
                  icon: <Wallet size={18} />,
                  t: "Stripe-secured checkout",
                  d: "Every payment is verified server-side and recorded exactly once.",
                },
              ].map((f) => (
                <li key={f.t} className="flex gap-4">
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-success/15 text-success grid place-items-center">
                    {f.icon}
                  </span>
                  <div>
                    <p className="font-bold text-sm">{f.t}</p>
                    <p className="text-sm opacity-70 mt-0.5">{f.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface p-6 md:p-8">
            <p className="font-heading font-bold mb-6 text-center">Job status pipeline</p>
            <ol className="space-y-0">
              {[
                ["Requested", "You describe the problem and send the request.", "badge-info badge-soft"],
                ["Accepted", "The technician accepts your job.", "badge-indigo"],
                ["In Progress", "Repair underway — track it live.", "badge-warning badge-soft"],
                ["Completed", "Technician sets the final amount.", "badge-success badge-soft"],
                ["Paid", "You pay with Stripe — receipt saved.", "badge-success"],
              ].map(([label, text, cls], i, arr) => (
                <li key={label as string} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={`badge ${cls} badge-sm whitespace-nowrap`}>{label}</span>
                    {i < arr.length - 1 && <span className="w-px h-10 bg-base-300 my-1" />}
                  </div>
                  <p className="text-sm opacity-70 pb-6 pt-0.5">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section-pad container-px">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">FAQ</p>
          <h2 className="page-h2">Questions, answered</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((f) => (
            <div key={f.q} className="collapse collapse-arrow card-surface">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title font-heading font-semibold text-base md:text-lg">{f.q}</div>
              <div className="collapse-content">
                <p className="text-sm opacity-75 leading-relaxed">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-px pb-20">
        <div className="card-surface bg-gradient-to-r from-primary to-accent text-primary-content p-8 md:p-12 text-center border-0">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/15 grid place-items-center mb-5">
            <ShieldCheck size={28} />
          </div>
          <h2 className="page-h2 text-white">Ready to get something fixed?</h2>
          <p className="mt-3 opacity-90 max-w-xl mx-auto">
            Browse verified technicians near you and send your first repair request in under a minute.
          </p>
          <Link href="/services" className="btn bg-white text-primary hover:bg-white/90 rounded-xl px-8 mt-7 border-0 h-11 font-semibold gap-2">
            Browse Services <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
