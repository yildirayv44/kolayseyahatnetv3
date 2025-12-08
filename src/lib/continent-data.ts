/**
 * Continent mapping for countries
 */

export const CONTINENTS = {
  EUROPE: 'Avrupa',
  ASIA: 'Asya',
  AFRICA: 'Afrika',
  NORTH_AMERICA: 'Kuzey Amerika',
  SOUTH_AMERICA: 'Güney Amerika',
  OCEANIA: 'Okyanusya',
  MIDDLE_EAST: 'Orta Doğu',
} as const;

export type Continent = typeof CONTINENTS[keyof typeof CONTINENTS];

export const COUNTRY_TO_CONTINENT: Record<string, Continent> = {
  // Europe
  'İngiltere': CONTINENTS.EUROPE,
  'Almanya': CONTINENTS.EUROPE,
  'Fransa': CONTINENTS.EUROPE,
  'İtalya': CONTINENTS.EUROPE,
  'İspanya': CONTINENTS.EUROPE,
  'Hollanda': CONTINENTS.EUROPE,
  'Belçika': CONTINENTS.EUROPE,
  'İsviçre': CONTINENTS.EUROPE,
  'Avusturya': CONTINENTS.EUROPE,
  'Portekiz': CONTINENTS.EUROPE,
  'İrlanda': CONTINENTS.EUROPE,
  'Norveç': CONTINENTS.EUROPE,
  'İsveç': CONTINENTS.EUROPE,
  'Danimarka': CONTINENTS.EUROPE,
  'Finlandiya': CONTINENTS.EUROPE,
  'İzlanda': CONTINENTS.EUROPE,
  'Yunanistan': CONTINENTS.EUROPE,
  'Polonya': CONTINENTS.EUROPE,
  'Çek Cumhuriyeti': CONTINENTS.EUROPE,
  'Macaristan': CONTINENTS.EUROPE,
  'Romanya': CONTINENTS.EUROPE,
  'Bulgaristan': CONTINENTS.EUROPE,
  'Hırvatistan': CONTINENTS.EUROPE,
  'Slovenya': CONTINENTS.EUROPE,
  'Slovakya': CONTINENTS.EUROPE,
  'Estonya': CONTINENTS.EUROPE,
  'Letonya': CONTINENTS.EUROPE,
  'Litvanya': CONTINENTS.EUROPE,
  'Rusya': CONTINENTS.EUROPE,
  'Ukrayna': CONTINENTS.EUROPE,
  'Vatikan': CONTINENTS.EUROPE,
  
  // Asia
  'Japonya': CONTINENTS.ASIA,
  'Güney Kore': CONTINENTS.ASIA,
  'Çin': CONTINENTS.ASIA,
  'Hong Kong': CONTINENTS.ASIA,
  'Singapur': CONTINENTS.ASIA,
  'Tayland': CONTINENTS.ASIA,
  'Vietnam': CONTINENTS.ASIA,
  'Endonezya': CONTINENTS.ASIA,
  'Malezya': CONTINENTS.ASIA,
  'Filipinler': CONTINENTS.ASIA,
  'Bhutan': CONTINENTS.ASIA,
  'Nepal': CONTINENTS.ASIA,
  'Sri Lanka': CONTINENTS.ASIA,
  'Hindistan': CONTINENTS.ASIA,
  'Pakistan': CONTINENTS.ASIA,
  'Bangladeş': CONTINENTS.ASIA,
  'Myanmar': CONTINENTS.ASIA,
  'Kamboçya': CONTINENTS.ASIA,
  'Laos': CONTINENTS.ASIA,
  
  // Middle East
  'Dubai': CONTINENTS.MIDDLE_EAST,
  'Birleşik Arap Emirlikleri': CONTINENTS.MIDDLE_EAST,
  'Katar': CONTINENTS.MIDDLE_EAST,
  'Bahreyn': CONTINENTS.MIDDLE_EAST,
  'Kuveyt': CONTINENTS.MIDDLE_EAST,
  'Umman': CONTINENTS.MIDDLE_EAST,
  'İsrail': CONTINENTS.MIDDLE_EAST,
  'Suudi Arabistan': CONTINENTS.MIDDLE_EAST,
  'Ürdün': CONTINENTS.MIDDLE_EAST,
  'Lübnan': CONTINENTS.MIDDLE_EAST,
  
  // North America
  'Amerika': CONTINENTS.NORTH_AMERICA,
  'Kanada': CONTINENTS.NORTH_AMERICA,
  'Meksika': CONTINENTS.NORTH_AMERICA,
  
  // South America
  'Brezilya': CONTINENTS.SOUTH_AMERICA,
  'Arjantin': CONTINENTS.SOUTH_AMERICA,
  'Şili': CONTINENTS.SOUTH_AMERICA,
  'Peru': CONTINENTS.SOUTH_AMERICA,
  'Kolombiya': CONTINENTS.SOUTH_AMERICA,
  'Ekvador': CONTINENTS.SOUTH_AMERICA,
  
  // Oceania
  'Avustralya': CONTINENTS.OCEANIA,
  'Yeni Zelanda': CONTINENTS.OCEANIA,
  
  // Africa
  'Güney Afrika': CONTINENTS.AFRICA,
  'Mısır': CONTINENTS.AFRICA,
  'Fas': CONTINENTS.AFRICA,
  'Kenya': CONTINENTS.AFRICA,
  'Tanzanya': CONTINENTS.AFRICA,
  'Togo': CONTINENTS.AFRICA,
  'Benin': CONTINENTS.AFRICA,
  'Uganda': CONTINENTS.AFRICA,
  'Zambiya': CONTINENTS.AFRICA,
  'Nijerya': CONTINENTS.AFRICA,
  'Gana': CONTINENTS.AFRICA,
};

export function getContinent(countryName: string): Continent | null {
  return COUNTRY_TO_CONTINENT[countryName] || null;
}

export function getCountriesByContinent(countries: any[]): Record<Continent, any[]> {
  const grouped: Record<string, any[]> = {};
  
  // Initialize all continents
  Object.values(CONTINENTS).forEach(continent => {
    grouped[continent] = [];
  });
  
  // Group countries
  countries.forEach(country => {
    const continent = getContinent(country.name);
    if (continent) {
      grouped[continent].push(country);
    } else {
      // Default to appropriate continent or create "Diğer"
      if (!grouped['Diğer']) grouped['Diğer'] = [];
      grouped['Diğer'].push(country);
    }
  });
  
  // Remove empty groups
  Object.keys(grouped).forEach(key => {
    if (grouped[key].length === 0) {
      delete grouped[key];
    }
  });
  
  return grouped as Record<Continent, any[]>;
}
