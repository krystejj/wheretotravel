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
    <div
      class="relative overflow-hidden rounded-3xl bg-violet-600 dark:bg-violet-700 text-white p-8 sm:p-12 shadow-lg"
    >
      <div class="relative z-10 max-w-2xl space-y-4">
        <h1 class="text-3xl sm:text-5xl font-black tracking-tight">
          Odkrywaj państwa całego świata
        </h1>
        <p class="text-violet-100 text-base sm:text-lg">
          Przeglądaj aktualne statystyki demograficzne, porównuj kraje na
          interaktywnych wykresach i planuj swoje wymarzone podróże.
        </p>
      </div>
    </div>

    <!-- Pasek filtrowania i wyszukiwania -->
    <div
      class="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <div class="lg:col-span-2">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Szukaj państwa, stolicy lub kodu (np. Polska, Tokio, ISL)..."
          size="lg"
        />
      </div>
      <div>
        <USelect
          v-model="selectedRegion"
          :options="regionOptions"
          option-attribute="label"
          value-attribute="value"
          size="lg"
        />
      </div>
      <div>
        <USelect
          v-model="sortBy"
          :options="sortOptions"
          option-attribute="label"
          value-attribute="value"
          size="lg"
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
      <UCard
        v-for="country in filteredCountries"
        :key="country.cca3"
        :ui="{ body: { padding: 'p-0 sm:p-0' } }"
        class="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
      >
        <div class="relative group">
          <img
            :src="country.flag"
            :alt="country.flagAlt"
            loading="lazy"
            class="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-100 dark:bg-gray-800"
          />
          <UBadge
            color="white"
            variant="solid"
            class="absolute top-3 right-3 shadow-md font-mono font-bold"
          >
            {{ country.cca3 }}
          </UBadge>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h2
              class="text-xl font-bold tracking-tight truncate"
              :title="country.name"
            >
              {{ country.name }}
            </h2>
            <p
              class="text-xs text-gray-500 truncate"
              :title="country.officialName"
            >
              {{ country.officialName }}
            </p>

            <div class="mt-4 space-y-1.5 text-sm">
              <div
                class="flex items-center justify-between text-gray-600 dark:text-gray-400"
              >
                <span class="flex items-center gap-1.5"
                  ><UIcon name="i-heroicons-building-office-2" /> Stolica:</span
                >
                <span
                  class="font-medium text-gray-900 dark:text-gray-200 truncate max-w-[130px]"
                  >{{ country.capital }}</span
                >
              </div>
              <div
                class="flex items-center justify-between text-gray-600 dark:text-gray-400"
              >
                <span class="flex items-center gap-1.5"
                  ><UIcon name="i-heroicons-globe-alt" /> Region:</span
                >
                <span class="font-medium text-gray-900 dark:text-gray-200">{{
                  country.region
                }}</span>
              </div>
              <div
                class="flex items-center justify-between text-gray-600 dark:text-gray-400"
              >
                <span class="flex items-center gap-1.5"
                  ><UIcon name="i-heroicons-user-group" /> Populacja:</span
                >
                <span class="font-medium text-gray-900 dark:text-gray-200">{{
                  country.population.toLocaleString("pl-PL")
                }}</span>
              </div>
            </div>
          </div>

          <div
            class="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800"
          >
            <UButton
              :to="`/countries/${country.cca3}`"
              color="primary"
              variant="solid"
              class="flex-1 justify-center"
              icon="i-heroicons-eye"
            >
              Szczegóły
            </UButton>
            <UTooltip text="Dodaj do listy podróży">
              <UButton
                color="red"
                variant="soft"
                icon="i-heroicons-heart"
                :loading="addingCode === country.cca3"
                @click="addToFavorites(country)"
              />
            </UTooltip>
          </div>
        </div>
      </UCard>
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
