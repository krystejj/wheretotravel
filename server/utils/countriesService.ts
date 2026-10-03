import type { NormalizedCountry } from "~/types";
import { normalizeCountryV5 } from "./countryParser";

interface CacheEntry {
  data: NormalizedCountry[];
  timestamp: number;
}

let countriesCache: CacheEntry | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000;

export class CountriesService {
  private static getHeaders() {
    const config = useRuntimeConfig();
    return {
      Authorization: `Bearer ${config.countriesApiKey}`,
      Accept: "application/json",
    };
  }

  static async getAllCountries(): Promise<NormalizedCountry[]> {
    const now = Date.now();

    if (countriesCache && now - countriesCache.timestamp < CACHE_TTL_MS) {
      return countriesCache.data;
    }

    const config = useRuntimeConfig();
    const allFetchedCountries: NormalizedCountry[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    try {
      while (hasMore) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const url = `${config.countriesApiBase}?limit=${limit}&offset=${offset}`;

        const response: any = await $fetch(url, {
          headers: this.getHeaders(),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        const objects = response?.data?.objects || [];

        for (const raw of objects) {
          const parsed = normalizeCountryV5(raw);
          if (parsed) allFetchedCountries.push(parsed);
        }

        const total = response?.data?.meta?.total || 0;
        offset += limit;
        hasMore = offset < total && objects.length > 0;
      }

      if (allFetchedCountries.length > 0) {
        countriesCache = {
          data: allFetchedCountries,
          timestamp: now,
        };
      }

      return allFetchedCountries;
    } catch (error: any) {
      console.error(
        "[CountriesService] Błąd podczas pobierania danych:",
        error.message,
      );

      if (countriesCache) {
        console.warn(
          "[CountriesService] Zwracam przestarzałe dane z pamięci podręcznej.",
        );
        return countriesCache.data;
      }

      throw createError({
        statusCode: 503,
        statusMessage:
          "Usługa REST Countries jest tymczasowo niedostępna. Spróbuj ponownie później.",
      });
    }
  }

  static async getCountryByCode(
    code: string,
  ): Promise<NormalizedCountry | null> {
    const upperCode = code.toUpperCase();

    const cachedList = countriesCache?.data;
    if (cachedList) {
      const match = cachedList.find((c) => c.cca3 === upperCode);
      if (match) return match;
    }

    const config = useRuntimeConfig();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response: any = await $fetch(
        `${config.countriesApiBase}/codes.alpha_3/${upperCode}`,
        {
          headers: this.getHeaders(),
          signal: controller.signal,
        },
      ).finally(() => clearTimeout(timeoutId));

      const raw = response?.data?.objects?.[0];
      if (!raw) return null;

      return normalizeCountryV5(raw);
    } catch (err: any) {
      if (err.statusCode === 404) return null;
      throw err;
    }
  }
}
