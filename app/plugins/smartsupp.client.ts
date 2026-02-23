export default defineNuxtPlugin(() => {
  if (process.client) {
    (window as any)._smartsupp = (window as any)._smartsupp || {};
    (window as any)._smartsupp.key = '4d7c756d0974d36c03f1d10fd581e60b9c79b432';

    const script = document.createElement('script');
    script.src = 'https://www.smartsuppchat.com/loader.js';
    script.async = true;

    document.head.appendChild(script);
  }
});