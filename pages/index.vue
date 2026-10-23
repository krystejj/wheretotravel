<script setup lang="ts">
import type { NormalizedCountry, ApiResponse } from "~/types";

const user = useSupabaseUser();
const toast = useToast();

const {
  data: response,
  pending,
  error,
  refresh,
} = await useFetch<ApiResponse<NormalizedCountry[]>>("/api/countries", {
  lazy: true,
});

const searchQuery = ref("");
const selectedRegion = ref("all");
const sortBy = ref("name");

const regionOptions = [
  { label: "Wszystkie regiony", value: "all" },
  { label: "Europa", value: "Europe" },
  { label: "Azja", value: "Asia" },
  { label: "Afryka", value: "Africa" },
  { label: "Ameryka", value: "Americas" },
  { label: "Oceania", value: "Oceania" },
];

const sortOptions = [
  { label: "Nazwa (A-Z)", value: "name" },
  { label: "Populacja (malejąco)", value: "population_desc" },
  { label: "Populacja (rosnąco)", value: "population_asc" },
  { label: "Powierzchnia (malejąco)", value: "area_desc" },
];

// Filtrowanie
const filteredCountries = computed(() => {
  const list = response.value?.data || [];
  let result = [...list];

  if (selectedRegion.value !== "all") {
    result = result.filter(
      (c) => c.region.toLowerCase() === selectedRegion.value.toLowerCase(),
    );
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.officialName.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        c.cca3.toLowerCase().includes(q),
    );
  }

  result.sort((a, b) => {
    if (sortBy.value === "name") return a.name.localeCompare(b.name);
    if (sortBy.value === "population_desc") return b.population - a.population;
    if (sortBy.value === "population_asc") return a.population - b.population;
    if (sortBy.value === "area_desc") return b.area - a.area;
    return 0;
  });

  return result;
});

// Dodawanie do ulubionych
const addingCode = ref<string | null>(null);
const addToFavorites = async (country: NormalizedCountry) => {
  if (!user.value) {
    toast.add({
      title: "Wymagane logowanie",
      description: "Zaloguj się, aby zapisywać państwa na swojej liście.",
      color: "yellow",
      icon: "i-heroicons-user",
    });
    return;
  }

  addingCode.value = country.cca3;
  try {
    const res = await $fetch<ApiResponse>("/api/favorites", {
      method: "POST",
      body: { country_code: country.cca3, status: "want_to_visit" },
    });

    if (res.success) {
      toast.add({
        title: "Zapisano!",
        description: `${country.name} dodano do Twojej listy "Chcę odwiedzić".`,
        color: "green",
        icon: "i-heroicons-heart",
      });
    }
  } catch (err: any) {
    toast.add({
      title: "Uwaga",
      description:
        err.data?.error?.message || "Nie udało się dodać do ulubionych.",
      color: "yellow",
    });
  } finally {
    addingCode.value = null;
  }
};
</script>

