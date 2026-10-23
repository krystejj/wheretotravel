// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxtjs/supabase"],

  colorMode: {
    preference: "system",
    fallback: "light",
    classSuffix: "",
  },

  supabase: {
    redirect: false,
  },

  runtimeConfig: {
    countriesApiKey: process.env.REST_COUNTRIES_API_KEY || "rc_live_demo",
    countriesApiBase: "https://api.restcountries.com/countries/v5",
    public: {
      countriesApiBase: "https://api.restcountries.com/countries/v5",
    },
  },
});
