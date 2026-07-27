import { describe, expect, it } from 'vitest';

import { getImageMapPaletteAccent } from './imagemapPalette.model';

describe('getImageMapPaletteAccent', () => {
	it.each([
		['MARKER', '#5ee0bd'],
		['TEXT', '#8ca9ff'],
		['IMAGE', '#69b6ff'],
		['SHAPE', '#ffbd66'],
		['DRAWING', '#f18fba'],
		['ELEMENT', '#c292ff'],
		['SVG', '#7fd6cd'],
	])('returns the stable accent for %s', (category, expected) => {
		expect(getImageMapPaletteAccent(category)).toBe(expected);
	});

	it('uses a neutral accent for unknown categories', () => {
		expect(getImageMapPaletteAccent('UNKNOWN')).toBe('#93a39f');
	});
});
