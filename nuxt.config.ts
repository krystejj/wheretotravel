// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxtjs/supabase"],

  supabase: {
    redirect: false,
  },

  runtimeConfig: {
    public: {
      countriesApiBase: "https://api.restcountries.com/countries/v5",
    },
  },
});
