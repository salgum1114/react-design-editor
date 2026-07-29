/// <reference types="node" />

import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(new URL('./app.css', import.meta.url), 'utf8');
const imageMapFooterToolbar = readFileSync(
	new URL('../editors/imagemap/ImageMapFooterToolbar.tsx', import.meta.url),
	'utf8',
);
const imageMapEditor = readFileSync(
	new URL('../editors/imagemap/ImageMapEditor.tsx', import.meta.url),
	'utf8',
);
const imageMapPreview = readFileSync(
	new URL('../editors/imagemap/ImageMapPreview.tsx', import.meta.url),
	'utf8',
);
const workflowToolbar = readFileSync(
	new URL('../editors/workflow/WorkflowToolbar.tsx', import.meta.url),
	'utf8',
);

describe('editor theme tokens', () => {
	it('uses the approved Cool IDE light palette by default and keeps a dark override', () => {
		expect(stylesheet).toMatch(
			/:root\s*\{[^}]*--rde-shell-950:\s*#F4F7FA;[^}]*--rde-shell-text:\s*#172A2D;[^}]*--rde-canvas-background:\s*#EEF3F7;[^}]*--rde-active-surface:\s*#DDF7EF;[^}]*--rde-control-background:\s*#FFFFFF;[^}]*--rde-section-background:\s*#F7FAFC;/s,
		);
		expect(stylesheet).toMatch(
			/\[data-rde-theme='dark'\]\s*\{[^}]*--rde-shell-950:\s*#0D1413;[^}]*--rde-shell-text:\s*#EDF4F1;[^}]*--rde-canvas-background:\s*#1C2128;[^}]*--rde-active-surface:\s*rgba\(94,\s*224,\s*189,\s*0\.14\);[^}]*--rde-control-background:\s*#111918;[^}]*--rde-section-background:\s*#151E1C;/s,
		);
	});

	it('uses distinct active, control, and section surfaces across menus and inspectors', () => {
		expect(stylesheet).toMatch(
			/\.rde-activity-rail-button\.active\s*\{[^}]*background:\s*var\(--rde-active-surface\);/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-operator-editor\s+\.rde-editor-items\s+\.ant-collapse-item-active\s*>\s*\.ant-collapse-header\s*\{[^}]*background:\s*var\(--rde-active-surface\);/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-inspector\s+\.ant-input,[^}]*\.rde-editor-inspector\s+\.ant-picker\s*\{[^}]*background:\s*var\(--rde-control-background\);/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-workflow-node-configurations\s+form\s*>\s*div:first-child\s*\{[^}]*background:\s*var\(--rde-section-background\);/s,
		);
	});

	it('keeps the Light and Dark app-bar control dimensions stable', () => {
		expect(stylesheet).toMatch(
			/\.rde-theme-switch\.ant-segmented\s*\{[^}]*width:\s*148px;[^}]*min-width:\s*148px;[^}]*flex:\s*0 0 148px;[^}]*transition:\s*none;/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-theme-switch\s+\.ant-segmented-group\s*\{[^}]*width:\s*100%;[^}]*min-width:\s*0;/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-theme-switch\s+\.ant-segmented-item\s*\{[^}]*min-width:\s*0;[^}]*flex:\s*1 1 0;[^}]*transition:\s*none;/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-theme-switch-label\s*\{[^}]*display:\s*inline-flex;[^}]*align-items:\s*center;[^}]*justify-content:\s*center;[^}]*gap:\s*5px;/s,
		);
	});
});

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

