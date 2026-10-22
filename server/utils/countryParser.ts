import { z } from "zod";
import type { NormalizedCountry } from "~~/types";

export const RawCountrySchema = z
  .object({
    names: z.any().optional(),
    name: z.any().optional(),
    codes: z.any().optional(),
    cca3: z.any().optional(),
    cca2: z.any().optional(),
    capitals: z.any().optional(),
    capital: z.any().optional(),
    region: z.any().optional(),
    subregion: z.any().optional(),
    population: z.any().optional(),
    area: z.any().optional(),
    coordinates: z.any().optional(),
    latlng: z.any().optional(),
    flag: z.any().optional(),
    flags: z.any().optional(),
    languages: z.any().optional(),
    currencies: z.any().optional(),
    borders: z.any().optional(),
  })
  .passthrough();

export function normalizeCountry(rawInput: unknown): NormalizedCountry | null {
  const result = RawCountrySchema.safeParse(rawInput);
  if (!result.success) return null;

  const raw: any = result.data;

  const cca3 = (
    raw.codes?.alpha_3 ||
    raw.cca3 ||
    raw.codes?.alpha_2 ||
    raw.cca2 ||
    ""
  ).toUpperCase();
  if (!cca3) return null;

  const name = raw.names?.common || raw.name?.common || "Nieznany kraj";
  const officialName = raw.names?.official || raw.name?.official || name;

  let capital = "Brak oficjalnej stolicy";
  if (Array.isArray(raw.capitals) && raw.capitals.length > 0) {
    const first = raw.capitals[0];
    capital = typeof first === "string" ? first : first?.name || capital;
  } else if (Array.isArray(raw.capital) && raw.capital.length > 0) {
    capital = String(raw.capital[0]);
  } else if (typeof raw.capital === "string") {
    capital = raw.capital;
  }

  const region = raw.region || "Inny";
  const subregion = raw.subregion || raw.region || "Brak";

  const population = typeof raw.population === "number" ? raw.population : 0;
  let area = 0;
  if (typeof raw.area === "number") {
    area = raw.area;
  } else if (raw.area?.kilometers) {
    area = raw.area.kilometers;
  }
  const density = area > 0 ? Math.round(population / area) : 0;

  const flag =
    raw.flag?.url_png ||
    raw.flag?.url_svg ||
    raw.flags?.png ||
    raw.flags?.svg ||
    "https://flagcdn.com/w320/un.png";
  const flagAlt = raw.flag?.description || raw.flags?.alt || `Flaga ${name}`;

  const languages: string[] = [];
  if (Array.isArray(raw.languages)) {
    for (const item of raw.languages) {
      if (typeof item === "string") languages.push(item);
      else if (item?.name) languages.push(item.name);
    }
  } else if (raw.languages && typeof raw.languages === "object") {
    languages.push(...Object.values(raw.languages).map(String));
  }
  if (languages.length === 0) languages.push("Brak danych");

  const currencies: { code: string; name: string; symbol: string }[] = [];
  if (Array.isArray(raw.currencies)) {
    for (const cur of raw.currencies) {
      if (cur && typeof cur === "object") {
        currencies.push({
          code: cur.code || "WAL",
          name: cur.name || "Waluta",
          symbol: cur.symbol || cur.code || "",
        });
      }
    }
  } else if (raw.currencies && typeof raw.currencies === "object") {
    for (const [code, val] of Object.entries(raw.currencies) as [
      string,
      any,
    ][]) {
      currencies.push({
        code,
        name: val?.name || code,
        symbol: val?.symbol || code,
      });
    }
  }
  if (currencies.length === 0) {
    currencies.push({
      code: "N/A",
      name: "Brak oficjalnej waluty",
      symbol: "-",
    });
  }

  let latlng: [number, number] = [0, 0];
  if (
    raw.coordinates &&
    typeof raw.coordinates.lat === "number" &&
    typeof raw.coordinates.lng === "number"
  ) {
    latlng = [raw.coordinates.lat, raw.coordinates.lng];
  } else if (Array.isArray(raw.latlng) && raw.latlng.length >= 2) {
    latlng = [Number(raw.latlng[0]), Number(raw.latlng[1])];
  }

  const borders = Array.isArray(raw.borders) ? raw.borders : [];

  return {
    cca3,
    name,
    officialName,
    capital,
    region,
    subregion,
    population,
    area,
    density,
    flag,
    flagAlt,
    languages,
    currencies,
    latlng,
    borders,
  };
}
