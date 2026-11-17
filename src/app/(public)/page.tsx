import { Hero, FeaturedServices, HowItWorks, CategoriesSection, WhyUsSection } from "@/components/home/Sections";
import { serverFetch } from "@/lib/server/api";
import { PagedServices, Service } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getFeatured(): Promise<Service[] | null> {
  const data = await serverFetch<PagedServices>("/services?sort=newest&limit=6");
  return data?.services ?? null;
}

export default async function HomePage() {
  const services = await getFeatured();
  return (
    <>
      <Hero />
      <FeaturedServices services={services} />
      <HowItWorks />
      <CategoriesSection />
      <WhyUsSection />
    </>
  );
}
