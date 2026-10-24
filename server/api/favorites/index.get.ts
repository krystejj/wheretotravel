import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { ApiResponse, FavoriteCountry } from "~~/types";

export default defineEventHandler(
  async (event): Promise<ApiResponse<FavoriteCountry[]>> => {
    const user = await serverSupabaseUser(event);
    if (!user) {
      setResponseStatus(event, 401);
      return {
        success: false,
        error: { message: "Musisz być zalogowany.", code: "UNAUTHORIZED" },
      };
    }

    const userId = user.id || (user as any).sub;
    const client = await serverSupabaseClient(event);

    const { data, error } = await client
      .from("favorite_countries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      setResponseStatus(event, 500);
      return {
        success: false,
        error: { message: error.message, code: "DB_ERROR" },
      };
    }

    return { success: true, data: data as FavoriteCountry[] };
  },
);
