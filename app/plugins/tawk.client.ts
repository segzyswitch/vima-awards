export default defineNuxtPlugin(() => {
  if (process.client) {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement('script');
    script.src = 'https://embed.tawk.to/699ddf79975db01c34f4a320/1ji8b1tbh';
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    document.body.appendChild(script);
  }
});