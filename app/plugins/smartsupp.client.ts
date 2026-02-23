export default defineNuxtPlugin(() => {
  if (process.client) {
    (window as any)._smartsupp = (window as any)._smartsupp || {};
    (window as any)._smartsupp.key = 'ba13e9222270e05662782e04c9b0c2d357b08ea4';

    const script = document.createElement('script');
    script.src = 'https://www.smartsuppchat.com/loader.js';
    script.async = true;

    document.head.appendChild(script);
  }
});