// Service worker mínimo: existe só para o navegador oferecer "Instalar app".
// NÃO guarda nada em cache, de propósito: a página vai sempre direto para a
// rede, então o celular nunca fica preso numa versão antiga do site.
// Não adicionar cache aqui.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  // só a abertura da página passa por aqui; o resto (Apps Script, mapa,
  // bibliotecas) o navegador busca normalmente, sem o SW
  if (event.request.mode !== 'navigate') return;
  // "no-cache" = sempre confere com o servidor se a página mudou (o GitHub Pages
  // deixa o navegador reaproveitar a página por até 10 min; aqui isso não vale).
  // redirect "manual": se houver redirecionamento, o próprio navegador segue.
  event.respondWith(
    fetch(event.request.url, { cache: 'no-cache', credentials: 'same-origin', redirect: 'manual' })
      .catch(() => fetch(event.request))
  );
});
