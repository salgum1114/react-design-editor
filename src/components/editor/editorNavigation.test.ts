/// <reference types="node" />

import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const imageMapEditor = readFileSync(
	new URL('../../editors/imagemap/ImageMapEditor.tsx', import.meta.url),
	'utf8',
);
const workflowEditor = readFileSync(
	new URL('../../editors/workflow/WorkflowEditor.tsx', import.meta.url),
	'utf8',
);

describe('editor activity navigation', () => {
	it('does not expose redundant document settings footer actions', () => {
		expect(imageMapEditor).not.toContain("key: 'settings'");
		expect(imageMapEditor).not.toContain('footerItems=');
		expect(workflowEditor).not.toContain("key: 'settings'");
		expect(workflowEditor).not.toContain('footerItems=');
	});
});
