export default defineNuxtPlugin(() => {
  const script = document.createElement('script')
  script.innerHTML = `
    var _smartsupp = _smartsupp || {};
    _smartsupp.key = 'ba13e9222270e05662782e04c9b0c2d357b08ea4';
    window.smartsupp||(function(d) {
      var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
      s=d.getElementsByTagName('script')[0];c=d.createElement('script');
      c.type='text/javascript';c.charset='utf-8';c.async=true;
      c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
    })(document);
  `
  document.head.appendChild(script)
})