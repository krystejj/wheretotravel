import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { ApiResponse, TravelNote } from "~~/types";

export default defineEventHandler(
  async (event): Promise<ApiResponse<TravelNote[]>> => {
    const user = await serverSupabaseUser(event);
    if (!user) {
      setResponseStatus(event, 401);
      return {
        success: false,
        error: { message: "Wymagane logowanie.", code: "UNAUTHORIZED" },
      };
    }

    const query = getQuery(event);
    const countryCode = query.country_code as string | undefined;

    const client = await serverSupabaseClient(event);
    let dbQuery = client
      .from("travel_notes")
      .select("*")
      .eq("user_id", user.id || (user as any).sub)
      .order("created_at", { ascending: false });

    if (countryCode) {
      dbQuery = dbQuery.eq("country_code", countryCode.toUpperCase());
    }

    const { data, error } = await dbQuery;

    if (error) {
      setResponseStatus(event, 500);
      return {
        success: false,
        error: { message: error.message, code: "DB_ERROR" },
      };
    }

    return { success: true, data: data as TravelNote[] };
  },
);
