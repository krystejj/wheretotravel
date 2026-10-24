import { z } from "zod";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { ApiResponse, TravelNote } from "~~/types";

const NoteUpdateSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  content: z.string().min(5).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  visit_date: z.string().nullish().optional(),
});

export default defineEventHandler(
  async (event): Promise<ApiResponse<TravelNote>> => {
    const user = await serverSupabaseUser(event);
    if (!user) {
      setResponseStatus(event, 401);
      return {
        success: false,
        error: { message: "Wymagane logowanie.", code: "UNAUTHORIZED" },
      };
    }

    const id = getRouterParam(event, "id");
    const body = await readBody(event);
    const validation = NoteUpdateSchema.safeParse(body);

    if (!validation.success) {
      setResponseStatus(event, 400);
      return {
        success: false,
        error: {
          message: "Niepoprawne dane do aktualizacji.",
          code: "VALIDATION_ERROR",
        },
      };
    }

    const client = await serverSupabaseClient(event);
    const { data, error } = await client
      .from("travel_notes")
      .update({
        ...validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id || (user as any).sub)
      .select()
      .single();

    if (error) {
      setResponseStatus(event, 500);
      return {
        success: false,
        error: { message: error.message, code: "DB_ERROR" },
      };
    }

    return { success: true, data: data as TravelNote };
  },
);
