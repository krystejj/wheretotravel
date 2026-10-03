import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { ApiResponse } from "~/types";

export default defineEventHandler(
  async (event): Promise<ApiResponse<{ message: string }>> => {
    const user = await serverSupabaseUser(event);
    if (!user) {
      setResponseStatus(event, 401);
      return {
        success: false,
        error: { message: "Wymagane logowanie.", code: "UNAUTHORIZED" },
      };
    }

    const id = getRouterParam(event, "id");
    const client = await serverSupabaseClient(event);

    const { error } = await client
      .from("travel_notes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setResponseStatus(event, 500);
      return {
        success: false,
        error: { message: error.message, code: "DB_ERROR" },
      };
    }

    return { success: true, data: { message: "Notatka została usunięta." } };
  },
);
