import { z } from "zod";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { ApiResponse, TravelNote } from "~~/types";

const NoteCreateSchema = z.object({
  country_code: z.string().length(3),
  title: z.string().min(3, "Tytuł musi mieć co najmniej 3 znaki").max(120),
  content: z.string().min(5, "Treść notatki musi mieć co najmniej 5 znaków"),
  rating: z.number().int().min(1).max(5).default(5),
  visit_date: z.string().nullish(),
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

    const body = await readBody(event);
    const validation = NoteCreateSchema.safeParse(body);

    if (!validation.success) {
      setResponseStatus(event, 400);
      return {
        success: false,
        error: {
          message:
            validation.error.errors[0]?.message || "Błąd walidacji danych.",
          code: "VALIDATION_ERROR",
        },
      };
    }

    const client = await serverSupabaseClient(event);
    const { data, error } = await client
      .from("travel_notes")
      .insert({
        user_id: user.id,
        country_code: validation.data.country_code.toUpperCase(),
        title: validation.data.title,
        content: validation.data.content,
        rating: validation.data.rating,
        visit_date: validation.data.visit_date || null,
      })
      .select()
      .single();

    if (error) {
      setResponseStatus(event, 500);
      return {
        success: false,
        error: { message: error.message, code: "DB_ERROR" },
      };
    }

    setResponseStatus(event, 201);
    return { success: true, data: data as TravelNote };
  },
);
