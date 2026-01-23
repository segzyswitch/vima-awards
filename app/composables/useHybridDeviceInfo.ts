export const useHybridDeviceInfo = async () => {
  const locale = useLocaleStore()

  if (!locale.countryCode) {
    const geo = await $fetch('/api/geo')
    locale.setFromGeo(geo)
  }

  return {
    country: locale.countryName,
    countryCode: locale.countryCode,
    currency: locale.currency
  }
}
