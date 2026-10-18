<script setup lang="ts">
const supabase = useSupabaseClient();
const router = useRouter();
const toast = useToast();

const email = ref("");
const password = ref("");
const loading = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    toast.add({
      title: "Błąd",
      description: "Wypełnij wszystkie pola",
      color: "red",
    });
    return;
  }

  loading.value = true;
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) throw error;

    toast.add({
      title: "Zalogowano pomyślnie!",
      description: "Witaj z powrotem w WhereToTravel.",
      color: "green",
      icon: "i-heroicons-check-circle",
    });
    router.push("/dashboard");
  } catch (error: any) {
    toast.add({
      title: "Błąd logowania",
      description: error.message || "Nieprawidłowy login lub hasło.",
      color: "red",
      icon: "i-heroicons-x-circle",
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto my-12">
    <UCard>
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">Zaloguj się</h1>
          <p class="text-sm text-gray-500 mt-1">
            Uzyskaj dostęp do ulubionych krajów i notatek
          </p>
        </div>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <UFormGroup label="Adres E-mail" required>
          <UInput
            v-model="email"
            type="email"
            placeholder="twoj@email.pl"
            icon="i-heroicons-envelope"
            size="lg"
          />
        </UFormGroup>

        <UFormGroup label="Hasło" required>
          <UInput
            v-model="password"
            type="password"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            size="lg"
          />
        </UFormGroup>

        <UButton
          type="submit"
          color="primary"
          block
          size="lg"
          :loading="loading"
          class="mt-6"
        >
          Zaloguj się
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-500">
          Nie masz jeszcze konta?
          <NuxtLink
            to="/register"
            class="text-primary-500 font-semibold hover:underline"
          >
            Zarejestruj się
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
