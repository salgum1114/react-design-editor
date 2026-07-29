/// <reference types="node" />

import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const readOptionalFile = (url: URL) => (existsSync(url) ? readFileSync(url, 'utf8') : '');

const canvasSource = readFileSync(new URL('../canvas/Canvas.tsx', import.meta.url), 'utf8');
const editorStylesheet = readOptionalFile(new URL('../canvas/styles/react-design-editor.css', import.meta.url));
const appEntry = readFileSync(new URL('../index.tsx', import.meta.url), 'utf8');
const appStylesheet = readOptionalFile(new URL('./app.css', import.meta.url));
const viteConfig = readFileSync(new URL('../../vite.config.ts', import.meta.url), 'utf8');
const buildTypeScriptConfig = readFileSync(new URL('../../tsconfig.build.json', import.meta.url), 'utf8');

describe('library stylesheet boundary', () => {
	it('uses a canvas-only source entry and publishes it as react-design-editor.css', () => {
		expect(canvasSource).toContain("import './styles/react-design-editor.css';");
		expect(canvasSource).not.toContain("import './styles/canvas.css';");
		expect(editorStylesheet).toContain("@import './canvas.css';");
		expect(editorStylesheet).toContain("@import './contextmenu.css';");
		expect(editorStylesheet).toContain("@import './fabricjs.css';");
		expect(editorStylesheet).toContain("@import './tooltip.css';");
		expect(viteConfig).toContain("cssFileName: 'react-design-editor'");
	});

	it('keeps demo application styles outside the library stylesheet', () => {
		expect(appEntry).toContain("import './styles/app.css';");
		expect(appStylesheet).toContain("@import 'antd/dist/reset.css';");
		expect(appStylesheet).toContain('/* Operator editor shell */');
		expect(appStylesheet).not.toContain("@import './react-design-editor.css';");
		expect(existsSync(new URL('./react-design-editor.css', import.meta.url))).toBe(false);
		expect(existsSync(new URL('./index.css', import.meta.url))).toBe(false);
		expect(editorStylesheet).not.toContain('data-rde-theme');
		expect(editorStylesheet).not.toContain('rde-theme-switch');
		expect(editorStylesheet).not.toContain('--rde-shell-950');
	});

	it('excludes test files from published type declarations', () => {
		expect(buildTypeScriptConfig).toContain('"src/**/*.test.ts"');
		expect(buildTypeScriptConfig).toContain('"src/**/*.test.tsx"');
	});
});
