/**
 * Maps country names/codes/aliases → { lat, lng, name }.
 * Used to resolve the free-text `location` field from job providers
 * into coordinates the 3D globe can animate to.
 */

export interface CountryCoord {
  lat: number;
  lng: number;
  name: string;
  /** ISO-3166-1 alpha-2 (uppercase) for matching GeoJSON features */
  iso: string;
}

/** Canonical country data keyed by ISO-3166-1 alpha-2 (lowercase). */
const COUNTRIES: Record<string, CountryCoord> = {
  us: { lat: 39.8, lng: -98.5, name: "United States", iso: "US" },
  gb: { lat: 54.0, lng: -2.0, name: "United Kingdom", iso: "GB" },
  uk: { lat: 54.0, lng: -2.0, name: "United Kingdom", iso: "GB" },
  de: { lat: 51.2, lng: 10.4, name: "Germany", iso: "DE" },
  fr: { lat: 46.6, lng: 2.2, name: "France", iso: "FR" },
  ca: { lat: 56.1, lng: -106.3, name: "Canada", iso: "CA" },
  au: { lat: -25.3, lng: 133.8, name: "Australia", iso: "AU" },
  br: { lat: -14.2, lng: -51.9, name: "Brazil", iso: "BR" },
  in: { lat: 20.6, lng: 78.9, name: "India", iso: "IN" },
  jp: { lat: 36.2, lng: 138.3, name: "Japan", iso: "JP" },
  cn: { lat: 35.9, lng: 104.2, name: "China", iso: "CN" },
  kr: { lat: 35.9, lng: 127.8, name: "South Korea", iso: "KR" },
  nl: { lat: 52.1, lng: 5.3, name: "Netherlands", iso: "NL" },
  es: { lat: 40.5, lng: -3.7, name: "Spain", iso: "ES" },
  it: { lat: 41.9, lng: 12.6, name: "Italy", iso: "IT" },
  pt: { lat: 39.4, lng: -8.2, name: "Portugal", iso: "PT" },
  se: { lat: 60.1, lng: 18.6, name: "Sweden", iso: "SE" },
  no: { lat: 60.5, lng: 8.5, name: "Norway", iso: "NO" },
  dk: { lat: 56.3, lng: 9.5, name: "Denmark", iso: "DK" },
  fi: { lat: 61.9, lng: 25.7, name: "Finland", iso: "FI" },
  ch: { lat: 46.8, lng: 8.2, name: "Switzerland", iso: "CH" },
  at: { lat: 47.5, lng: 14.6, name: "Austria", iso: "AT" },
  be: { lat: 50.5, lng: 4.5, name: "Belgium", iso: "BE" },
  ie: { lat: 53.1, lng: -7.7, name: "Ireland", iso: "IE" },
  pl: { lat: 51.9, lng: 19.1, name: "Poland", iso: "PL" },
  cz: { lat: 49.8, lng: 15.5, name: "Czech Republic", iso: "CZ" },
  ro: { lat: 45.9, lng: 24.97, name: "Romania", iso: "RO" },
  hu: { lat: 47.2, lng: 19.5, name: "Hungary", iso: "HU" },
  gr: { lat: 39.1, lng: 21.8, name: "Greece", iso: "GR" },
  tr: { lat: 38.96, lng: 35.24, name: "Turkey", iso: "TR" },
  il: { lat: 31.05, lng: 34.85, name: "Israel", iso: "IL" },
  ae: { lat: 23.4, lng: 53.85, name: "UAE", iso: "AE" },
  sa: { lat: 23.9, lng: 45.1, name: "Saudi Arabia", iso: "SA" },
  sg: { lat: 1.35, lng: 103.82, name: "Singapore", iso: "SG" },
  hk: { lat: 22.4, lng: 114.1, name: "Hong Kong", iso: "HK" },
  tw: { lat: 23.7, lng: 120.96, name: "Taiwan", iso: "TW" },
  nz: { lat: -40.9, lng: 174.89, name: "New Zealand", iso: "NZ" },
  mx: { lat: 23.63, lng: -102.55, name: "Mexico", iso: "MX" },
  ar: { lat: -38.42, lng: -63.62, name: "Argentina", iso: "AR" },
  cl: { lat: -35.68, lng: -71.54, name: "Chile", iso: "CL" },
  co: { lat: 4.57, lng: -74.3, name: "Colombia", iso: "CO" },
  za: { lat: -30.56, lng: 22.94, name: "South Africa", iso: "ZA" },
  ng: { lat: 9.08, lng: 8.68, name: "Nigeria", iso: "NG" },
  eg: { lat: 26.82, lng: 30.8, name: "Egypt", iso: "EG" },
  ke: { lat: -0.02, lng: 37.91, name: "Kenya", iso: "KE" },
  ph: { lat: 12.88, lng: 121.77, name: "Philippines", iso: "PH" },
  th: { lat: 15.87, lng: 100.99, name: "Thailand", iso: "TH" },
  vn: { lat: 14.06, lng: 108.28, name: "Vietnam", iso: "VN" },
  my: { lat: 4.21, lng: 101.98, name: "Malaysia", iso: "MY" },
  id: { lat: -0.79, lng: 113.92, name: "Indonesia", iso: "ID" },
  ua: { lat: 48.38, lng: 31.17, name: "Ukraine", iso: "UA" },
  ru: { lat: 61.52, lng: 105.32, name: "Russia", iso: "RU" },
  bg: { lat: 42.73, lng: 25.49, name: "Bulgaria", iso: "BG" },
  hr: { lat: 45.1, lng: 15.2, name: "Croatia", iso: "HR" },
  rs: { lat: 44.02, lng: 21.01, name: "Serbia", iso: "RS" },
  sk: { lat: 48.67, lng: 19.7, name: "Slovakia", iso: "SK" },
  lt: { lat: 55.17, lng: 23.88, name: "Lithuania", iso: "LT" },
  lv: { lat: 56.88, lng: 24.6, name: "Latvia", iso: "LV" },
  ee: { lat: 58.6, lng: 25.01, name: "Estonia", iso: "EE" },
  lu: { lat: 49.82, lng: 6.13, name: "Luxembourg", iso: "LU" },
  pk: { lat: 30.38, lng: 69.35, name: "Pakistan", iso: "PK" },
  bd: { lat: 23.68, lng: 90.36, name: "Bangladesh", iso: "BD" },
  pe: { lat: -9.19, lng: -75.02, name: "Peru", iso: "PE" },
  uy: { lat: -32.52, lng: -55.77, name: "Uruguay", iso: "UY" },
  cr: { lat: 9.75, lng: -83.75, name: "Costa Rica", iso: "CR" },
};

