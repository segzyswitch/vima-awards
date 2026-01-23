export const useLocaleStore = defineStore('locale', {
  state: () => ({
    currency: 'USD',
    countryCode: null as string | null,
    countryName: null as string | null,
  }),

  actions: {
    setFromGeo(geo: any) {
      this.currency = geo.currency || this.currency
      this.countryCode = geo.countryCode || null
      this.countryName = geo.country || null
    },
  },
})
