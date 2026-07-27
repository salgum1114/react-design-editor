/// <reference types="node" />

import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(new URL('./app.css', import.meta.url), 'utf8');
const imageMapFooterToolbar = readFileSync(
	new URL('../editors/imagemap/ImageMapFooterToolbar.tsx', import.meta.url),
	'utf8',
);
const workflowToolbar = readFileSync(
	new URL('../editors/workflow/WorkflowToolbar.tsx', import.meta.url),
	'utf8',
);

describe('editor inspector scrolling', () => {
	it('constrains the Ant Design v6 tabs body and scrolls the active pane', () => {
		expect(stylesheet).toMatch(
			/\.rde-inspector-tabs\s*>\s*\.ant-tabs-body-holder\s*\{[^}]*min-height:\s*0;[^}]*overflow:\s*hidden;/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-inspector-tabs\s+\.ant-tabs-body\s*\{[^}]*height:\s*100%;[^}]*min-height:\s*0;/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-inspector-tabs\s+\.ant-tabs-content-active\s*\{[^}]*overflow-y:\s*auto;/s,
		);
	});
});

describe('editor inspector contrast', () => {
	it('themes Ant Design v6 select controls and their portal dropdown', () => {
		expect(stylesheet).toMatch(
			/\.rde-editor-inspector\s+\.ant-select\s*\{[^}]*color:\s*var\(--rde-shell-text\);[^}]*background:\s*var\(--rde-shell-900\);/s,
		);
		expect(stylesheet).toMatch(
			/\.ant-select-dropdown\s*\{[^}]*color:\s*var\(--rde-shell-text\);[^}]*background:\s*var\(--rde-shell-850\);/s,
		);
		expect(stylesheet).toMatch(
			/\.ant-select-dropdown\.ant-select-css-var\s*\{[^}]*--ant-select-option-active-bg:\s*var\(--rde-shell-750\);[^}]*--ant-select-option-selected-bg:\s*var\(--rde-mint-soft\);/s,
		);
		expect(stylesheet).toMatch(
			/\.ant-select-dropdown\.ant-select-css-var\s+\.ant-select-item-option-selected:not\(\.ant-select-item-option-disabled\)\s*\{[^}]*background:\s*var\(--rde-mint-soft\);/s,
		);
	});

	it('themes inspector radio, upload, and utility button surfaces', () => {
		expect(stylesheet).toMatch(
			/\.rde-editor-inspector\s+\.ant-radio-button-wrapper\s*\{[^}]*color:\s*var\(--rde-shell-muted\);[^}]*background:\s*var\(--rde-shell-900\);/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-inspector\s+\.ant-upload-drag\s*\{[^}]*color:\s*var\(--rde-shell-text\);[^}]*background:\s*var\(--rde-shell-900\);/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-inspector\s+\.ant-upload-drag\s+p\.ant-upload-text\s*\{[^}]*color:\s*var\(--rde-shell-text\);/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-inspector\s+\.ant-upload-drag\s+p\.ant-upload-hint\s*\{[^}]*color:\s*var\(--rde-shell-muted\);/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-inspector\s+\.rde-action-btn\.ant-btn\s*\{[^}]*color:\s*var\(--rde-shell-muted\);[^}]*background:\s*var\(--rde-shell-750\);/s,
		);
	});
});

describe('editor toolbar hover stability', () => {
	it('disables motion for the ImageMap header toolbar and its controls', () => {
		expect(stylesheet).toMatch(
			/\.rde-imagemap-workspace\s+\.rde-editor-header-toolbar\s*\{[^}]*transition:\s*none;/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-imagemap-workspace\s+\.rde-editor-header-toolbar\s+\*,\s*\.rde-imagemap-workspace\s+\.rde-editor-header-toolbar\s+\*::before,\s*\.rde-imagemap-workspace\s+\.rde-editor-header-toolbar\s+\*::after\s*\{[^}]*animation:\s*none\s*!important;[^}]*transition:\s*none\s*!important;/s,
		);
	});

	it('uses a fixed square width for icon-only circle buttons', () => {
		expect(stylesheet).toMatch(
			/\.rde-editor-header-toolbar-container\s+\.rde-canvas-toolbar\s+\.ant-btn-circle\s*\{[^}]*width:\s*28px;[^}]*min-width:\s*28px;[^}]*height:\s*28px;[^}]*flex:\s*0\s+0\s+28px;[^}]*padding:\s*0;/s,
		);
	});
});

