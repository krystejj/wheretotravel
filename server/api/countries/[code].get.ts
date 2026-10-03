import { CountriesService } from "~/server/utils/countriesService";
import type { ApiResponse, NormalizedCountry } from "~/types";

export default defineEventHandler(
  async (event): Promise<ApiResponse<NormalizedCountry>> => {
    const code = getRouterParam(event, "code");

    if (!code || code.length < 2 || code.length > 3) {
      setResponseStatus(event, 400);
      return {
        success: false,
        error: {
          message:
            "Niepoprawny kod kraju (wymagany kod ISO 2- lub 3-literowy).",
          code: "INVALID_CODE",
        },
      };
    }

    try {
      const country = await CountriesService.getCountryByCode(code);

      if (!country) {
        setResponseStatus(event, 404);
        return {
          success: false,
          error: {
            message: `Kraj o kodzie ${code.toUpperCase()} nie został znaleziony.`,
            code: "NOT_FOUND",
          },
        };
      }

      return {
        success: true,
        data: country,
      };
    } catch (error: any) {
      setResponseStatus(event, error.statusCode || 500);
      return {
        success: false,
        error: {
          message:
            error.statusMessage ||
            "Błąd serwera podczas pobierania szczegółów kraju.",
          code: "SERVER_ERROR",
        },
      };
    }
  },
);
