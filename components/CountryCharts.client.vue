<script setup lang="ts">
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import type { NormalizedCountry } from "~/types";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

const props = defineProps<{
  countries: NormalizedCountry[];
}>();

// Wykres populacji
const populationData = computed(() => ({
  labels: props.countries.map((c) => c.name),
  datasets: [
    {
      label: "Liczba ludności",
      backgroundColor: "#3b82f6",
      borderRadius: 8,
      data: props.countries.map((c) => c.population),
    },
  ],
}));

// Wykres powierzchni
const areaData = computed(() => ({
  labels: props.countries.map((c) => c.name),
  datasets: [
    {
      label: "Powierzchnia [km²]",
      backgroundColor: "#10b981",
      borderRadius: 8,
      data: props.countries.map((c) => c.area),
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: { font: { family: "inherit", weight: 600 } },
    },
  },
};
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <UCard>
      <template #header>
        <h3 class="font-bold text-base">Populacja</h3>
      </template>
      <div class="h-72">
        <Bar :data="populationData" :options="chartOptions" />
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h3 class="font-bold text-base">Powierzchnia</h3>
      </template>
      <div class="h-72">
        <Bar :data="areaData" :options="chartOptions" />
      </div>
    </UCard>
  </div>
</template>