describe('editor palette spacing', () => {
	it('does not reserve outer spacing in the shared ImageMap and Workflow palette scroll region', () => {
		expect(stylesheet).toMatch(
			/\.rde-editor-items-scroll,\s*\.rde-editor-items-scroll-content\s*\{[^}]*margin:\s*0;[^}]*padding:\s*0;/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-items-scroll\s*\{[^}]*scrollbar-gutter:\s*auto;/s,
		);
	});

	it('removes Ant Design corner rounding from shared palette collapse sections', () => {
		expect(stylesheet).toMatch(
			/\.rde-operator-editor\s+\.rde-editor-items\s+\.ant-collapse\s*>\s*\.ant-collapse-item,[^{]*\.ant-collapse-item\s*>\s*\.ant-collapse-header,[^{]*\.ant-collapse-item\s*>\s*\.ant-collapse-panel,[^{]*\.ant-collapse-item\s*>\s*\.ant-collapse-content\s*\{[^}]*border-radius:\s*0\s*!important;/s,
		);
	});
});

describe('editor inspector contrast', () => {
	it('themes Ant Design v6 select controls and their portal dropdown', () => {
		expect(stylesheet).toMatch(
			/\.rde-editor-inspector\s+\.ant-select\s*\{[^}]*color:\s*var\(--rde-shell-text\);[^}]*background:\s*var\(--rde-control-background\);/s,
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
			/\.rde-editor-inspector\s+\.ant-radio-button-wrapper\s*\{[^}]*color:\s*var\(--rde-shell-muted\);[^}]*background:\s*var\(--rde-control-background\);/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-inspector\s+\.ant-upload-drag\s*\{[^}]*color:\s*var\(--rde-shell-text\);[^}]*background:\s*var\(--rde-control-background\);/s,
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
	it('keeps borderless ImageMap actions on stable Ant Design button geometry', () => {
		expect(imageMapEditor).toMatch(
			/<CommonButton[\s\S]*?className="rde-action-btn"[\s\S]*?variant="text"[\s\S]*?>\s*Export/s,
		);
		expect(imageMapPreview).toMatch(
			/<Button className="rde-action-btn rde-preview-close-btn" variant="text"/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-action-btn\s*\{[^}]*background:\s*transparent;[^}]*border-color:\s*transparent;/s,
		);
		expect(stylesheet).not.toMatch(
			/\.rde-action-btn(?::hover|:focus)?\s*\{[^}]*border:\s*transparent;/s,
		);
	});

	it('does not override Ant Design button motion in the ImageMap header toolbar', () => {
		expect(stylesheet).not.toMatch(
			/\.rde-imagemap-workspace\s+\.rde-editor-header-toolbar\s*\{[^}]*transition:\s*none;/s,
		);
		expect(stylesheet).not.toMatch(
			/\.rde-imagemap-workspace\s+\.rde-editor-header-toolbar\s+\*,\s*\.rde-imagemap-workspace\s+\.rde-editor-header-toolbar\s+\*::before,\s*\.rde-imagemap-workspace\s+\.rde-editor-header-toolbar\s+\*::after/s,
		);
	});

	it('uses a fixed square width for icon-only circle buttons', () => {
		expect(stylesheet).toMatch(
			/\.rde-editor-header-toolbar-container\s+\.rde-canvas-toolbar\s+\.ant-btn-circle\s*\{[^}]*width:\s*28px;[^}]*min-width:\s*28px;[^}]*height:\s*28px;[^}]*flex:\s*0\s+0\s+28px;[^}]*padding:\s*0;/s,
		);
	});
});

describe('editor bottom toolbar grouping', () => {
	it('shows a compact, vertically centered preview control with a visible label', () => {
		expect(imageMapFooterToolbar).toContain('rde-editor-footer-toolbar-preview-label');
		expect(imageMapFooterToolbar).toContain("<Switch size=\"small\"");
		expect(stylesheet).toMatch(
			/\.rde-imagemap-workspace\s+\.rde-editor-footer-toolbar-preview\s*\{[^}]*height:\s*25px;[^}]*align-items:\s*center;[^}]*gap:\s*6px;/s,
		);
		expect(stylesheet).not.toMatch(
			/\.rde-editor-statusbar\s+\.ant-btn,\s*\.rde-editor-statusbar\s+\.ant-switch\s*\{[^}]*height:\s*25px;/s,
		);
	});

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
			/\.rde-operator-editor\s+\.ant-btn-primary\s*\{[^}]*border-color:\s*var\(--rde-primary-border\);[^}]*color:\s*var\(--rde-mint\);[^}]*background:\s*var\(--rde-mint-soft\);/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-operator-editor\s+\.ant-btn-dangerous\s*\{[^}]*border-color:\s*var\(--rde-danger-border\);[^}]*color:\s*var\(--rde-danger-text\);[^}]*background:\s*var\(--rde-danger-background\);/s,
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

	it('uses themed form surfaces and mint primary actions inside modals', () => {
		expect(stylesheet).toMatch(
			/\.rde-editor-modal\s+\.ant-input,[^}]*\.rde-editor-modal\s+\.ant-select\s*\{[^}]*border-color:\s*var\(--rde-shell-border\)\s*!important;[^}]*color:\s*var\(--rde-shell-text\);[^}]*background:\s*var\(--rde-control-background\)\s*!important;/s,
		);
		expect(stylesheet).toMatch(
			/\.rde-editor-modal\s+\.ant-btn-primary\s*\{[^}]*border-color:\s*var\(--rde-primary-border\);[^}]*color:\s*var\(--rde-mint\);[^}]*background:\s*var\(--rde-mint-soft\);/s,
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
