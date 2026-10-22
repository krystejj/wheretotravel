<script setup lang="ts">
import type { ApiResponse, FavoriteCountry, TravelNote } from "~/types";

const user = useSupabaseUser();
const router = useRouter();
const toast = useToast();

// Jeśli nie zalogowany przekierowanie do /login
watchEffect(() => {
  if (!user.value) {
    router.push("/login");
  }
});

// Pobranie ulubionych i notatek
const { data: favsRes, refresh: refreshFavs } =
  await useFetch<ApiResponse<FavoriteCountry[]>>("/api/favorites");
const { data: notesRes, refresh: refreshNotes } =
  await useFetch<ApiResponse<TravelNote[]>>("/api/notes");

const favorites = computed(() => favsRes.value?.data || []);
const notes = computed(() => notesRes.value?.data || []);

// Usunięcie z ulubionych
const removeFavorite = async (id: string) => {
  try {
    await $fetch(`/api/favorites/${id}`, { method: "DELETE" });
    toast.add({
      title: "Usunięto z listy ulubionych",
      color: "green",
      icon: "i-heroicons-check",
    });
    refreshFavs();
  } catch (err: any) {
    toast.add({
      title: "Błąd",
      description: err.data?.error?.message,
      color: "red",
    });
  }
};

// Edycja notatki
const isEditModalOpen = ref(false);
const editingNote = ref<TravelNote | null>(null);
const editTitle = ref("");
const editContent = ref("");
const editRating = ref(5);
const isUpdating = ref(false);

const openEditModal = (note: TravelNote) => {
  editingNote.value = note;
  editTitle.value = note.title;
  editContent.value = note.content;
  editRating.value = note.rating;
  isEditModalOpen.value = true;
};

const handleUpdateNote = async () => {
  if (!editingNote.value) return;
  isUpdating.value = true;
  try {
    await $fetch(`/api/notes/${editingNote.value.id}`, {
      method: "PUT",
      body: {
        title: editTitle.value,
        content: editContent.value,
        rating: editRating.value,
      },
    });
    toast.add({ title: "Notatka zaktualizowana!", color: "green" });
    isEditModalOpen.value = false;
    refreshNotes();
  } catch (err: any) {
    toast.add({
      title: "Błąd edycji",
      description: err.data?.error?.message,
      color: "red",
    });
  } finally {
    isUpdating.value = false;
  }
};

// Usunięcie notatki
const deleteNote = async (id: string) => {
  if (!confirm("Czy na pewno chcesz usunąć tę notatkę?")) return;
  try {
    await $fetch(`/api/notes/${id}`, { method: "DELETE" });
    toast.add({ title: "Notatka została usunięta", color: "green" });
    refreshNotes();
  } catch (err: any) {
    toast.add({
      title: "Błąd",
      description: err.data?.error?.message,
      color: "red",
    });
  }
};

const tabItems = [
  { label: "Ulubione Państwa", icon: "i-heroicons-heart" },
  { label: "Moje Notatki", icon: "i-heroicons-pencil-square" },
];
</script>

<template>
  <div v-if="user" class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black tracking-tight">
          Twój Panel Podróżnika
        </h1>
        <p class="text-gray-500 text-sm mt-1">
          Zarządzaj swoimi planami i zapisanymi kierunkami.
        </p>
      </div>
      <UBadge color="primary" variant="subtle" size="lg">
        {{ user.email }}
      </UBadge>
    </div>

    <UTabs :items="tabItems" class="w-full">
      <!-- 1: ulubione kraje -->
      <template #item="{ index }">
        <div v-if="index === 0" class="mt-6 space-y-4">
          <div
            v-if="favorites.length === 0"
            class="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800"
          >
            <UIcon
              name="i-heroicons-heart"
              class="w-12 h-12 text-gray-300 mx-auto mb-2"
            />
            <p class="text-gray-500">
              Nie dodałeś jeszcze żadnego państwa do ulubionych.
            </p>
            <UButton to="/" color="primary" class="mt-4"
              >Przeglądaj państwa</UButton
            >
          </div>

          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <UCard v-for="fav in favorites" :key="fav.id">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-xl font-bold font-mono">{{
                    fav.country_code
                  }}</span>
                  <UBadge
                    :color="fav.status === 'visited' ? 'green' : 'blue'"
                    variant="subtle"
                    class="ml-2"
                  >
                    {{
                      fav.status === "visited" ? "Odwiedzone" : "Chcę odwiedzić"
                    }}
                  </UBadge>
                </div>
                <div class="flex gap-2">
                  <UButton
                    :to="`/countries/${fav.country_code}`"
                    size="xs"
                    color="gray"
                    >Profil</UButton
                  >
                  <UButton
                    color="red"
                    variant="ghost"
                    size="xs"
                    icon="i-heroicons-trash"
                    @click="removeFavorite(fav.id)"
                  />
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- 2: notatki -->
        <div v-if="index === 1" class="mt-6 space-y-4">
          <div
            v-if="notes.length === 0"
            class="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800"
          >
            <UIcon
              name="i-heroicons-document-text"
              class="w-12 h-12 text-gray-300 mx-auto mb-2"
            />
            <p class="text-gray-500">
              Brak utworzonych notatek. Wejdź na profil dowolnego kraju, aby
              dodać pierwszą.
            </p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UCard v-for="note in notes" :key="note.id">
              <template #header>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UBadge color="gray" font="mono">{{
                      note.country_code
                    }}</UBadge>
                    <h3 class="font-bold truncate max-w-[200px]">
                      {{ note.title }}
                    </h3>
                  </div>
                  <UBadge color="yellow" variant="subtle"
                    >★ {{ note.rating }}/5</UBadge
                  >
                </div>
              </template>
              <p
                class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line"
              >
                {{ note.content }}
              </p>
              <template #footer>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-400">{{
                    new Date(note.created_at).toLocaleDateString("pl-PL")
                  }}</span>
                  <div class="flex gap-2">
                    <UButton
                      size="xs"
                      color="gray"
                      icon="i-heroicons-pencil"
                      @click="openEditModal(note)"
                      >Edytuj</UButton
                    >
                    <UButton
                      size="xs"
                      color="red"
                      variant="soft"
                      icon="i-heroicons-trash"
                      @click="deleteNote(note.id)"
                      >Usuń</UButton
                    >
                  </div>
                </div>
              </template>
            </UCard>
          </div>
        </div>
      </template>
    </UTabs>

    <!-- Edycja notatki -->
    <UModal v-model="isEditModalOpen">
      <UCard>
        <template #header>
          <h3 class="font-bold text-lg">
            Edycja notatki: {{ editingNote?.country_code }}
          </h3>
        </template>
        <form @submit.prevent="handleUpdateNote" class="space-y-4">
          <UFormGroup label="Tytuł" required>
            <UInput v-model="editTitle" />
          </UFormGroup>
          <UFormGroup label="Ocena">
            <USelect v-model="editRating" :options="[5, 4, 3, 2, 1]" />
          </UFormGroup>
          <UFormGroup label="Treść" required>
            <UTextarea v-model="editContent" rows="4" />
          </UFormGroup>
          <div class="flex justify-end gap-2 pt-4">
            <UButton
              color="gray"
              variant="ghost"
              @click="isEditModalOpen = false"
              >Anuluj</UButton
            >
            <UButton type="submit" color="primary" :loading="isUpdating"
              >Zapisz zmiany</UButton
            >
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
