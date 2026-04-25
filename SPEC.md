Esta é a especificação técnica para o **Xani Image Studio**, uma aplicação web de edição de imagem processada inteiramente no browser.

---

### 1. Visão Geral
*   **Nome:** Xani Image Studio
*   **Tecnologias:** Astro (Framework), Tailwind CSS (Estilização).
*   **Conceito:** Ferramenta "tudo-em-um" para edição rápida de imagens sem upload para servidor (privacy-first).

### 2. Design e Interface (UI/UX)
*   **Design System:** Seguir rigorosamente os padrões do diretório `/Demo Xani Design`.
*   **Temas:** Suporte nativo a Dark Mode e Light Mode, com alternância via toggle no cabeçalho (conforme imagem 3).
*   **Layout:** Baseado numa grelha de ferramentas (conforme imagem 2), utilizando cards para categorizar as funções.

### 3. Funcionalidades Principais (Módulos)
A interface deve apresentar os seguintes módulos de edição:
1.  **Cortar (Crop):** Seleção de área retangular ou rácio fixo.
2.  **Escalar (Resize):** Alteração de dimensões em pixels ou percentagem.
3.  **Converter:** Transformação entre formatos (PNG, JPG, WebP, GIF, BMP).
4.  **Comprimir:** Otimização de peso de ficheiro.
5.  **Rodar/Inverter:** Rotação de 90°/180° e espelhamento horizontal/vertical.

### 4. Componente de Upload (Baseado na Imagem 1)
*   **Área de Drop:** Zona central de "Drag & Drop" com ícone de upload.
*   **Botão:** "Choose files" em destaque (estilo Xani Design).
*   **Restrições:** 
    *   Formatos aceites: PNG, JPG, GIF, BMP, WebP.
    *   Limite de tamanho: Máximo 5 MB por ficheiro.

### 5. Requisitos Técnicos
*   **Performance:** Utilizar ilhas de interatividade (Astro Islands) apenas onde necessário para manter o carregamento instantâneo.
*   **Processamento Local:** Toda a manipulação de imagem deve ser feita via JavaScript/Canvas no lado do cliente (browser).
*   **Tipografia:** Fonte mono-espaçada ou sans-serif limpa conforme o guia de estilo.

### 6. Estrutura de Navegação
*   **Header:** Logótipo à esquerda e seletor de tema à direita.
*   **Main:** Hero section com o componente de Upload, seguida pela Grid de ferramentas.
*   **Footer:** Informação de que os ficheiros nunca saem do dispositivo.