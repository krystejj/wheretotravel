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
      title: "Zarejestrowano!",
      description: "Możesz się zalogować.",
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
          <h1 class="text-2xl font-bold">Zarejestruj sie</h1>
          <p class="text-sm text-gray-500 mt-1">Dołącz do WhereToTravel</p>
        </div>
      </template>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <UFormGroup required>
          <UInput
            v-model="username"
            placeholder="Nazwa użytkownika"
            icon="i-heroicons-user"
            size="lg"
          />
        </UFormGroup>

        <UFormGroup required>
          <UInput
            v-model="email"
            type="email"
            placeholder="Adres e-mail"
            icon="i-heroicons-envelope"
            size="lg"
          />
        </UFormGroup>

        <UFormGroup required>
          <UInput
            v-model="password"
            type="password"
            placeholder="Hasło"
            icon="i-heroicons-lock-closed"
            size="lg"
          />
        </UFormGroup>

        <UButton
          type="submit"
          color="gray"
          block
          size="lg"
          :loading="loading"
          class="font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 mt-6"
        >
          Zarejestruj konto
        </UButton>
      </form>
    </UCard>
  </div>
</template>
