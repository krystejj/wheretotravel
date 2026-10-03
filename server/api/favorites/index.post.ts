import { z } from "zod";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { ApiResponse, FavoriteCountry } from "~/types";

const BodySchema = z.object({
  country_code: z.string().length(3),
  status: z.enum(["want_to_visit", "visited"]).default("want_to_visit"),
});

export default defineEventHandler(
  async (event): Promise<ApiResponse<FavoriteCountry>> => {
    const user = await serverSupabaseUser(event);
    if (!user) {
      setResponseStatus(event, 401);
      return {
        success: false,
        error: { message: "Wymagane logowanie.", code: "UNAUTHORIZED" },
      };
    }

    const body = await readBody(event);
    const validation = BodySchema.safeParse(body);

    if (!validation.success) {
      setResponseStatus(event, 400);
      return {
        success: false,
        error: {
          message: "Niepoprawne dane wejściowe.",
          code: "VALIDATION_ERROR",
        },
      };
    }

    const client = await serverSupabaseClient(event);
    const { data, error } = await client
      .from("favorite_countries")
      .insert({
        user_id: user.id,
        country_code: validation.data.country_code.toUpperCase(),
        status: validation.data.status,
      })
      .select()
      .single();

    if (error) {
      setResponseStatus(event, 400);
      return {
        success: false,
        error: {
          message: "Ten kraj jest już na Twojej liście.",
          code: "DUPLICATE_ENTRY",
        },
      };
    }

    setResponseStatus(event, 201);
    return { success: true, data: data as FavoriteCountry };
  },
);
