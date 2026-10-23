<script setup lang="ts">
import type { NormalizedCountry, TravelNote, ApiResponse } from "~/types";

const route = useRoute();
const user = useSupabaseUser();
const toast = useToast();
const countryCode = computed(() => (route.params.code as string).toUpperCase());

// Pobranie kraju
const {
  data: countryRes,
  pending: countryPending,
  error: countryError,
} = await useFetch<ApiResponse<NormalizedCountry>>(
  `/api/countries/${countryCode.value}`,
);
const country = computed(() => countryRes.value?.data);

// Pobranie notatek
const { data: notesRes, refresh: refreshNotes } = await useFetch<
  ApiResponse<TravelNote[]>
>("/api/notes", {
  query: { country_code: countryCode.value },
  immediate: !!user.value,
});
const notes = computed(() => notesRes.value?.data || []);

// Formularz nowej notatki
const isModalOpen = ref(false);
const noteTitle = ref("");
const noteContent = ref("");
const noteRating = ref(5);
const isSubmitting = ref(false);

const handleCreateNote = async () => {
  if (!noteTitle.value || !noteContent.value) {
    toast.add({
      title: "Wypełnij pola",
      description: "Tytuł i treść są wymagane.",
      color: "yellow",
    });
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await $fetch<ApiResponse<TravelNote>>("/api/notes", {
      method: "POST",
      body: {
        country_code: countryCode.value,
        title: noteTitle.value,
        content: noteContent.value,
        rating: noteRating.value,
      },
    });

    if (res.success) {
      toast.add({
        title: "Notatka dodana!",
        color: "green",
        icon: "i-heroicons-check-circle",
      });
      noteTitle.value = "";
      noteContent.value = "";
      isModalOpen.value = false;
      refreshNotes();
    }
  } catch (err: any) {
    toast.add({
      title: "Błąd zapisu",
      description: err.data?.error?.message,
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="space-y-8">
    <!-- Powrót -->
    <div>
      <UButton
        to="/"
        variant="ghost"
        icon="i-heroicons-arrow-left"
        color="gray"
      >
        Wróć do listy państw
      </UButton>
    </div>

    <!-- Ładowanie -->
    <div v-if="countryPending" class="space-y-6">
      <USkeleton class="h-64 w-full rounded-3xl" />
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <USkeleton v-for="i in 3" :key="i" class="h-32 rounded-2xl" />
      </div>
    </div>

    <!-- Błąd -->
    <div
      v-else-if="countryError || !country"
      class="p-12 text-center bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-200"
    >
      <UIcon
        name="i-heroicons-x-circle"
        class="w-16 h-16 text-red-500 mx-auto mb-3"
      />
      <h2 class="text-2xl font-bold text-red-800 dark:text-red-300">
        Nie znaleziono państwa o kodzie {{ countryCode }}
      </h2>
      <UButton to="/" color="red" class="mt-4">Wróć do strony głównej</UButton>
    </div>

    <!-- Widok kraju -->
    <template v-else>
      <div
        class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div
            class="relative overflow-hidden bg-gray-100/60 dark:bg-gray-950 flex items-center justify-center min-h-[300px] lg:min-h-[420px] p-6 sm:p-10"
          >
            <img
              :src="country.flag"
              :alt="country.flagAlt"
              class="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 dark:opacity-30 scale-125 pointer-events-none"
            />

            <img
              :src="country.flag"
              :alt="country.flagAlt"
              class="relative z-10 max-h-[220px] lg:max-h-[280px] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/20 dark:border-white/10"
            />

            <UBadge
              color="primary"
              class="absolute top-4 left-4 z-20 text-sm font-bold shadow-md"
            >
              {{ country.cca3 }}
            </UBadge>
          </div>

          <div class="p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div>
              <div
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 w-fit mb-3"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"
                ></span>
                {{ country.region }} • {{ country.subregion }}
              </div>
              <h1 class="text-3xl sm:text-4xl font-black tracking-tight">
                {{ country.name }}
              </h1>
              <p class="text-gray-500 mt-1 italic">
                {{ country.officialName }}
              </p>
            </div>

            <!-- Informacje o kraju -->
            <div
              class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800"
            >
              <div
                class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80"
              >
                <span class="text-xs text-zinc-500 block">Stolica</span>
                <span
                  class="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate block"
                  >{{ country.capital }}</span
                >
              </div>
              <div
                class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80"
              >
                <span class="text-xs text-zinc-500 block">Populacja</span>
                <span
                  class="text-sm font-bold text-zinc-900 dark:text-zinc-100 block"
                  >{{ country.population.toLocaleString("pl-PL") }}</span
                >
              </div>
              <div
                class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80"
              >
                <span class="text-xs text-zinc-500 block">Powierzchnia</span>
                <span
                  class="text-sm font-bold text-zinc-900 dark:text-zinc-100 block"
                  >{{ country.area.toLocaleString("pl-PL") }} km²</span
                >
              </div>
              <div
                class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80"
              >
                <span class="text-xs text-zinc-500 block">Gęstość</span>
                <span
                  class="text-sm font-bold text-zinc-900 dark:text-zinc-100 block"
                  >{{ country.density }} os./km²</span
                >
              </div>
              <div
                class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80"
              >
                <span class="text-xs text-zinc-500 block">Języki</span>
                <span
                  class="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate block"
                  >{{ country.languages.join(", ") }}</span
                >
              </div>
              <div
                class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80"
              >
                <span class="text-xs text-zinc-500 block">Waluta</span>
                <span
                  class="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate block"
                  >{{
                    country.currencies
                      .map((c) => `${c.code} (${c.symbol})`)
                      .join(", ")
                  }}</span
                >
              </div>
            </div>

            <!-- Granice i sąsiedzi -->
            <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
              <span class="text-xs text-gray-500 block mb-2 font-medium"
                >Graniczy z:</span
              >
              <div
                v-if="country.borders.length > 0"
                class="flex flex-wrap gap-2"
              >
                <NuxtLink
                  v-for="border in country.borders"
                  :key="border"
                  :to="`/countries/${border}`"
                  class="px-2.5 py-1 text-xs font-mono font-semibold rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-800 transition-colors"
                >
                  {{ border }}
                </NuxtLink>
              </div>
              <span v-else class="text-sm text-gray-400 italic"
                >Brak granic lądowych (np. wyspa)</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Notatki -->
      <div
        class="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm space-y-6"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold">Twoje notatki i plany podróży</h2>
            <p class="text-sm text-gray-500">
              Zapisuj wspomnienia, porady i planowane atrakcje dla tego kraju.
            </p>
          </div>
          <UButton
            v-if="user"
            color="primary"
            icon="i-heroicons-plus"
            @click="isModalOpen = true"
          >
            Dodaj notatkę
          </UButton>
        </div>

        <div
          v-if="!user"
          class="p-6 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl"
        >
          <p class="text-gray-500 text-sm">
            Zaloguj się, aby tworzyć i zarządzać notatkami dotyczącymi tego
            kraju.
          </p>
          <UButton to="/login" color="primary" variant="soft" class="mt-3"
            >Zaloguj się</UButton
          >
        </div>

        <div
          v-else-if="notes.length === 0"
          class="p-6 text-center text-gray-400 italic"
        >
          Brak notatek dla tego państwa. Dodaj pierwszą notatkę powyższym
          przyciskiem!
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UCard v-for="note in notes" :key="note.id">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-lg">{{ note.title }}</h3>
                <UBadge color="yellow" variant="subtle"
                  >★ {{ note.rating }}/5</UBadge
                >
              </div>
            </template>
            <p
              class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line"
            >
              {{ note.content }}
            </p>
            <template #footer>
              <span class="text-xs text-gray-400"
                >Dodano:
                {{
                  new Date(note.created_at).toLocaleDateString("pl-PL")
                }}</span
              >
            </template>
          </UCard>
        </div>
      </div>

      <!-- Tworzenie notatki -->
      <UModal v-model="isModalOpen">
        <UCard>
          <template #header>
            <h3 class="font-bold text-lg">Nowa notatka: {{ country.name }}</h3>
          </template>

          <form @submit.prevent="handleCreateNote" class="space-y-4">
            <UFormGroup label="Tytuł notatki" required>
              <UInput
                v-model="noteTitle"
                placeholder="np. Wyjazd majowy / Co zobaczyć"
              />
            </UFormGroup>

            <UFormGroup label="Ocena / Priorytet (1-5)">
              <USelect
                v-model="noteRating"
                :options="[
                  { label: '5 - Bardzo wysoki', value: 5 },
                  { label: '4 - Wysoki', value: 4 },
                  { label: '3 - Średni', value: 3 },
                  { label: '2 - Niski', value: 2 },
                  { label: '1 - Minimalny', value: 1 },
                ]"
                option-attribute="label"
                value-attribute="value"
              />
            </UFormGroup>

            <UFormGroup label="Treść notatki" required>
              <UTextarea
                v-model="noteContent"
                placeholder="Wpisz swoje plany, porady, miejsca do odwiedzenia..."
                rows="4"
              />
            </UFormGroup>

            <div class="flex justify-end gap-2 pt-4">
              <UButton color="gray" variant="ghost" @click="isModalOpen = false"
                >Anuluj</UButton
              >
              <UButton type="submit" color="primary" :loading="isSubmitting"
                >Zapisz notatkę</UButton
              >
            </div>
          </form>
        </UCard>
      </UModal>
    </template>
  </div>
</template>