describe('editor bottom toolbar grouping', () => {
	it('lets Space.Compact own the button corner treatment', () => {
		expect(imageMapFooterToolbar).not.toContain('borderBottomLeftRadius');
		expect(imageMapFooterToolbar).not.toContain('borderBottomRightRadius');
		expect(workflowToolbar).not.toContain('borderBottomLeftRadius');
		expect(workflowToolbar).not.toContain('borderBottomRightRadius');
		expect(stylesheet).toMatch(
			/\.rde-editor-statusbar\s+\.ant-space-compact\s+\.ant-btn\s*\{[^}]*border-radius:\s*0\s*!important;/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-statusbar\s+\.ant-space-compact\s+\.ant-btn:first-child\s*\{[^}]*border-top-left-radius:\s*5px\s*!important;[^}]*border-bottom-left-radius:\s*5px\s*!important;/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-statusbar\s+\.ant-space-compact\s+\.ant-btn:last-child\s*\{[^}]*border-top-right-radius:\s*5px\s*!important;[^}]*border-bottom-right-radius:\s*5px\s*!important;/s,
		);
	});
});

describe('editor button consistency', () => {
	it('uses neutral, primary, and danger tokens without Ant Design blue borders', () => {
		expect(stylesheet).toMatch(
			/\.rde-operator-editor\s+\.ant-btn\s*\{[^}]*border-color:\s*var\(--rde-shell-border\);[^}]*color:\s*var\(--rde-shell-muted\);[^}]*background:\s*var\(--rde-shell-750\);[^}]*box-shadow:\s*none;/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-operator-editor\s+\.ant-btn-primary\s*\{[^}]*border-color:\s*rgba\(94,\s*224,\s*189,\s*0\.38\);[^}]*color:\s*var\(--rde-mint\);[^}]*background:\s*var\(--rde-mint-soft\);/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-operator-editor\s+\.ant-btn-dangerous\s*\{[^}]*border-color:\s*rgba\(255,\s*83,\s*92,\s*0\.34\);[^}]*color:\s*#e78085;[^}]*background:\s*rgba\(255,\s*83,\s*92,\s*0\.08\);/s,
		);
	});
});

describe('editor modal theming', () => {
	it('uses operator tokens for the portal modal surface', () => {
		expect(stylesheet).toMatch(
			/\.rde-editor-modal\s+\.ant-modal-container\s*\{[^}]*border:\s*1px solid var\(--rde-shell-border\);[^}]*color:\s*var\(--rde-shell-text\);[^}]*background:\s*var\(--rde-shell-850\);[^}]*box-shadow:/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-modal\s+\.ant-modal-title\s*\{[^}]*color:\s*var\(--rde-shell-text\);/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-modal\s+\.ant-modal-close\s*\{[^}]*color:\s*var\(--rde-shell-muted\);/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-modal\s+\.ant-modal-close:focus-visible\s*\{[^}]*outline:\s*none;[^}]*box-shadow:\s*0 0 0 2px var\(--rde-mint-soft\);/s,
		);
	});

	it('uses dark form surfaces and mint primary actions inside modals', () => {
		expect(stylesheet).toMatch(
			/\.rde-editor-modal\s+\.ant-input,[^}]*\.rde-editor-modal\s+\.ant-select\s*\{[^}]*border-color:\s*var\(--rde-shell-border\)\s*!important;[^}]*color:\s*var\(--rde-shell-text\);[^}]*background:\s*var\(--rde-shell-900\)\s*!important;/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-modal\s+\.ant-btn-primary\s*\{[^}]*border-color:\s*rgba\(94,\s*224,\s*189,\s*0\.38\);[^}]*color:\s*var\(--rde-mint\);[^}]*background:\s*var\(--rde-mint-soft\);/s,
		);
	});
});

describe('canvas-backed modal preview containment', () => {
	it('keeps absolute Fabric canvases inside a fixed modal preview region', () => {
		expect(stylesheet).toMatch(
			/\.rde-editor-modal-preview\s*\{[^}]*position:\s*relative;[^}]*height:\s*160px;[^}]*overflow:\s*hidden;/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-modal-preview\s*>\s*\.rde-canvas\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0;/s,
		);
	});
});
