# Plano de Implementação — Xani Image Studio

Implementar uma aplicação web de edição de imagem 100% client-side com Astro (minimal), React islands e Tailwind CSS, aplicando o design system do `/Demo Xani Design` num layout inspirado nos mockups de referência (`/Users/mac/Downloads/mockups`), processando imagens via Canvas API nativa.

---

## 1. Estrutura do Projeto
- **Framework**: Astro com template `minimal`.
- **Integrações**: `@astrojs/react` (islands interativas) + Tailwind CSS (`@astrojs/tailwind`).
- **Diretório**: Inicializar no `/Users/mac/TOOLS/IMAGE/studio-image`.
- **Pages**:
  - `/` — Homepage com header (título + subtítulo + toggle de tema), dropzone de upload central, grid de 5 cards de ferramentas (desabilitada até upload), footer.
  - `/crop`, `/resize`, `/convert`, `/compress`, `/rotate` — Páginas `.astro` com ilhas React para cada módulo.

## 2. Design System e Assets
- **Fonte primária**: `/Users/mac/Downloads/Demo Xani Design` — copiar e adaptar:
  - `xani-tokens.css`, `app.css` → `src/styles/`.
  - Fonts → `public/fonts/`.
  - Componentes base (`ui.jsx`, `pages-a.jsx`) → `src/components/xani/`.
  - Implementar Dark/Light mode toggle no header usando as variáveis de tema existentes.
- **Referência estrutural**: Mockups em `/Users/mac/Downloads/mockups` (1.png header, 2.png dropzone, 3.png grid) — usar a estrutura de layout (header com título grande, dropzone central com ícone e botão, grid de cards com header escuro + corpo branco + ícone circular).

## 3. Fluxo de Utilizador (Pipeline Encadeado)
1. **Homepage**: Upload de imagem (Drag & Drop + botão "Choose files"). Formatos: PNG, JPG, GIF, BMP, WebP. Limite: 5 MB.
2. **Grid de ferramentas** visível abaixo do dropzone desde o início, mas **desabilitada/cinzenta** até upload válido. Após upload, cards ficam ativos e navegam para a route da ferramenta.
3. Após upload válido: imagem convertida para `base64` e guardada no `localStorage` (chave `xani_image`).
4. **Páginas de edição**: Cada página lê a imagem do storage, apresenta preview no Canvas, aplica a transformação, guarda o resultado de volta no storage, e oferece download ou retorno à grid.
5. **Fallback de storage**: Se `localStorage` exceder quota, usar `sessionStorage`; se ainda insuficiente, usar `IndexedDB` (wrapper leve).

## 4. Arquitetura de Persistência
- `src/lib/storage.ts`: Abstração para `getImage()`, `setImage()`, `clearImage()`.
- Estratégia de fallback: `localStorage` → `sessionStorage` → `IndexedDB`.
- Chave única: `xani_image`.

## 5. Módulos de Edição (Canvas API Nativa)
- **Crop**: Seleção retangular com overlay no Canvas; extrair região via `drawImage()` com source rect.
- **Resize**: Inputs de largura/altura em px ou %; usar `drawImage()` para novo canvas.
- **Convert**: Dropdown PNG/JPG/WebP; `canvas.toDataURL()` / `canvas.toBlob()` com mime-type.
- **Compress**: Slider de qualidade (0–100). Para JPG/WebP: `toBlob(..., quality)`; para PNG: usar quantização simples ou library leve se necessário.
- **Rotate/Flip**: `ctx.rotate()`, `ctx.scale(-1, 1)` para mirror. Ângulos: 90°, 180°, 270° + horizontal/vertical flip.

## 6. Exportação
- Após cada edição: botão **"Download"** que gera blob/data-uri e dispara `<a download>`.
- Botão **"Aplicar e Continuar"** que guarda no storage e volta à grid/home.
- Botão **"Reiniciar"** para limpar storage e voltar à imagem original.

## 7. Header / Footer
- **Header**: Título "Xani Image Studio" em fonte mono-espaçada grande (esquerda), subtítulo "Edit images in your browser. Files never leave your device." abaixo, toggle Dark/Light (ícone sol/lua) à direita.
- **Footer**: Mensagem "Os ficheiros nunca saem do dispositivo." (ou equivalente em inglês).

## 8. Performance e Astro Islands
- Páginas estáticas `.astro` para shell/layout.
- Ilhas React apenas nos componentes interativos: `UploadDropzone`, `ToolGrid`, `CanvasEditor`, `ThemeToggle`.
- `client:load` ou `client:visible` consoante a criticidade do LCP.

## 9. Testes
- **Unitários (Vitest)**:
  - Lógica de storage (localStorage/sessionStorage mock).
  - Transformações Canvas (offscreen canvas em testes Node via `canvas` package ou mock de API).
- **E2E (Playwright)**:
  - Fluxo completo: upload → crop → download.
  - Validação de limite de 5 MB e formatos aceites.
  - Dark mode toggle e persistência de tema.

## 10. Dependências Principais
- `astro`, `@astrojs/react`, `@astrojs/tailwind`, `react`, `react-dom`
- `tailwindcss`, `postcss`
- `vitest`, `@playwright/test` (dev)
- Opcional: `idb` (wrapper IndexedDB leve) para fallback de storage pesado.

## 11. Decisões Técnicas Consolidadas
| Decisão | Escolha |
|---|---|
| Routing | Páginas separadas por ferramenta |
| Persistência de imagem | localStorage → sessionStorage → IndexedDB |
| Pipeline | Encadeado (edições acumulam no storage) |
| Formato export | PNG, JPG, WebP apenas (Canvas nativo) |
| GIF/BMP | Aceites no upload, convertidos para PNG/JPG/WebP na exportação |
| Upload limit | 5 MB |
| Islands framework | React |
| Design system | Copiar e adaptar do Demo Xani Design |
| Testes | Vitest (unit) + Playwright (E2E) |
| Layout homepage | Dropzone visível + grid abaixo desde o início |
| Grid interação | Desabilitada até upload; ativa após upload válido |
| Mockups | Referência estrutural (layout); design visual do Demo Xani Design |
| Nome da app | Xani Image Studio |
