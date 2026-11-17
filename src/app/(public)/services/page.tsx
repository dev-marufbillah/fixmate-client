import type { Metadata } from "next";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServicesToolbar } from "@/components/services/ServicesToolbar";
import { Pagination } from "@/components/services/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { serverFetch } from "@/lib/server/api";
import { PagedServices } from "@/lib/types";
import { SearchX, ServerOff, Wrench } from "lucide-react";

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

async function getServices(sp: Search): Promise<{ data: PagedServices; reachable: boolean }> {
  const empty: PagedServices = { services: [], total: 0, page: 1, pages: 1 };
  const params = new URLSearchParams();
  if (sp.search) params.set("search", sp.search);
  if (sp.category && sp.category !== "All") params.set("category", sp.category);
  if (sp.serviceMode && sp.serviceMode !== "All") params.set("serviceMode", sp.serviceMode);
  if (sp.sort) params.set("sort", sp.sort);
  params.set("page", sp.page || "1");
  params.set("limit", "12");
  const data = await serverFetch<PagedServices>(`/services?${params.toString()}`);
  // data === null means the API itself could not be reached (not "no matches")
  return { data: data || empty, reachable: data !== null };
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const { data, reachable } = await getServices(sp);
  const { services, total, page, pages } = data;

  // Same URL to retry with the current filters when the API is down
  const retryQs = new URLSearchParams();
  if (sp.search) retryQs.set("search", sp.search);
  if (sp.category && sp.category !== "All") retryQs.set("category", sp.category);
  if (sp.serviceMode && sp.serviceMode !== "All") retryQs.set("serviceMode", sp.serviceMode);
  if (sp.sort) retryQs.set("sort", sp.sort);
  const retryHref = retryQs.toString() ? `/services?${retryQs.toString()}` : "/services";
  const hasFilters = Boolean(
    sp.search ||
      (sp.category && sp.category !== "All") ||
      (sp.serviceMode && sp.serviceMode !== "All") ||
      sp.sort
  );

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
            {services.map((s, i) => (
              <Reveal key={s._id} delay={(i % 9) * 60} className="h-full">
                <ServiceCard service={s} />
              </Reveal>
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
      ) : !reachable ? (
        <EmptyState
          icon={<ServerOff size={30} />}
          title="We couldn't load services right now"
          description="The FixMate API isn't responding. Running locally? Make sure terminal 1 (npm run db:local) and terminal 2 (npm run dev in Assignment-9/server) are running, seed once with npm run seed, then try again."
          actionLabel="Try again"
          actionHref={retryHref}
        />
      ) : total === 0 && !hasFilters ? (
        <EmptyState
          icon={<Wrench size={30} />}
          title="No services in the database yet"
          description="Running FixMate locally? Seed the demo data first — in Assignment-9/client run: npm run seed (with terminals 1 & 2 running), then reload this page. You should see 20+ service cards."
          actionLabel="Reload page"
          actionHref={retryHref}
        />
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
