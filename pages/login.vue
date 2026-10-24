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
            Uzyskaj dostęp do swoich zapisanych krajów i notatek
          </p>
        </div>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-4">
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
          Zaloguj się
        </UButton>
      </form>
    </UCard>
  </div>
</template>
