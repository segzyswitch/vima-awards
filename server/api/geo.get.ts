export default defineEventHandler(async (event) => {
  const ipInfo: any = await $fetch('https://ipapi.co/json/')

  return {
    country: ipInfo.country_name,
    countryCode: ipInfo.country_code,
    currency: ipInfo.currency,
  }
})
