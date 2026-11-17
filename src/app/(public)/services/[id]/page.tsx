import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Home,
  Store,
  MapPin,
  ShieldCheck,
  Star,
  BadgeDollarSign,
  ChevronRight,
} from "lucide-react";
import { ServiceCard } from "@/components/services/ServiceCard";
import { RequestRepairButton } from "@/components/services/RequestRepairButton";
import { Avatar } from "@/components/ui/Avatar";
import { serverFetch } from "@/lib/server/api";
import { money, cn } from "@/lib/utils";
import { Service, PagedServices } from "@/lib/types";

export const dynamic = "force-dynamic";

interface TechnicianSummary {
  name: string;
  image: string | null;
  area: string;
  bio: string;
}

async function getService(id: string): Promise<{ service: Service; technician: TechnicianSummary } | null> {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
  return serverFetch<{ service: Service; technician: TechnicianSummary }>(`/services/${id}`);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const data = await getService(id);
  return { title: data ? data.service.title : "Service not found" };
}

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getService(id);
  if (!data) notFound();
  const { service, technician } = data;

  return (
    <div className="container-px py-8 md:py-12">
      <nav className="text-xs opacity-70 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight size={12} />
        <Link href="/services" className="hover:text-primary">
          Services
        </Link>
        <ChevronRight size={12} />
        <span className="font-semibold">{service.category}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-7">
          <div className="card-surface overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge badge-primary badge-soft">{service.category}</span>
              <span className="badge badge-ghost gap-1">
                {service.serviceMode === "Home Visit" ? <Home size={12} /> : <Store size={12} />}
                {service.serviceMode}
              </span>
              {service.ratingAvg ? (
                <span className="badge badge-secondary badge-soft gap-1">
                  <Star size={12} className="fill-current" />
                  {service.ratingAvg} ({service.ratingCount || 0})
                </span>
              ) : null}
            </div>
            <h1 className="page-h1 text-2xl md:text-4xl">{service.title}</h1>
            <p className="mt-4 leading-relaxed opacity-80 whitespace-pre-line">{service.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Clock size={18} />, label: "Est. duration", value: service.estimatedDuration },
              {
                icon: service.serviceMode === "Home Visit" ? <Home size={18} /> : <Store size={18} />,
                label: "Service mode",
                value: service.serviceMode,
              },
              { icon: <MapPin size={18} />, label: "Service area", value: service.serviceArea },
              {
                icon: <BadgeDollarSign size={18} />,
                label: "Starting price",
                value: money(service.basePrice),
              },
            ].map((info) => (
              <div key={info.label} className="card-surface p-4">
                <span className="text-primary mb-2 block">{info.icon}</span>
                <p className="text-[11px] font-semibold uppercase tracking-wide opacity-60">{info.label}</p>
                <p className="text-sm font-bold mt-1 truncate">{info.value}</p>
              </div>
            ))}
          </div>

          <div className="card-surface p-6">
            <h2 className="font-heading font-bold mb-4">About the technician</h2>
            <div className="flex items-start gap-4">
              <Avatar src={technician.image} name={technician.name} size="lg" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-heading font-bold">{technician.name}</p>
                  <span className="badge badge-success badge-soft badge-sm gap-1">
                    <ShieldCheck size={12} /> Verified
                  </span>
                </div>
                <p className="text-xs opacity-65 mt-1 inline-flex items-center gap-1">
                  <MapPin size={12} /> {technician.area || service.serviceArea}
                </p>
                <p className="text-sm opacity-80 mt-2.5 leading-relaxed">
                  {technician.bio || "Experienced repair specialist serving the local community with verified, warranty-backed work."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-2">
          <div className="card-surface p-6 lg:sticky lg:top-24 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Starting at</p>
              <p className="font-heading text-4xl font-extrabold text-primary mt-1">
                {money(service.basePrice)}
              </p>
              <p className="text-xs opacity-65 mt-1">
                Final amount is set by the technician after completion.
              </p>
            </div>

            <RequestRepairButton serviceId={service._id} />

            <ul className="space-y-3 pt-2 border-t border-base-300">
              {[
                ["ShieldCheck", "Admin-approved, verified technician"],
                ["Clock", `Usually completed in ${service.estimatedDuration}`],
                ["BadgeDollarSign", "Pay online only after the job is done"],
                ["MapPin", `Covers ${service.serviceArea}`],
              ].map(([_, text]) => (
                <li key={text} className="flex items-start gap-2.5 text-sm opacity-80">
                  <ShieldCheck size={15} className="text-success mt-0.5 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>

            <p className={cn("text-[11px] leading-relaxed opacity-60 text-center")}>
              Free to request · Cancel anytime while the job is still &ldquo;Requested&rdquo;
            </p>
          </div>
        </aside>
      </div>

      <section className="mt-16">
        <h2 className="page-h2 mb-6">You may also like</h2>
        <RelatedServices currentId={service._id} category={service.category} />
      </section>
    </div>
  );
}

async function RelatedServices({ currentId, category }: { currentId: string; category: string }) {
  const json = await serverFetch<PagedServices>(
    `/services?category=${encodeURIComponent(category)}&limit=4`
  );
  const list: Service[] = (json?.services ?? []).filter((s) => s._id !== currentId).slice(0, 3);
  if (!list.length) return null;
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((s) => (
        <ServiceCard key={s._id} service={s} />
      ))}
    </div>
  );
}
