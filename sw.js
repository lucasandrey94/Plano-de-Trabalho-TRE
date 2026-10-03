// Service worker mínimo: existe só para o navegador oferecer "Instalar app".
// NÃO guarda nada em cache, de propósito: a página vai sempre direto para a
// rede, então o celular nunca fica preso numa versão antiga do site.
// Não adicionar cache aqui.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  // só a abertura da página passa por aqui (e vai direto pra rede); o resto
  // (Apps Script, mapa, bibliotecas) o navegador busca normalmente, sem o SW
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
  }
});
