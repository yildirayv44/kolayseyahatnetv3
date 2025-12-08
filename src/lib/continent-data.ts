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
  // Europe - Avrupa
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
  'Çekya': CONTINENTS.EUROPE,
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
  'Arnavutluk': CONTINENTS.EUROPE,
  'Andorra': CONTINENTS.EUROPE,
  'Belarus': CONTINENTS.EUROPE,
  'Bosna-Hersek': CONTINENTS.EUROPE,
  'Bosna Hersek': CONTINENTS.EUROPE,
  'Kıbrıs': CONTINENTS.EUROPE,
  'Kıbrıs (Kuzey)': CONTINENTS.EUROPE,
  'Kosova': CONTINENTS.EUROPE,
  'Liechtenstein': CONTINENTS.EUROPE,
  'Lüksemburg': CONTINENTS.EUROPE,
  'Malta': CONTINENTS.EUROPE,
  'Moldova': CONTINENTS.EUROPE,
  'Monako': CONTINENTS.EUROPE,
  'Karadağ': CONTINENTS.EUROPE,
  'Kuzey Makedonya': CONTINENTS.EUROPE,
  'San Marino': CONTINENTS.EUROPE,
  'Sırbistan': CONTINENTS.EUROPE,
  
  // Asia - Asya
  'Japonya': CONTINENTS.ASIA,
  'Güney Kore': CONTINENTS.ASIA,
  'Kuzey Kore': CONTINENTS.ASIA,
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
  'Afganistan': CONTINENTS.ASIA,
  'Azerbaycan': CONTINENTS.ASIA,
  'Ermenistan': CONTINENTS.ASIA,
  'Gürcistan': CONTINENTS.ASIA,
  'Kazakistan': CONTINENTS.ASIA,
  'Kırgızistan': CONTINENTS.ASIA,
  'Moğolistan': CONTINENTS.ASIA,
  'Özbekistan': CONTINENTS.ASIA,
  'Tacikistan': CONTINENTS.ASIA,
  'Türkmenistan': CONTINENTS.ASIA,
  'Tayvan': CONTINENTS.ASIA,
  'Brunei': CONTINENTS.ASIA,
  'Doğu Timor': CONTINENTS.ASIA,
  'Makao': CONTINENTS.ASIA,
  'Maldivler': CONTINENTS.ASIA,
  
  // Middle East - Orta Doğu
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
  'Irak': CONTINENTS.MIDDLE_EAST,
  'İran': CONTINENTS.MIDDLE_EAST,
  'Suriye': CONTINENTS.MIDDLE_EAST,
  'Yemen': CONTINENTS.MIDDLE_EAST,
  'Filistin': CONTINENTS.MIDDLE_EAST,
  
  // North America - Kuzey Amerika
  'Amerika': CONTINENTS.NORTH_AMERICA,
  'Amerika Birleşik Devletleri': CONTINENTS.NORTH_AMERICA,
  'ABD': CONTINENTS.NORTH_AMERICA,
  'Kanada': CONTINENTS.NORTH_AMERICA,
  'Meksika': CONTINENTS.NORTH_AMERICA,
  'Antigua ve Barbuda': CONTINENTS.NORTH_AMERICA,
  'Bahamas': CONTINENTS.NORTH_AMERICA,
  'Bahama': CONTINENTS.NORTH_AMERICA,
  'Barbados': CONTINENTS.NORTH_AMERICA,
  'Belize': CONTINENTS.NORTH_AMERICA,
  'Kosta Rika': CONTINENTS.NORTH_AMERICA,
  'Küba': CONTINENTS.NORTH_AMERICA,
  'Dominik': CONTINENTS.NORTH_AMERICA,
  'Dominik Cumhuriyeti': CONTINENTS.NORTH_AMERICA,
  'El Salvador': CONTINENTS.NORTH_AMERICA,
  'Grenada': CONTINENTS.NORTH_AMERICA,
  'Guatemala': CONTINENTS.NORTH_AMERICA,
  'Haiti': CONTINENTS.NORTH_AMERICA,
  'Honduras': CONTINENTS.NORTH_AMERICA,
  'Jamaika': CONTINENTS.NORTH_AMERICA,
  'Nikaragua': CONTINENTS.NORTH_AMERICA,
  'Panama': CONTINENTS.NORTH_AMERICA,
  'Saint Kitts ve Nevis': CONTINENTS.NORTH_AMERICA,
  'Saint Lucia': CONTINENTS.NORTH_AMERICA,
  'Saint Vincent ve Grenadinler': CONTINENTS.NORTH_AMERICA,
  'Trinidad ve Tobago': CONTINENTS.NORTH_AMERICA,
  
  // South America - Güney Amerika
  'Brezilya': CONTINENTS.SOUTH_AMERICA,
  'Arjantin': CONTINENTS.SOUTH_AMERICA,
  'Şili': CONTINENTS.SOUTH_AMERICA,
  'Peru': CONTINENTS.SOUTH_AMERICA,
  'Kolombiya': CONTINENTS.SOUTH_AMERICA,
  'Ekvador': CONTINENTS.SOUTH_AMERICA,
  'Bolivya': CONTINENTS.SOUTH_AMERICA,
  'Guyana': CONTINENTS.SOUTH_AMERICA,
  'Paraguay': CONTINENTS.SOUTH_AMERICA,
  'Surinam': CONTINENTS.SOUTH_AMERICA,
  'Uruguay': CONTINENTS.SOUTH_AMERICA,
  'Venezuela': CONTINENTS.SOUTH_AMERICA,
  'Fransız Guyanası': CONTINENTS.SOUTH_AMERICA,
  
  // Oceania - Okyanusya
  'Avustralya': CONTINENTS.OCEANIA,
  'Yeni Zelanda': CONTINENTS.OCEANIA,
  'Fiji': CONTINENTS.OCEANIA,
  'Kiribati': CONTINENTS.OCEANIA,
  'Marshall Adaları': CONTINENTS.OCEANIA,
  'Mikronezya': CONTINENTS.OCEANIA,
  'Nauru': CONTINENTS.OCEANIA,
  'Palau': CONTINENTS.OCEANIA,
  'Papua Yeni Gine': CONTINENTS.OCEANIA,
  'Samoa': CONTINENTS.OCEANIA,
  'Solomon Adaları': CONTINENTS.OCEANIA,
  'Tonga': CONTINENTS.OCEANIA,
  'Tuvalu': CONTINENTS.OCEANIA,
  'Vanuatu': CONTINENTS.OCEANIA,
  'Fransız Polinezyası': CONTINENTS.OCEANIA,
  'Yeni Kaledonya': CONTINENTS.OCEANIA,
  
  // Africa - Afrika
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
  'Angola': CONTINENTS.AFRICA,
  'Burkina Faso': CONTINENTS.AFRICA,
  'Burundi': CONTINENTS.AFRICA,
  'Cape Verde': CONTINENTS.AFRICA,
  'Orta Afrika Cumhuriyeti': CONTINENTS.AFRICA,
  'Çad': CONTINENTS.AFRICA,
  'Kongo': CONTINENTS.AFRICA,
  'Kongo Demokratik Cumhuriyeti': CONTINENTS.AFRICA,
  'Cibuti': CONTINENTS.AFRICA,
  'Ekvator Ginesi': CONTINENTS.AFRICA,
  'Eritre': CONTINENTS.AFRICA,
  'Etiyopya': CONTINENTS.AFRICA,
  'Gabon': CONTINENTS.AFRICA,
  'Gambiya': CONTINENTS.AFRICA,
  'Gine': CONTINENTS.AFRICA,
  'Gine-Bissau': CONTINENTS.AFRICA,
  'Lesotho': CONTINENTS.AFRICA,
  'Liberya': CONTINENTS.AFRICA,
  'Libya': CONTINENTS.AFRICA,
  'Madagaskar': CONTINENTS.AFRICA,
  'Malawi': CONTINENTS.AFRICA,
  'Mali': CONTINENTS.AFRICA,
  'Moritanya': CONTINENTS.AFRICA,
  'Mauritius': CONTINENTS.AFRICA,
  'Mozambik': CONTINENTS.AFRICA,
  'Namibya': CONTINENTS.AFRICA,
  'Nijer': CONTINENTS.AFRICA,
  'Ruanda': CONTINENTS.AFRICA,
  'Sao Tome ve Principe': CONTINENTS.AFRICA,
  'Senegal': CONTINENTS.AFRICA,
  'Seyşeller': CONTINENTS.AFRICA,
  'Sierra Leone': CONTINENTS.AFRICA,
  'Somali': CONTINENTS.AFRICA,
  'Güney Sudan': CONTINENTS.AFRICA,
  'Sudan': CONTINENTS.AFRICA,
  'Svaziland': CONTINENTS.AFRICA,
  'Cezayir': CONTINENTS.AFRICA,
  'Tunus': CONTINENTS.AFRICA,
  'Botsvana': CONTINENTS.AFRICA,
  'Kamerun': CONTINENTS.AFRICA,
  'Fildişi Sahili': CONTINENTS.AFRICA,
  'Komorlar': CONTINENTS.AFRICA,
  'Zimbabve': CONTINENTS.AFRICA,
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
