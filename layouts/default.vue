<script setup lang="ts">
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const router = useRouter();
const toast = useToast();

const isMobileMenuOpen = ref(false);

const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
    toast.add({
      title: "Wylogowano pomyślnie",
      description: "Do zobaczenia w kolejnej podróży!",
      color: "green",
      icon: "i-heroicons-check-circle",
    });
    router.push("/");
  } catch (error: any) {
    toast.add({
      title: "Błąd wylogowywania",
      description: error.message,
      color: "red",
      icon: "i-heroicons-exclamation-triangle",
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
    <!-- Górny pasek nawigacji -->
    <header
      class="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
      >
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <div
            class="p-2 rounded-xl bg-primary-500/10 text-primary-500 group-hover:scale-105 transition-transform"
          >
            <UIcon
              name="i-heroicons-paper-airplane"
              class="w-6 h-6 rotate-45"
            />
          </div>
          <span
            class="text-xl font-black tracking-tight bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent"
          >
            WhereToTravel
          </span>
        </NuxtLink>

        <!-- Linki na desktopie -->
        <nav class="hidden md:flex items-center gap-1">
          <UButton
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            variant="ghost"
            color="gray"
            :icon="link.icon"
            class="font-medium"
          >
            {{ link.label }}
          </UButton>
          <UButton
            v-if="user"
            to="/dashboard"
            variant="ghost"
            color="gray"
            icon="i-heroicons-bookmark-square"
            class="font-medium"
          >
            Mój Panel
          </UButton>
        </nav>

        <!-- Przyciski akcji i profil -->
        <div class="hidden md:flex items-center gap-3">
          <UColorModeButton />

          <template v-if="user">
            <UBadge color="primary" variant="subtle" size="md">
              {{ user.email }}
            </UBadge>
            <UButton
              color="red"
              variant="soft"
              size="sm"
              icon="i-heroicons-arrow-left-on-rectangle"
              @click="handleLogout"
            >
              Wyloguj
            </UButton>
          </template>

          <template v-else>
            <UButton to="/login" variant="ghost" color="gray" size="sm">
              Zaloguj się
            </UButton>
            <UButton to="/register" color="primary" size="sm">
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
        class="md:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-2 pb-4 space-y-2"
      >
        <UButton
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          variant="ghost"
          color="gray"
          :icon="link.icon"
          block
          @click="isMobileMenuOpen = false"
        >
          {{ link.label }}
        </UButton>
        <UButton
          v-if="user"
          to="/dashboard"
          variant="ghost"
          color="gray"
          icon="i-heroicons-bookmark-square"
          block
          @click="isMobileMenuOpen = false"
        >
          Mój Panel
        </UButton>

        <div class="pt-2 border-t border-gray-200 dark:border-gray-800">
          <template v-if="user">
            <div class="text-xs text-gray-500 mb-2 truncate">
              Zalogowano: {{ user.email }}
            </div>
            <UButton
              color="red"
              variant="soft"
              block
              icon="i-heroicons-arrow-left-on-rectangle"
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
                variant="outline"
                color="gray"
                block
                @click="isMobileMenuOpen = false"
              >
                Logowanie
              </UButton>
              <UButton
                to="/register"
                color="primary"
                block
                @click="isMobileMenuOpen = false"
              >
                Rejestracja
              </UButton>
            </div>
          </template>
        </div>
      </div>
    </header>

    <!-- Główna zawartość strony -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Stopka -->
    <footer
      class="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 py-6"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4"
      >
        <div>WhereToTravel</div>
        <div class="flex items-center gap-2">
          <span>Źródło danych:</span>
          <a
            href="https://restcountries.com"
            target="_blank"
            rel="noopener"
            class="text-primary-500 hover:underline"
          >
            REST Countries v5.0 API
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>
