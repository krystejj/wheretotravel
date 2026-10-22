import type { NormalizedCountry } from "~~/types";
import { normalizeCountry } from "./countryParser";

interface CacheEntry {
  data: NormalizedCountry[];
  timestamp: number;
}

let countriesCache: CacheEntry | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000;

export class CountriesService {
  static async getAllCountries(): Promise<NormalizedCountry[]> {
    const now = Date.now();

    if (
      countriesCache &&
      now - countriesCache.timestamp < CACHE_TTL_MS &&
      countriesCache.data.length > 200
    ) {
      return countriesCache.data;
    }

    const allFetchedCountries: NormalizedCountry[] = [];

    try {
      const config = useRuntimeConfig();
      const apiKey =
        config.countriesApiKey ||
        process.env.REST_COUNTRIES_API_KEY ||
        "rc_live_demo";

      let offset = 0;
      const limit = 100;
      let hasMore = true;
      let pageCount = 0;

      while (hasMore && pageCount < 5) {
        pageCount++;
        const v5Url = `https://api.restcountries.com/countries/v5?limit=${limit}&offset=${offset}`;

        const response: any = await $fetch(v5Url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
          timeout: 8000,
        });

        const objects = Array.isArray(response?.data)
          ? response.data
          : response?.data?.objects || response?.objects || [];

        for (const raw of objects) {
          const parsed = normalizeCountry(raw);
          if (
            parsed &&
            !allFetchedCountries.some((c) => c.cca3 === parsed.cca3)
          ) {
            allFetchedCountries.push(parsed);
          }
        }

        const total = response?.data?.meta?.total ?? response?.meta?.total ?? 0;
        const more =
          response?.data?.meta?.more ?? response?.meta?.more ?? false;

        offset += limit;
        hasMore = (more || offset < total) && objects.length > 0;
      }
    } catch (err: any) {
      console.warn(
        "[CountriesService] v5 API błąd stronicowania:",
        err.message,
      );
    }

    if (allFetchedCountries.length < 200) {
      try {
        console.log(
          "[CountriesService] Uzupełniam pełną bazę państw ze źródła zapasowego...",
        );
        const v3Response: any = await $fetch(
          "https://restcountries.com/v3.1/all",
          {
            timeout: 10000,
          },
        );

        if (Array.isArray(v3Response)) {
          for (const raw of v3Response) {
            const parsed = normalizeCountry(raw);
            if (
              parsed &&
              !allFetchedCountries.some((c) => c.cca3 === parsed.cca3)
            ) {
              allFetchedCountries.push(parsed);
            }
          }
        }
      } catch (err: any) {
        console.error(
          "[CountriesService] Błąd źródła zapasowego:",
          err.message,
        );
      }
    }

    if (allFetchedCountries.length > 0) {
      countriesCache = {
        data: allFetchedCountries,
        timestamp: now,
      };
      console.log(
        `[CountriesService] Pomyślnie załadowano i zbuforowano ${allFetchedCountries.length} państw!`,
      );
      return allFetchedCountries;
    }

    if (countriesCache && countriesCache.data.length > 0) {
      return countriesCache.data;
    }

    throw createError({
      statusCode: 503,
      message: "Nie udało się pobrać danych z API. Spróbuj odświeżyć stronę.",
    });
  }

  static async getCountryByCode(
    code: string,
  ): Promise<NormalizedCountry | null> {
    const upperCode = code.toUpperCase();

    if (countriesCache?.data) {
      const match = countriesCache.data.find((c) => c.cca3 === upperCode);
      if (match) return match;
    }

    try {
      const all = await this.getAllCountries();
      const match = all.find((c) => c.cca3 === upperCode);
      if (match) return match;
    } catch (_) {}

    try {
      const res: any = await $fetch(
        `https://restcountries.com/v3.1/alpha/${upperCode}`,
        { timeout: 6000 },
      );
      const raw = Array.isArray(res) ? res[0] : res;
      return raw ? normalizeCountry(raw) : null;
    } catch (err: any) {
      if (err.statusCode === 404) return null;
      throw err;
    }
  }
}
