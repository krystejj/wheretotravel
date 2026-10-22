<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps({
  error: Object as () => NuxtError,
});

const handleError = () => clearError({ redirect: "/" });
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950 font-sans"
  >
    <div
      class="max-w-md w-full text-center space-y-4 p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800"
    >
      <div
        class="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center"
      >
        <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8" />
      </div>

      <h1 class="text-4xl font-black text-gray-900 dark:text-white">
        {{ props.error?.statusCode || 500 }}
      </h1>

      <p class="text-gray-500 text-sm">
        {{
          props.error?.statusMessage ||
          props.error?.message ||
          "Wystąpił nieoczekiwany błąd aplikacji."
        }}
      </p>

      <UButton
        color="primary"
        size="lg"
        block
        icon="i-heroicons-arrow-left"
        @click="handleError"
      >
        Wróć do strony głównej
      </UButton>
    </div>
  </div>
</template>