/**
 * Alias map: lowercase keyword → ISO code.
 * Covers full country names, common abbreviations, demonyms, and major cities.
 */
const ALIASES: Record<string, string> = {
  // Full names
  "united states": "us",
  "united states of america": "us",
  usa: "us",
  america: "us",
  "united kingdom": "gb",
  "great britain": "gb",
  england: "gb",
  scotland: "gb",
  wales: "gb",
  germany: "de",
  deutschland: "de",
  france: "fr",
  canada: "ca",
  australia: "au",
  brazil: "br",
  brasil: "br",
  india: "in",
  japan: "jp",
  china: "cn",
  "south korea": "kr",
  korea: "kr",
  netherlands: "nl",
  holland: "nl",
  spain: "es",
  italy: "it",
  portugal: "pt",
  sweden: "se",
  norway: "no",
  denmark: "dk",
  finland: "fi",
  switzerland: "ch",
  austria: "at",
  belgium: "be",
  ireland: "ie",
  poland: "pl",
  "czech republic": "cz",
  czechia: "cz",
  romania: "ro",
  hungary: "hu",
  greece: "gr",
  turkey: "tr",
  israel: "il",
  "united arab emirates": "ae",
  uae: "ae",
  dubai: "ae",
  "saudi arabia": "sa",
  singapore: "sg",
  "hong kong": "hk",
  taiwan: "tw",
  "new zealand": "nz",
  mexico: "mx",
  argentina: "ar",
  chile: "cl",
  colombia: "co",
  "south africa": "za",
  nigeria: "ng",
  egypt: "eg",
  kenya: "ke",
  philippines: "ph",
  thailand: "th",
  vietnam: "vn",
  malaysia: "my",
  indonesia: "id",
  ukraine: "ua",
  russia: "ru",
  bulgaria: "bg",
  croatia: "hr",
  serbia: "rs",
  slovakia: "sk",
  lithuania: "lt",
  latvia: "lv",
  estonia: "ee",
  luxembourg: "lu",
  pakistan: "pk",
  bangladesh: "bd",
  peru: "pe",
  uruguay: "uy",
  "costa rica": "cr",

  // Major cities → country
  "new york": "us",
  "san francisco": "us",
  "los angeles": "us",
  chicago: "us",
  seattle: "us",
  austin: "us",
  boston: "us",
  denver: "us",
  atlanta: "us",
  miami: "us",
  dallas: "us",
  houston: "us",
  "washington dc": "us",
  "washington, dc": "us",
  london: "gb",
  manchester: "gb",
  edinburgh: "gb",
  birmingham: "gb",
  bristol: "gb",
  cambridge: "gb",
  berlin: "de",
  munich: "de",
  hamburg: "de",
  frankfurt: "de",
  paris: "fr",
  lyon: "fr",
  toronto: "ca",
  vancouver: "ca",
  montreal: "ca",
  ottawa: "ca",
  sydney: "au",
  melbourne: "au",
  brisbane: "au",
  "são paulo": "br",
  "sao paulo": "br",
  "rio de janeiro": "br",
  mumbai: "in",
  bangalore: "in",
  bengaluru: "in",
  delhi: "in",
  hyderabad: "in",
  pune: "in",
  chennai: "in",
  tokyo: "jp",
  osaka: "jp",
  beijing: "cn",
  shanghai: "cn",
  shenzhen: "cn",
  seoul: "kr",
  amsterdam: "nl",
  rotterdam: "nl",
  madrid: "es",
  barcelona: "es",
  rome: "it",
  milan: "it",
  lisbon: "pt",
  porto: "pt",
  stockholm: "se",
  oslo: "no",
  copenhagen: "dk",
  helsinki: "fi",
  zurich: "ch",
  geneva: "ch",
  vienna: "at",
  brussels: "be",
  dublin: "ie",
  warsaw: "pl",
  krakow: "pl",
  prague: "cz",
  bucharest: "ro",
  budapest: "hu",
  athens: "gr",
  istanbul: "tr",
  "tel aviv": "il",
  "abu dhabi": "ae",
  riyadh: "sa",
  "mexico city": "mx",
  "buenos aires": "ar",
  santiago: "cl",
  bogota: "co",
  "cape town": "za",
  johannesburg: "za",
  lagos: "ng",
  cairo: "eg",
  nairobi: "ke",
  manila: "ph",
  bangkok: "th",
  "ho chi minh": "vn",
  hanoi: "vn",
  "kuala lumpur": "my",
  jakarta: "id",
  kyiv: "ua",
  moscow: "ru",
  auckland: "nz",
  wellington: "nz",
  lima: "pe",
};

