const IMAGE_MAP_PALETTE_ACCENTS: Record<string, string> = {
	MARKER: '#5ee0bd',
	TEXT: '#8ca9ff',
	IMAGE: '#69b6ff',
	SHAPE: '#ffbd66',
	DRAWING: '#f18fba',
	ELEMENT: '#c292ff',
	SVG: '#7fd6cd',
};

const DEFAULT_PALETTE_ACCENT = '#93a39f';

export function getImageMapPaletteAccent(category: string) {
	return IMAGE_MAP_PALETTE_ACCENTS[category] || DEFAULT_PALETTE_ACCENT;
}
