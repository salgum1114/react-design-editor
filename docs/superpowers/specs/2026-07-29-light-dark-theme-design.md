# Light and Dark Theme Design

## Goal

Add a unified light and dark theme to the demo editor shell. Light is the default on first visit, and the last explicit selection is restored on later visits.

## Visual Direction

The light theme follows the approved Cool IDE concept:

- App background: `#F4F7FA`
- Panels: `#FFFFFF`
- Secondary surfaces: `#F7FAFC`
- Canvas: `#EEF3F7`
- Canvas dots: `#C9D4DE`
- Borders: `#D7E0E7`
- Primary text: `#172A2D`
- Muted text: `#64748B`
- Subtle text: `#8A99A6`
- Primary teal: `#0F8F77`
- Accent mint: `#2BC9A5`
- Soft mint: `#DDF7EF`
- Warning: `#C98724`
- Error: `#D95252`
- Information blue: `#3D73D9`

The existing dark theme remains available. Workflow node shapes and node-specific colors do not change in either theme.

## Architecture

### Theme State

Create a small app-level theme module with the public type `EditorTheme = 'light' | 'dark'`. It reads `react-design-editor-theme` from `localStorage`, falls back to `light`, and writes only valid explicit selections.

The root application owns the current theme and applies `data-rde-theme="light|dark"` to the document root and editor root. This keeps regular CSS, portalled Ant Design UI, and browser-level colors aligned.

### Ant Design

Move theme-aware `ConfigProvider` ownership into the app-level theme boundary. Use `theme.defaultAlgorithm` for Light and `theme.darkAlgorithm` for Dark, with shared editor tokens for primary, text, border, surface, control, modal, select, and tooltip colors.

The top navigation menu must no longer force `theme="dark"`.

### Theme Control

Add a compact, fixed-width Ant Design `Segmented` control to the right side of the application bar before the utility icons. It exposes the literal options `Light` and `Dark`, reports the selected value through props, and does not resize or shift neighboring toolbar controls on hover or selection.

### CSS Tokens

Keep all demo/editor-shell theme CSS in `src/styles/app.css`. Light variables are the default token values. Dark variables are scoped under `[data-rde-theme='dark']`.

Replace dark-only literal colors in the operator shell with semantic variables where they affect:

- app bar and command bar
- activity rail and palettes
- header/footer toolbars
- workspace and canvas frame
- inspector panels and forms
- buttons, selects, modals, popovers, and empty states
- diagnostics and status areas

Do not move demo shell styles into `src/canvas/styles/react-design-editor.css`. The published library stylesheet remains limited to reusable canvas-layer styling.

### Monaco

Expose the current editor theme through a focused React context. `MonacoCodeEditor` uses `vs` in Light and `vs-dark` in Dark unless a caller explicitly supplies a theme prop.

### Fabric Canvas

ImageMap and Workflow editors consume the same theme context and update their public `canvasOption` and `gridOption` props:

- Light canvas: `#EEF3F7`
- Light workflow dots: `#C9D4DE`
- Dark canvas: existing `#1C2128`
- Dark workflow dots: existing `#5F646B`

Selection, object, node, link, and workarea serialization data are not changed. Theme switching changes presentation only and must not recreate canvas objects or create transactions.

## Data Flow

1. On startup, read the persisted theme; use Light when absent or invalid.
2. Apply the theme to the document and editor root.
3. Pass the theme to Ant Design, the title switch, Monaco context, ImageMap, and Workflow.
4. On switch selection, update state synchronously and persist the valid value.
5. Existing mounted editors receive presentation option updates without reloading serialized objects.

If browser storage is unavailable, the app continues with Light and keeps the selection in memory for the current session.

## Accessibility

- The control exposes readable `Light` and `Dark` labels.
- Selected and hover states retain sufficient contrast in both themes.
- Focus indicators remain visible.
- Theme choice is not communicated by color alone because the selected label is retained.

## Verification

Automated coverage must verify:

- missing, valid, and invalid persisted values
- storage write failures do not break theme switching
- the app bar renders the two theme choices and emits changes
- Monaco maps Light to `vs` and Dark to `vs-dark`
- demo styles remain outside the published library stylesheet

Run unit tests, TypeScript type checking, and the production build. In the browser, verify both themes in ImageMap and Workflow, including Select popups, modals, inspector scrolling, toolbars, Monaco, Fabric canvas colors, node colors, and persistence after reload.
