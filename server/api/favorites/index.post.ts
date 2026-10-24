import { z } from "zod";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { ApiResponse, FavoriteCountry } from "~~/types";

const BodySchema = z.object({
  country_code: z
    .string()
    .min(2, "Kod kraju musi mieć min. 2 znaki")
    .max(3, "Kod kraju może mieć max. 3 znaki"),
  status: z.enum(["want_to_visit", "visited"]).default("want_to_visit"),
});

export default defineEventHandler(
  async (event): Promise<ApiResponse<FavoriteCountry>> => {
    const user = await serverSupabaseUser(event);
    if (!user) {
      setResponseStatus(event, 401);
      return {
        success: false,
        error: {
          message: "Aby dodać kraj do ulubionych, musisz być zalogowany.",
          code: "UNAUTHORIZED",
        },
      };
    }

    const userId = user.id || (user as any).sub;

    if (!userId) {
      setResponseStatus(event, 401);
      return {
        success: false,
        error: {
          message: "Nie udało się ustalić ID sesji.",
          code: "INVALID_SESSION",
        },
      };
    }

    const body = await readBody(event);
    const validation = BodySchema.safeParse(body);

    if (!validation.success) {
      setResponseStatus(event, 400);
      return {
        success: false,
        error: {
          message: validation.error.errors[0]?.message || "Niepoprawne dane.",
          code: "VALIDATION_ERROR",
        },
      };
    }

    const client = await serverSupabaseClient(event);
    try {
      await client.from("profiles").upsert(
        {
          id: userId,
          username:
            user.user_metadata?.username ||
            (user as any).user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Podróżnik",
        },
        { onConflict: "id" },
      );

      const { data, error } = await client
        .from("favorite_countries")
        .insert({
          user_id: userId,
          country_code: validation.data.country_code.toUpperCase(),
          status: validation.data.status,
        })
        .select()
        .single();

      if (error) {
        console.error("[Favorites]:", error);
        setResponseStatus(event, 400);
        const isDuplicate = error.code === "23505";
        return {
          success: false,
          error: {
            message: isDuplicate
              ? "Ten kraj znajduje się już na Twojej liście."
              : error.message || "Błąd zapisu w bazie danych.",
            code: error.code || "DB_ERROR",
          },
        };
      }

      setResponseStatus(event, 201);
      return { success: true, data: data as FavoriteCountry };
    } catch (err: any) {
      console.error("[Favorites]:", err);
      setResponseStatus(event, 500);
      return {
        success: false,
        error: {
          message: err.message || "Błąd serwera.",
          code: "SERVER_ERROR",
        },
      };
    }
  },
);
