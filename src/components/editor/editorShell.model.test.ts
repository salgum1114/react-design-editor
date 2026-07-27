import { describe, expect, it } from 'vitest';
import { resolveInspectorMode, summarizeImageMap, summarizeWorkflow } from './editorShell.model';

describe('summarizeWorkflow', () => {
	it('counts workflow nodes, links, and nodes with configuration errors', () => {
		const summary = summarizeWorkflow([
			{ id: 'timer', superType: 'node', errors: false },
			{ id: 'switch', superType: 'node', errors: ['Routes are required'] },
			{ id: 'timer-switch', superType: 'link' },
			{ id: 'switch-email', superType: 'link' },
			{ id: 'switch-port', superType: 'port' },
		]);

		expect(summary).toEqual({
			nodeCount: 2,
			linkCount: 2,
			errorCount: 1,
			validationState: 'issues',
		});
	});

	it('reports a valid workflow when no node has errors', () => {
		const summary = summarizeWorkflow([{ id: 'timer', superType: 'node', errors: [] }]);

		expect(summary.validationState).toBe('valid');
		expect(summary.errorCount).toBe(0);
	});
});

describe('summarizeImageMap', () => {
	it('excludes the workarea and ports from the object count', () => {
		const summary = summarizeImageMap(
			[
				{ id: 'workarea', type: 'rect' },
				{ id: 'image-1', type: 'image' },
				{ id: 'label-1', type: 'textbox' },
				{ id: 'port-1', superType: 'port' },
			],
			{ id: 'image-1', type: 'image' },
		);

		expect(summary).toEqual({
			objectCount: 2,
			selectedType: 'image',
			hasSelection: true,
		});
	});

	it('returns the map context when nothing is selected', () => {
		expect(summarizeImageMap([], null)).toEqual({
			objectCount: 0,
			selectedType: 'map',
			hasSelection: false,
		});
	});
});

describe('resolveInspectorMode', () => {
	it('uses node configuration only for a selected workflow node', () => {
		expect(resolveInspectorMode({ id: 'switch', superType: 'node' })).toBe('node');
		expect(resolveInspectorMode({ id: 'link', superType: 'link' })).toBe('workflow');
		expect(resolveInspectorMode(null)).toBe('workflow');
	});
});
