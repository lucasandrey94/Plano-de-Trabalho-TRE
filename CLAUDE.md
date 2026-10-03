# Plano de Trabalho TRE-AM 2026 — Manutenção de escolas SEMED Manaus

Dashboard web que acompanha a manutenção (ar-condicionado e predial) das escolas municipais de Manaus que serão locais de votação nas Eleições 2026. Usado pela SEMED (ADM Geral), pelas empresas contratadas e por um perfil de consulta.

Responda sempre em português.

## Arquitetura

- `index.html` — o site inteiro num arquivo só (HTML + CSS + JS). Publicado no GitHub Pages:
  https://lucasandrey94.github.io/Plano-de-Trabalho-TRE/
  O nome do arquivo tem que ser exatamente `index.html` (minúsculo). `Index.html` vira outro arquivo e o site não atualiza.
- `apps-script/Code.gs` — backend em Google Apps Script (API + login). **Este arquivo contém as senhas de todos os usuários e NUNCA pode ser commitado** — o repositório é público. A pasta `apps-script/` está no `.gitignore`. Antes de qualquer commit, confira com `git status` que nada dessa pasta entrou.
- Banco de dados: Google Sheets
  - ID: `180_gpk98fE8M0LEuGCbuvIZ8Ts-uz0xB7MQq9LFfMV8`
  - Aba 1 (`Página1`): uma linha por escola
  - Aba `Chamados`: criada automaticamente pelo Apps Script no primeiro uso
- URL publicada do Apps Script (já embutida no `index.html` como `APPS_SCRIPT_URL`):
  https://script.google.com/macros/s/AKfycbwvJsX71-0Ka-fNN57THYsUB5tbx03l4QcLG2xXAefDrwv2wAOXRO6Q4tpDjsfkjEJ6Wg/exec
- Bibliotecas por CDN: Leaflet 1.9.4 (mapa, tiles Esri) e Chart.js 4.4.4 (gráficos).

## Deploy

- Site: commit + push do `index.html` na branch `main`. O GitHub Pages atualiza sozinho em ~1 minuto.
- Apps Script: não há deploy automático. O usuário cola o conteúdo de `apps-script/Code.gs` no editor do Apps Script e faz **Implantar → Gerenciar implantações → editar → Nova versão → Implantar**. Sempre "Nova versão" na implantação existente, nunca uma implantação nova (isso mudaria a URL).
- Quando uma mudança mexer nos dois lados, avise que o Apps Script tem que ser atualizado **antes** do HTML.
- Hospedar o site pelo próprio Apps Script (HtmlService) foi tentado e não funcionou; não voltar para essa opção.

## Planilha — aba Página1 (21 colunas, A→U)

`id, zona, n, ddz, imovel, local, ac_sol, ac_emp, ac_status, pred_sol, crit_elet, pred_emp, pred_status, lat, lon, sigeam, demanda_planilha, demanda_pdf, demanda_final, pdf_json, secoes`

- Existem linhas em branco de propósito (sobras de fusões de duplicatas). O sistema ignora linhas sem `local`; qualquer contagem deve fazer o mesmo.
- Cerca de 257 escolas ativas (o número muda quando o ADM adiciona/exclui).
- Escola nova recebe `id` e `n` = maior valor existente + 1.

## Planilha — aba Chamados (12 colunas, todas texto)

`id, data, zona, escola, secoes, secao, categoria, empresa, status, descricao, criado_por, atualizado_em`

- Categorias: `Ar-condicionado`, `Predial`
- Empresas: `PLATINA, CB BOTELHO, SEMED, ECOLIFE, MCA, MMGR, ENS, PAIVA, SELF`
- Status: `Aberto`, `Em andamento`, `Concluído`
- Todas as colunas com formato texto, para não perder zero à esquerda da seção (ex: 0412).

## Regras de dados que já causaram bugs

- **Planilha em português (vírgula decimal).** Nunca gravar coordenada como texto: ponto vira separador de milhar (`-60.025357` vira `-60025357`). O Apps Script converte com `parseCoord_()` antes de gravar. Para escrever pela API do Sheets, use valores numéricos com `valueInputOption: RAW`, nunca `USER_ENTERED` com ponto.
- Status equivalentes: `EM ANDAMENTO` = `ENCAMINHADO` (pendente); `CONCLUÍDO` = `FINALIZADO` (concluído).
- Sem demanda: `SEM SOLICITAÇÃO DE MANUTENÇÃO DE AR CONDICIONADO` (AC) e `SEM SERVIÇOS SOLICITADOS PARA O PLEITO` (predial), além de `Não informado`.
- Nomes de escola variam entre fontes (acentos, "PT" no final, grafias como FRASSINETE/FRASSINETTI). Para cruzar listas, normalize (maiúsculas, sem acento, sem pontuação) e use similaridade, conferindo os casos duvidosos com o usuário.

## Perfis de acesso (senhas só no Code.gs)

- `admgeral` — ADM Geral, admin total (editar, excluir, abrir chamado, mudar status)
- `consulta` — somente leitura
- `semed` — "Manutenção Própria", empresa SEMED
- Uma conta por empresa (paiva, self, suplex, mca, mmgr, acconstrucao, cbbotelho, ens, attalea, devision, qualitech, platina). Empresa vê só as escolas e chamados dela; o filtro é feito no servidor.

## Endpoints do Apps Script

- `GET ?session=TOKEN` → dados agrupados por zona (filtrados por empresa)
- `POST` com `{action, session, ...}`: `login`, `marcar-concluido`, `desmarcar-concluido` (admin), `escola-salvar` (admin), `escola-excluir` (admin), `chamados-listar` (inclusive consulta), `chamado-salvar`, `chamado-status`, `chamado-excluir` (admin)
- O front usa `Content-Type: text/plain` no POST de propósito, para evitar o preflight CORS que o Apps Script não responde.
- Sessões ficam no CacheService por 6 horas.

## Convenções do front (index.html)

- Atualização automática a cada 5 minutos com `refreshAllData(true)` e `refreshChamados(true)`: compara com o snapshot anterior e só redesenha se algo mudou, sem animação, sem perder filtros, busca ou posição da tela.
- Depois de salvar, concluir ou excluir: chamar `refreshAllData()` / `refreshChamados()`. **Não usar `location.reload()`** (perde filtros) — a única exceção é o botão de sair.
- Ao abrir modal, resetar o estado do botão de salvar (um bug antigo deixava "Salvando..." preso).
- Popup do mapa aberto adia o redesenho do mapa até fechar.
- `sessionStorage` só pelas funções `safeGet/safeSet/safeRemove`.
- Visual: paleta via variáveis CSS (`--ink`, `--paper`, `--paper-2`, `--line`, `--accent`, `--accent-2`, `--amber`), com modo claro e escuro. Manter o estilo existente.
- Usuário prefere relatórios com mais gráficos, pouco texto e poucas tabelas.

## Antes de entregar uma mudança

1. Validar a sintaxe do JS (extrair o último `<script>` e rodar `node --check`).
2. Confirmar que `APPS_SCRIPT_URL` continua sendo a URL de produção.
3. Testar o fluxo mexido (de preferência com um servidor simulado, sem tocar na planilha real).
4. `git status` sem nada de `apps-script/`.
