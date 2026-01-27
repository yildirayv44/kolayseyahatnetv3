import { getCountries } from "@/lib/queries";
import { CountriesListWithFilters } from "@/components/admin/CountriesListWithFilters";

// Admin panelde cache olmamalı - her zaman güncel veri göster
export const dynamic = 'force-dynamic';

export default async function CountriesPage() {
  const countries = await getCountries();

  return (
    <CountriesListWithFilters initialCountries={countries as any} />
  );
}
