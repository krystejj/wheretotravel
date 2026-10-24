<script setup lang="ts">
import type { ApiResponse, NormalizedCountry } from "~/types";

const {
  data: response,
  pending,
  error,
} = await useFetch<ApiResponse<NormalizedCountry[]>>("/api/countries", {
  lazy: true,
});

const countries = computed(() => response.value?.data || []);
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <h1 class="text-3xl font-black tracking-tight">Mapa Świata</h1>
      <p class="text-gray-500 text-sm mt-1">
        Kliknij punkt, aby zobaczyć podgląd.
      </p>
    </div>

    <!-- Stan błędu -->
    <div
      v-if="error"
      class="p-8 text-center bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200"
    >
      <p class="text-red-600">
        Nie udało się załadować danych geograficznych do mapy.
      </p>
    </div>

    <!-- Stan ładowania -->
    <USkeleton v-else-if="pending" class="w-full h-[650px] rounded-3xl" />

    <!-- Mapa -->
    <ClientOnly v-else>
      <WorldMap :countries="countries" />
      <template #fallback>
        <USkeleton class="w-full h-[650px] rounded-3xl" />
      </template>
    </ClientOnly>
  </div>
</template>
