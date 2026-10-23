<script setup lang="ts">
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const router = useRouter();
const toast = useToast();
const isMobileMenuOpen = ref(false);

const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
    toast.add({ title: "Wylogowano pomyślnie", color: "gray" });
    router.push("/");
  } catch (error: any) {
    toast.add({
      title: "Błąd wylogowywania",
      description: error.message,
      color: "red",
    });
  }
};

const navLinks = [
  { label: "Odkrywaj", to: "/", icon: "i-heroicons-globe-europe-africa" },
  { label: "Mapa Świata", to: "/map", icon: "i-heroicons-map" },
  { label: "Porównywarka", to: "/compare", icon: "i-heroicons-chart-bar" },
];
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header
      class="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-zinc-200 dark:border-zinc-800/80 transition-colors"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
      >
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <span
            class="text-base font-bold tracking-tight text-zinc-900 dark:text-white"
          >
            WhereToTravel
          </span>
        </NuxtLink>

        <!-- Linki (desktop) -->
        <nav class="hidden md:flex items-center gap-1">
          <UButton
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            variant="ghost"
            color="gray"
            class="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm font-medium"
          >
            {{ link.label }}
          </UButton>
          <UButton
            v-if="user"
            to="/dashboard"
            variant="ghost"
            color="gray"
            class="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm font-medium"
          >
            Mój Panel
          </UButton>
        </nav>

        <!-- Akcje i toggle motywu -->
        <div class="hidden md:flex items-center gap-3">
          <UColorModeButton />

          <template v-if="user">
            <span
              class="text-xs text-zinc-600 dark:text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800"
            >
              {{ user.email }}
            </span>
            <UButton
              color="gray"
              variant="outline"
              size="sm"
              @click="handleLogout"
            >
              Wyloguj
            </UButton>
          </template>

          <template v-else>
            <UButton
              to="/login"
              variant="ghost"
              color="gray"
              size="sm"
              class="text-zinc-700 dark:text-zinc-300"
            >
              Zaloguj się
            </UButton>
            <UButton
              to="/register"
              color="gray"
              size="sm"
              class="font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Rejestracja
            </UButton>
          </template>
        </div>

        <!-- Przycisk menu mobilnego -->
        <div class="flex items-center gap-2 md:hidden">
          <UColorModeButton />
          <UButton
            variant="ghost"
            color="gray"
            :icon="
              isMobileMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'
            "
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          />
        </div>
      </div>

      <!-- Menu mobilne -->
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-2 pb-4 space-y-2"
      >
        <UButton
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          variant="ghost"
          color="gray"
          block
          class="justify-start text-zinc-700 dark:text-zinc-300"
          @click="isMobileMenuOpen = false"
        >
          {{ link.label }}
        </UButton>
        <UButton
          v-if="user"
          to="/dashboard"
          variant="ghost"
          color="gray"
          block
          class="justify-start text-zinc-700 dark:text-zinc-300"
          @click="isMobileMenuOpen = false"
        >
          Mój Panel
        </UButton>

        <div class="pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <template v-if="user">
            <UButton
              color="gray"
              variant="ghost"
              block
              @click="
                handleLogout();
                isMobileMenuOpen = false;
              "
            >
              Wyloguj się
            </UButton>
          </template>
          <template v-else>
            <div class="grid grid-cols-2 gap-2">
              <UButton
                to="/login"
                variant="ghost"
                color="gray"
                block
                @click="isMobileMenuOpen = false"
                >Logowanie</UButton
              >
              <UButton
                to="/register"
                color="gray"
                block
                class="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                @click="isMobileMenuOpen = false"
                >Rejestracja</UButton
              >
            </div>
          </template>
        </div>
      </div>
    </header>

    <!-- Główna zawartość -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Stopka -->
    <footer
      class="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-black py-8 mt-12 text-xs text-zinc-500"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>WhereToTravel</div>
        <div class="flex items-center gap-2">
          <span>Dane: </span>
          <a
            href="https://restcountries.com"
            target="_blank"
            rel="noopener"
            class="text-zinc-600 dark:text-zinc-400 hover:underline"
            >REST Countries v5.0</a
          >
        </div>
      </div>
    </footer>
  </div>
</template>
