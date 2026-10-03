import { z } from "zod";
import type { NormalizedCountry } from "~/types";

export const RawCountryV5Schema = z
  .object({
    names: z
      .object({
        common: z.string().default("Nieznany kraj"),
        official: z.string().default(""),
      })
      .optional(),
    codes: z
      .object({
        alpha_2: z.string().default(""),
        alpha_3: z.string().default(""),
      })
      .optional(),
    capitals: z
      .array(
        z.union([
          z.string(),
          z.object({
            name: z.string().optional(),
          }),
        ]),
      )
      .nullish()
      .default([]),
    region: z.string().nullish().default("Inny"),
    subregion: z.string().nullish().default(""),
    population: z.number().nullish().default(0),
    area: z
      .union([
        z.number(),
        z.object({
          kilometers: z.number().nullish(),
        }),
      ])
      .nullish(),
    coordinates: z
      .object({
        lat: z.number().nullish().default(0),
        lng: z.number().nullish().default(0),
      })
      .nullish(),
    flag: z
      .object({
        url_png: z.string().nullish().default(""),
        url_svg: z.string().nullish().default(""),
        emoji: z.string().nullish().default("🏳️"),
        description: z.string().nullish().default(""),
      })
      .nullish(),
    languages: z
      .union([z.record(z.string()), z.array(z.any())])
      .nullish()
      .default([]),
    currencies: z
      .record(
        z.object({
          name: z.string().nullish().default("Waluta"),
          symbol: z.string().nullish().default(""),
        }),
      )
      .nullish()
      .default({}),
    borders: z.array(z.string()).nullish().default([]),
  })
  .passthrough();

export function normalizeCountryV5(
  rawInput: unknown,
): NormalizedCountry | null {
  const result = RawCountryV5Schema.safeParse(rawInput);

  if (!result.success) {
    console.warn("[Parser] Błąd walidacji rekordu:", result.error.format());
    return null;
  }

  const raw = result.data;
  const cca3 = raw.codes?.alpha_3?.toUpperCase();
  if (!cca3) return null;

  let capital = "Brak oficjalnej stolicy";
  if (raw.capitals && raw.capitals.length > 0) {
    const first = raw.capitals[0];
    if (typeof first === "string") {
      capital = first;
    } else if (first && typeof first === "object" && first.name) {
      capital = first.name;
    }
  }

  let area = 0;
  if (typeof raw.area === "number") {
    area = raw.area;
  } else if (raw.area && typeof raw.area === "object" && raw.area.kilometers) {
    area = raw.area.kilometers;
  }

  const population = raw.population ?? 0;
  const density = area > 0 ? Math.round(population / area) : 0;

  const languages: string[] = [];
  if (Array.isArray(raw.languages)) {
    for (const lang of raw.languages) {
      if (typeof lang === "string") languages.push(lang);
      else if (lang && typeof lang === "object" && lang.name)
        languages.push(lang.name);
    }
  } else if (raw.languages && typeof raw.languages === "object") {
    languages.push(...Object.values(raw.languages));
  }

  const currencies: { code: string; name: string; symbol: string }[] = [];
  if (raw.currencies && typeof raw.currencies === "object") {
    for (const [code, val] of Object.entries(raw.currencies)) {
      currencies.push({
        code,
        name: val?.name || code,
        symbol: val?.symbol || code,
      });
    }
  }

  const flag =
    raw.flag?.url_png || raw.flag?.url_svg || "https://flagcdn.com/w320/un.png";
  const name = raw.names?.common || "Nieznany";

  return {
    cca3,
    name,
    officialName: raw.names?.official || name,
    capital,
    region: raw.region || "Nieznany",
    subregion: raw.subregion || raw.region || "Brak",
    population,
    area,
    density,
    flag,
    flagAlt: raw.flag?.description || `Flaga państwa ${name}`,
    languages: languages.length > 0 ? languages : ["Brak danych"],
    currencies:
      currencies.length > 0
        ? currencies
        : [{ code: "N/A", name: "Brak oficjalnej waluty", symbol: "-" }],
    latlng: [raw.coordinates?.lat ?? 0, raw.coordinates?.lng ?? 0],
    borders: raw.borders || [],
  };
}
