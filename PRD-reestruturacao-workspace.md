## Problem Statement

The current Xani Image Studio is structured as a multi-page application with separate routes for each editing tool (`/crop`, `/resize`, `/convert`, `/compress`, `/rotate`). This fragmented flow forces users to navigate back and forth between pages, breaking the natural editing pipeline. The UI also lacks the modern, consolidated workspace feel suggested by the reference mockups, which show a single-screen editor with a tools sidebar, central canvas, history panel, and a bottom control bar.

The user wants to restructure the app into a **Landing Page + Single Workspace** model, similar to Pixlr Express, while preserving the existing privacy-first architecture (all processing local in the browser) and the current dark-mode visual identity.

## Solution

Replace the current multi-page tool routing with a unified `/editor` workspace page. The landing page (`/`) becomes a focused upload gateway. After upload, the user is taken directly to the workspace where all five editing tools (Crop, Resize, Convert, Compress, Rotate/Flip) are accessible from a left sidebar. The center shows the image on a canvas with visual zoom. The right panel shows a non-linear history of applied actions (snapshots). The footer contains zoom controls, undo/redo buttons, a "Close" button to return home, and a "Download" button to export the final image.

## User Stories

1. As a user, I want to upload an image from a clean, focused landing page, so that I can start editing immediately without distractions.
2. As a user, I want the app to automatically take me to the editor after uploading, so that I don't have to manually navigate.
3. As a user, I want to see all editing tools in a left sidebar, so that I can switch between Crop, Resize, Convert, Compress, and Rotate/Flip without leaving the page.
4. As a user, I want each tool to show its specific controls in the right panel when I select it, so that I can adjust parameters before applying.
5. As a user, I want to zoom in and out of the canvas visually, so that I can inspect details without changing the actual image dimensions.
6. As a user, I want a history panel showing every action I applied, so that I can see what I've done and jump back to any previous state.
7. As a user, I want undo and redo buttons (and `Ctrl+Z` / `Ctrl+Shift+Z` shortcuts), so that I can reverse or reapply recent changes quickly.
8. As a user, I want to click on any past history entry to restore that exact state, so that I can perform non-linear undo.
9. As a user, I want to download the final image in my chosen format (PNG/JPG/WebP), so that I can save the edited file locally.
10. As a user, I want a "Close" button to return to the landing page and clear the current session, so that I can start a new edit cleanly.
11. As a user, I want the landing page to show an "AI Image Generator" button as a placeholder, so that the UI matches the mockup while signaling that the feature is not yet available.
12. As a user, I want the dark/light mode toggle to remain available, so that I can work comfortably in my preferred lighting.
13. As a user, I want the app to continue processing everything locally in my browser, so that my images never leave my device.
14. As a user, I want the editing pipeline to persist my image across tool switches within the same session, so that a crop followed by a resize operates on the cropped image.
15. As a developer, I want deep, testable modules for history management and canvas transforms, so that the core logic is reliable and maintainable.

## Implementation Decisions

### Architecture
- **Landing Page** (`/`): Astro page with React island. Minimal layout — logo, theme toggle, centralized upload dropzone, disabled "AI Generator" placeholder button. No recent files grid (removed per user decision).
- **Workspace** (`/editor`): Astro page with a single large React island. Layout: left toolbar (icons), center canvas area, right history panel, bottom footer bar. The workspace replaces all existing separate tool pages (`/crop`, `/resize`, `/convert`, `/compress`, `/rotate`).

### Deep Modules
- **`history.ts`**: Encapsulates the entire undo/redo/snapshot system. Interface: `push(snapshot)`, `undo()`, `redo()`, `jumpTo(index)`, `canUndo()`, `canRedo()`, `getHistory()`. Internally maintains an array of `{ id, timestamp, toolName, thumbnail, canvasDataUrl }`. Non-linear navigation supported via `jumpTo`.
- **`canvasEngine.ts`**: Encapsulates all Canvas API transforms. Interface: `applyTool(toolType, params, sourceCanvas) → HTMLCanvasElement`. Handles crop, resize, rotate, flip, compress (quality), and format conversion internally. Isolates all `drawImage`, `getContext`, `toBlob`, `toDataURL` calls.
- **`zoom.ts`**: Pure CSS zoom logic. Interface: `getScale()`, `zoomIn()`, `zoomOut()`, `resetZoom()`, `setScale(scale)`. Returns scale values; the React component applies `transform: scale()` on a wrapper div. No canvas mutation.
- **`storage.ts`**: Already exists. Extended to optionally store lightweight metadata (original filename) alongside the base64 image. Keeps the existing `localStorage → sessionStorage → IndexedDB` fallback.

