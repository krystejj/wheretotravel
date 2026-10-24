<script setup lang="ts">
import type { ApiResponse, NormalizedCountry } from "~/types";

const { data: response, pending } = await useFetch<
  ApiResponse<NormalizedCountry[]>
>("/api/countries", {
  lazy: true,
});

const allCountries = computed(() => response.value?.data || []);

const selectedCodes = ref<string[]>(["POL", "DEU", "FRA"]);

const selectedCountries = computed(() => {
  return allCountries.value.filter((c) => selectedCodes.value.includes(c.cca3));
});

const countrySelectOptions = computed(() => {
  return allCountries.value.map((c) => ({
    label: `${c.name} (${c.cca3})`,
    value: c.cca3,
  }));
});
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-black tracking-tight">Porównywarka Państw</h1>

    <!-- Wybór państw -->
    <UCard>
      <div class="space-y-3">
        <label class="text-sm font-semibold"
          >Wybierz państwa do porównania:</label
        >
        <USelectMenu
          v-model="selectedCodes"
          :options="countrySelectOptions"
          value-attribute="value"
          option-attribute="label"
          multiple
          searchable
          placeholder="Wyszukaj i zaznacz państwa..."
          size="lg"
        />
      </div>
    </UCard>

    <USkeleton v-if="pending" class="h-96 w-full rounded-3xl" />

    <template v-else-if="selectedCountries.length > 0">
      <!-- Wykresy -->
      <ClientOnly>
        <CountryCharts :countries="selectedCountries" />
      </ClientOnly>

      <!-- Tabela Porównawcza -->
      <UCard class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-800">
              <th class="py-3 px-4 font-bold text-gray-500">Kraj</th>
              <th
                v-for="c in selectedCountries"
                :key="c.cca3"
                class="py-3 px-4 font-bold"
              >
                <div class="flex items-center gap-2">
                  <img
                    :src="c.flag"
                    :alt="c.name"
                    class="w-6 h-4 object-cover rounded shadow-sm"
                  />
                  <span>{{ c.name }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr>
              <td class="py-3 px-4 text-gray-500 font-medium">Stolica</td>
              <td
                v-for="c in selectedCountries"
                :key="c.cca3"
                class="py-3 px-4"
              >
                {{ c.capital }}
              </td>
            </tr>
            <tr>
              <td class="py-3 px-4 text-gray-500 font-medium">Region</td>
              <td
                v-for="c in selectedCountries"
                :key="c.cca3"
                class="py-3 px-4"
              >
                {{ c.region }} ({{ c.subregion }})
              </td>
            </tr>
            <tr>
              <td class="py-3 px-4 text-gray-500 font-medium">Populacja</td>
              <td
                v-for="c in selectedCountries"
                :key="c.cca3"
                class="py-3 px-4 font-bold"
              >
                {{ c.population.toLocaleString("pl-PL") }}
              </td>
            </tr>
            <tr>
              <td class="py-3 px-4 text-gray-500 font-medium">Powierzchnia</td>
              <td
                v-for="c in selectedCountries"
                :key="c.cca3"
                class="py-3 px-4"
              >
                {{ c.area.toLocaleString("pl-PL") }} km²
              </td>
            </tr>
            <tr>
              <td class="py-3 px-4 text-gray-500 font-medium">
                Gęstość zaludnienia
              </td>
              <td
                v-for="c in selectedCountries"
                :key="c.cca3"
                class="py-3 px-4"
              >
                {{ c.density }} os./km²
              </td>
            </tr>
            <tr>
              <td class="py-3 px-4 text-gray-500 font-medium">Waluta</td>
              <td
                v-for="c in selectedCountries"
                :key="c.cca3"
                class="py-3 px-4"
              >
                {{
                  c.currencies
                    .map((curr) => `${curr.name} (${curr.symbol})`)
                    .join(", ")
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </UCard>
    </template>
  </div>
</template>
