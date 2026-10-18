<script setup lang="ts">
const supabase = useSupabaseClient();
const router = useRouter();
const toast = useToast();

const username = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);

const handleRegister = async () => {
  if (!username.value || !email.value || !password.value) {
    toast.add({
      title: "Błąd",
      description: "Wypełnij wszystkie pola.",
      color: "red",
    });
    return;
  }

  if (password.value.length < 6) {
    toast.add({
      title: "Za krótkie hasło",
      description: "Hasło musi mieć co najmniej 6 znaków.",
      color: "yellow",
    });
    return;
  }

  loading.value = true;
  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          username: username.value,
        },
      },
    });

    if (error) throw error;

    toast.add({
      title: "Rejestracja zakończona sukcesem!",
      description: "Twoje konto jest aktywne. Możesz się zalogować.",
      color: "green",
      icon: "i-heroicons-check-circle",
    });
    router.push("/dashboard");
  } catch (error: any) {
    toast.add({
      title: "Błąd rejestracji",
      description: error.message,
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
          <h1 class="text-2xl font-bold">Stwórz nowe konto</h1>
          <p class="text-sm text-gray-500 mt-1">
            Dołącz do WhereToTravel i planuj podróże
          </p>
        </div>
      </template>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <UFormGroup label="Nazwa użytkownika" required>
          <UInput
            v-model="username"
            placeholder="np. Podróżnik123"
            icon="i-heroicons-user"
            size="lg"
          />
        </UFormGroup>

        <UFormGroup label="Adres E-mail" required>
          <UInput
            v-model="email"
            type="email"
            placeholder="twoj@email.pl"
            icon="i-heroicons-envelope"
            size="lg"
          />
        </UFormGroup>

        <UFormGroup label="Hasło (min. 6 znaków)" required>
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
          Zarejestruj konto
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-500">
          Masz już konto?
          <NuxtLink
            to="/login"
            class="text-primary-500 font-semibold hover:underline"
          >
            Przejdź do logowania
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