/**
 * Resolve a free-text location string into country coordinates.
 * Returns null for "Remote", "Worldwide", "Anywhere", or unrecognised locations.
 */
export function resolveCountry(location: string): CountryCoord | null {
  if (!location) return null;

  const lower = location.toLowerCase().trim();

  // Skip generic remote/worldwide
  if (/\b(remote|worldwide|anywhere|global|earth)\b/.test(lower)) {
    // But check for "Remote - Germany" pattern
    const parts = lower.split(/[-–,]/);
    if (parts.length > 1) {
      for (const part of parts) {
        const result = matchPart(part.trim());
        if (result) return result;
      }
    }
    return null;
  }

  // Try full string first
  const direct = matchPart(lower);
  if (direct) return direct;

  // Try splitting on common separators: "Berlin, Germany" → ["Berlin", "Germany"]
  const parts = lower.split(/[,\-–/|]+/);
  // Try from right to left (country usually last)
  for (let i = parts.length - 1; i >= 0; i--) {
    const result = matchPart(parts[i].trim());
    if (result) return result;
  }

  return null;
}

function matchPart(text: string): CountryCoord | null {
  // Direct ISO code match
  if (COUNTRIES[text]) return COUNTRIES[text];

  // Alias match
  if (ALIASES[text]) return COUNTRIES[ALIASES[text]];

  // Check if any alias is contained within the text
  for (const [alias, code] of Object.entries(ALIASES)) {
    if (alias.length >= 4 && text.includes(alias)) {
      return COUNTRIES[code];
    }
  }

  return null;
}