<template>
  <div class="space-y-8">
    <!-- Pasek filtrowania i wyszukiwania -->
    <div
      class="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-sm"
    >
      <div class="lg:col-span-2">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Szukaj państwa, stolicy lub kodu ISO..."
          size="md"
        />
      </div>
      <div>
        <USelect
          v-model="selectedRegion"
          :options="regionOptions"
          option-attribute="label"
          value-attribute="value"
          size="md"
        />
      </div>
      <div>
        <USelect
          v-model="sortBy"
          :options="sortOptions"
          option-attribute="label"
          value-attribute="value"
          size="md"
        />
      </div>
    </div>

    <!-- Licznik wyników -->
    <div class="flex items-center justify-between text-sm text-gray-500 px-1">
      <span
        >Znaleziono:
        <strong class="text-gray-900 dark:text-white">{{
          filteredCountries.length
        }}</strong>
        państw</span
      >
    </div>

    <!-- Stan błędu -->
    <div
      v-if="error"
      class="p-8 text-center bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900"
    >
      <UIcon
        name="i-heroicons-exclamation-triangle"
        class="w-12 h-12 text-red-500 mx-auto mb-3"
      />
      <h3 class="text-lg font-bold text-red-800 dark:text-red-300">
        Błąd komunikacji z zewnętrznym API
      </h3>
      <p class="text-sm text-red-600 dark:text-red-400 mt-1 max-w-md mx-auto">
        Nie udało się pobrać danych z REST Countries API. Sprawdź połączenie z
        internetem.
      </p>
      <UButton
        color="red"
        class="mt-4"
        icon="i-heroicons-arrow-path"
        @click="() => refresh()"
      >
        Spróbuj ponownie
      </UButton>
    </div>

    <!-- Stan ładowania -->
    <div
      v-else-if="pending"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="n in 8"
        :key="n"
        class="space-y-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
      >
        <USkeleton class="h-44 w-full rounded-xl" />
        <USkeleton class="h-6 w-3/4" />
        <USkeleton class="h-4 w-1/2" />
        <USkeleton class="h-8 w-full mt-4" />
      </div>
    </div>

    <!-- Grid krajów -->
    <div
      v-else-if="filteredCountries.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="country in filteredCountries"
        :key="country.cca3"
        class="group flex flex-col justify-between bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-xl overflow-hidden transition-all duration-200 shadow-sm"
      >
        <div
          class="relative bg-zinc-50 dark:bg-zinc-900/60 h-44 flex items-center justify-center p-4 border-b border-zinc-200 dark:border-zinc-800/80 overflow-hidden"
        >
          <img
            :src="country.flag"
            :alt="country.flagAlt"
            loading="lazy"
            class="max-h-32 w-auto max-w-[85%] object-contain rounded-md shadow group-hover:scale-105 transition-transform duration-200"
          />
          <span
            class="absolute top-3 right-3 text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            {{ country.cca3 }}
          </span>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h2
              class="text-lg font-semibold text-zinc-900 dark:text-white tracking-tight truncate"
              :title="country.name"
            >
              {{ country.name }}
            </h2>
            <p
              class="text-xs text-zinc-500 truncate"
              :title="country.officialName"
            >
              {{ country.officialName }}
            </p>

            <div class="mt-4 space-y-1.5 text-xs">
              <div
                class="flex items-center justify-between text-zinc-500 dark:text-zinc-400"
              >
                <span>Stolica</span>
                <span
                  class="text-zinc-900 dark:text-zinc-200 font-medium truncate max-w-[140px]"
                  >{{ country.capital }}</span
                >
              </div>
              <div
                class="flex items-center justify-between text-zinc-500 dark:text-zinc-400"
              >
                <span>Region</span>
                <span class="text-zinc-900 dark:text-zinc-200 font-medium">{{
                  country.region
                }}</span>
              </div>
              <div
                class="flex items-center justify-between text-zinc-500 dark:text-zinc-400"
              >
                <span>Populacja</span>
                <span class="text-zinc-900 dark:text-zinc-200 font-medium">{{
                  country.population.toLocaleString("pl-PL")
                }}</span>
              </div>
            </div>
          </div>

          <div
            class="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-900"
          >
            <NuxtLink
              :to="`/countries/${country.cca3}`"
              class="flex-1 inline-flex items-center justify-center text-xs font-semibold py-2 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800/90 dark:text-zinc-200 dark:border-zinc-800 transition-colors"
            >
              Szczegóły &rarr;
            </NuxtLink>

            <button
              type="button"
              class="p-2 rounded-lg text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:border-rose-500/20 dark:text-rose-400 transition-colors flex items-center justify-center disabled:opacity-50"
              :disabled="addingCode === country.cca3"
              title="Dodaj do listy podróży"
              @click="addToFavorites(country)"
            >
              <UIcon
                :name="
                  addingCode === country.cca3
                    ? 'i-heroicons-arrow-path'
                    : 'i-heroicons-heart'
                "
                :class="[
                  'w-4 h-4',
                  { 'animate-spin': addingCode === country.cca3 },
                ]"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Brak wyników -->
    <div
      v-else
      class="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800"
    >
      <UIcon
        name="i-heroicons-magnifying-glass"
        class="w-12 h-12 text-gray-400 mx-auto mb-2"
      />
      <h3 class="text-lg font-bold">Brak państw spełniających kryteria</h3>
      <p class="text-sm text-gray-500 mt-1">
        Zmień frazę wyszukiwania lub zresetuj filtr regionu.
      </p>
    </div>
  </div>
</template>
