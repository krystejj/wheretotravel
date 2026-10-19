<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import type { NormalizedCountry } from "~/types";

const props = defineProps<{
  countries: NormalizedCountry[];
}>();

const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: any = null;

onMounted(async () => {
  if (!process.client || !mapContainer.value) return;
  const L = await import("leaflet");

  // Inicjalizacja mapy
  mapInstance = L.map(mapContainer.value, {
    center: [25, 10],
    zoom: 2.5,
    minZoom: 2,
    maxZoom: 8,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(mapInstance);

  // Znaczniki państw
  props.countries.forEach((country) => {
    if (!country.latlng || country.latlng.length < 2) return;
    const [lat, lng] = country.latlng;
    if (lat === 0 && lng === 0) return;

    const marker = L.circleMarker([lat, lng], {
      radius: 6,
      fillColor: "#3b82f6",
      color: "#1d4ed8",
      weight: 1.5,
      opacity: 1,
      fillOpacity: 0.8,
    }).addTo(mapInstance);

    const popupContent = `
      <div style="font-family: inherit; min-width: 170px; padding: 4px;">
        <img src="${country.flag}" alt="${country.name}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 6px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" />
        <strong style="font-size: 14px; display: block; color: #111;">${country.name}</strong>
        <div style="font-size: 12px; color: #555; margin-top: 2px;">Stolica: <b>${country.capital}</b></div>
        <div style="font-size: 12px; color: #555;">Populacja: <b>${country.population.toLocaleString("pl-PL")}</b></div>
        <a href="/countries/${country.cca3}" style="display: block; margin-top: 8px; text-align: center; background: #2563eb; color: #fff; padding: 5px 8px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 600;">
          Zobacz profil kraju &rarr;
        </a>
      </div>
    `;
    marker.bindPopup(popupContent);
  });
});

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
  }
});
</script>

<template>
  <div
    ref="mapContainer"
    class="w-full h-[650px] rounded-3xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-800 z-10"
  />
</template>