### UI Components
- **`Toolbar.tsx`**: Left vertical sidebar. Five icon buttons (Feather-style outline SVGs). Active tool is highlighted. Clicking a tool renders its control panel in the right area.
- **`CanvasArea.tsx`**: Central area. Contains a `<canvas>` element wrapped in a zoomable div. Receives the current canvas from `canvasEngine` and renders it. Handles the visual zoom via CSS `transform`.
- **`HistoryPanel.tsx`**: Right panel. Lists snapshots from `history.ts` as thumbnails with tool name and timestamp. Clicking a snapshot calls `history.jumpTo(index)` which restores that canvas state.
- **`FooterBar.tsx`**: Bottom bar. Zoom +/- buttons, zoom percentage display, Undo/Redo buttons (disabled state bound to `history.canUndo/canRedo`), "Close" button (clears image, navigates to `/`), "Download" button (triggers `canvas.toBlob` with selected format).
- **`Workspace.tsx`**: Top-level orchestrator. Holds the current `HTMLCanvasElement` in state. Wires together Toolbar, CanvasArea, HistoryPanel, FooterBar. When a tool is applied, calls `canvasEngine`, then `history.push`, then updates state.
- **`LandingPage.tsx`**: Replaces `HomePage.tsx`. Upload dropzone centered. After successful upload, calls `setImage` then `window.location.href = '/editor'`.

### Tool Controls
- Crop: inputs for x, y, w, h; live preview on canvas.
- Resize: mode selector (pixels / percent); width/height inputs or slider.
- Convert: format selector (PNG, JPG, WebP).
- Compress: quality slider (0–100).
- Rotate/Flip: buttons for 90°, 180°, 270°, flip H, flip V.

### Removed / Deprecated
- `HomePage.tsx`, `ToolGrid.tsx`, `EditorPage.tsx` (old wrapper), `UploadDropzone.tsx` (logic merged into `LandingPage.tsx`), and all separate `.astro` tool pages (`crop.astro`, `resize.astro`, etc.) are removed.

## Testing Decisions

### Unit Tests (Vitest + jsdom)
- **`history.test.ts`**: Test the full snapshot lifecycle — push multiple states, undo/redo linear navigation, jumpTo non-linear navigation, boundary conditions (undo at start, redo at end), history list accuracy.
- **`canvasEngine.test.ts`**: Test each tool transformation in isolation — crop produces expected dimensions, resize by percent scales correctly, rotate 90° swaps width/height, flip H/V preserves dimensions, convert changes MIME type in output data URL, compress respects quality parameter. Use small in-memory canvases (2×2 or 4×4 pixels) with known pixel values to assert output dimensions and pixel data where feasible.

### E2E Tests (Playwright)
- **Landing → Editor flow**: Upload an image, verify redirect to `/editor`, verify canvas is visible.
- **Tool switch**: Select a tool from the sidebar, verify its control panel appears in the right area.
- **Apply tool + history**: Apply a resize, verify a new snapshot appears in the history panel with correct label.
- **Undo/Redo**: Apply two tools, click undo once, verify canvas reverts to first tool's output, click redo, verify second tool is restored.
- **Non-linear history**: Apply three tools, click the first snapshot in history, verify canvas reverts to that state, apply a new tool from there, verify the old branch is replaced (or a new branch is created — decision to be confirmed in implementation).
- **Zoom**: Click zoom in/out buttons, verify CSS transform scale changes on the canvas wrapper.
- **Download**: Click Download, verify a file download event occurs with the correct filename pattern.
- **Close**: Click Close, verify redirect to `/` and the tool grid / upload area is visible again.

### What makes a good test
Only test **external behavior**, not implementation details. For `history.ts`, test the public methods and state transitions, not the internal array index. For `canvasEngine.ts`, test input dimensions → output dimensions and observable canvas properties, not internal `drawImage` call order.

## Out of Scope
- AI Image Generator functionality (remains a disabled placeholder).
- Real layer system with blending modes, opacity, and merge operations (replaced by the simpler snapshot history).
- Recent files / thumbnails grid on the landing page (removed per user decision).
- Multi-image editing or batch processing.
- Backend server, image upload to cloud, or any server-side processing.
- Mobile-responsive workspace layout (focus is desktop workspace; basic responsiveness is acceptable but not a primary goal).

## Further Notes
- The existing design tokens (`xani-tokens.css`) and dark/light mode system must be preserved and reused in the new layout.
- The `canvasEngine` should reuse the existing individual editor logic (CropEditor, ResizeEditor, etc.) where possible, refactoring them from page-level components into pure transformation functions.
- Performance: for large images, consider limiting the maximum zoom scale and debouncing rapid undo/redo clicks to avoid expensive canvas redraws.
- Accessibility: ensure the toolbar icons have `aria-label`, the history panel entries are keyboard-navigable, and the zoom/undo/redo buttons have visible focus states.
