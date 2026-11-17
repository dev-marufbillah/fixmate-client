import type { Metadata } from "next";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServicesToolbar } from "@/components/services/ServicesToolbar";
import { Pagination } from "@/components/services/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { serverFetch } from "@/lib/server/api";
import { PagedServices } from "@/lib/types";
import { SearchX } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Services",
  description:
    "Search, filter and sort verified repair services for smartphones, laptops, ACs, refrigerators, TVs, washing machines and electrical work.",
};

interface Search {
  search?: string;
  category?: string;
  serviceMode?: string;
  sort?: string;
  page?: string;
}

async function getServices(sp: Search): Promise<PagedServices> {
  const empty: PagedServices = { services: [], total: 0, page: 1, pages: 1 };
  const params = new URLSearchParams();
  if (sp.search) params.set("search", sp.search);
  if (sp.category && sp.category !== "All") params.set("category", sp.category);
  if (sp.serviceMode && sp.serviceMode !== "All") params.set("serviceMode", sp.serviceMode);
  if (sp.sort) params.set("sort", sp.sort);
  params.set("page", sp.page || "1");
  params.set("limit", "9");
  const data = await serverFetch<PagedServices>(`/services?${params.toString()}`);
  return data || empty;
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const { services, total, page, pages } = await getServices(sp);

  return (
    <div className="container-px py-10 md:py-14">
      <div className="mb-8">
        <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Services</p>
        <h1 className="page-h1 text-3xl md:text-4xl">All Repair Services</h1>
        <p className="opacity-70 mt-3 max-w-2xl">
          Every listing below is approved by our admins and currently available. Search, filter and
          sort — results update instantly on the server.
        </p>
      </div>

      <ServicesToolbar
        values={{
          search: sp.search || "",
          category: sp.category || "All",
          serviceMode: sp.serviceMode || "All",
          sort: sp.sort || "",
        }}
        total={total}
      />

      {services.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s._id} service={s} />
            ))}
          </div>
          <Pagination
            page={page}
            pages={pages}
            query={{
              search: sp.search,
              category: sp.category,
              serviceMode: sp.serviceMode,
              sort: sp.sort,
            }}
          />
        </>
      ) : (
        <EmptyState
          icon={<SearchX size={30} />}
          title="No services match your search"
          description="Try a different keyword, category or service mode — or clear all filters to start fresh."
          actionLabel="Clear filters"
          actionHref="/services"
        />
      )}
    </div>
  );
}
