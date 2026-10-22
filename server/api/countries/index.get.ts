import type { ApiResponse, NormalizedCountry } from "~~/types";

export default defineEventHandler(
  async (event): Promise<ApiResponse<NormalizedCountry[]>> => {
    try {
      const query = getQuery(event);
      const search = ((query.search as string) || "").toLowerCase().trim();
      const region = ((query.region as string) || "").toLowerCase().trim();

      let countries = await CountriesService.getAllCountries();

      if (region && region !== "all") {
        countries = countries.filter((c) => c.region.toLowerCase() === region);
      }

      if (search) {
        countries = countries.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            c.officialName.toLowerCase().includes(search) ||
            c.capital.toLowerCase().includes(search) ||
            c.cca3.toLowerCase().includes(search),
        );
      }

      return {
        success: true,
        data: countries,
      };
    } catch (error: any) {
      setResponseStatus(event, error.statusCode || 500);
      return {
        success: false,
        error: {
          message:
            error.statusMessage ||
            "Wystąpił błąd podczas pobierania listy krajów.",
          code: "COUNTRIES_FETCH_ERROR",
        },
      };
    }
  },
);
