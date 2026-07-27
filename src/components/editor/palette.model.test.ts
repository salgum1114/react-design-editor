import { describe, expect, it } from 'vitest';
import { PALETTE_COLLAPSE_PROPS, resolvePaletteActiveKeys } from './palette.model';

describe('resolvePaletteActiveKeys', () => {
	it('uses all sections before the user changes the collapse state', () => {
		expect(resolvePaletteActiveKeys(null, ['TRIGGER', 'LOGIC'])).toEqual(['TRIGGER', 'LOGIC']);
	});

	it('keeps every section closed after the user closes them', () => {
		expect(resolvePaletteActiveKeys([], ['TRIGGER', 'LOGIC'])).toEqual([]);
	});
});

describe('PALETTE_COLLAPSE_PROPS', () => {
	it('keeps ImageMap and Workflow collapse spacing on the same bordered structure', () => {
		expect(PALETTE_COLLAPSE_PROPS).toEqual({
			bordered: true,
		});
	});
});
