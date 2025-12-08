import { getCountries } from "@/lib/queries";
import { CountriesListWithFilters } from "@/components/admin/CountriesListWithFilters";

export default async function CountriesPage() {
  const countries = await getCountries();

  return (
    <CountriesListWithFilters initialCountries={countries as any} />
  );
}
