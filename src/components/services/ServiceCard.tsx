import Link from "next/link";
import { MapPin, User, Star, Home, Store } from "lucide-react";
import { Service } from "@/lib/types";
import { money, cn } from "@/lib/utils";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="card-surface overflow-hidden h-full flex flex-col group">
      <div className="relative aspect-[16/10] overflow-hidden bg-base-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.image}
          alt={service.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <span className="absolute top-3 left-3 badge badge-sm bg-base-100/90 text-base-content border-0 backdrop-blur">
          {service.category}
        </span>
        {service.ratingAvg ? (
          <span className="absolute top-3 right-3 badge badge-sm bg-base-100/90 text-base-content border-0 backdrop-blur gap-1">
            <Star size={12} className="fill-secondary text-secondary" />
            {service.ratingAvg}
            <span className="opacity-50">({service.ratingCount || 0})</span>
          </span>
        ) : null}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs mb-2.5">
          <span
            className={cn(
              "badge badge-ghost badge-sm gap-1",
              service.serviceMode === "Home Visit" ? "" : ""
            )}
          >
            {service.serviceMode === "Home Visit" ? <Home size={11} /> : <Store size={11} />}
            {service.serviceMode}
          </span>
          <span className="inline-flex items-center gap-1 opacity-65 truncate">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{service.serviceArea}</span>
          </span>
        </div>

        <h3 className="font-heading font-bold text-lg leading-snug line-clamp-2">{service.title}</h3>
        <p className="text-xs opacity-65 mt-2 inline-flex items-center gap-1.5">
          <User size={13} /> {service.technicianName}
        </p>

        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold opacity-55">Starting at</p>
            <p className="font-heading font-extrabold text-primary text-lg leading-none mt-1">
              {money(service.basePrice)}
            </p>
          </div>
          <Link href={`/services/${service._id}`} className="btn btn-primary btn-sm rounded-lg px-4">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
