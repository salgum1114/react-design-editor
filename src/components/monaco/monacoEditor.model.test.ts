import { describe, expect, it } from 'vitest';
import { markersToErrors, normalizeMonacoLanguage } from './monacoEditor.model';

describe('normalizeMonacoLanguage', () => {
	it('uses Monaco HTML support for handlebars templates', () => {
		expect(normalizeMonacoLanguage('handlebars')).toBe('html');
	});

	it('keeps Monaco native language identifiers unchanged', () => {
		expect(normalizeMonacoLanguage('javascript')).toBe('javascript');
		expect(normalizeMonacoLanguage('json')).toBe('json');
	});
});

describe('markersToErrors', () => {
	it('returns only Monaco error markers with readable positions', () => {
		const errors = markersToErrors([
			{ severity: 8, startLineNumber: 4, startColumn: 7, message: 'Unexpected token' },
			{ severity: 4, startLineNumber: 2, startColumn: 1, message: 'Unused value' },
		]);

		expect(errors).toHaveLength(1);
		expect(errors[0].message).toBe('4:7 Unexpected token');
	});

	it('returns an empty list when Monaco reports no errors', () => {
		expect(markersToErrors([])).toEqual([]);
	});
});
