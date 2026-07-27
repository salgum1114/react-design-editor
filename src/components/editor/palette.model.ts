export const resolvePaletteActiveKeys = (activeKeys: string[] | null, sectionKeys: string[]) =>
	activeKeys ?? sectionKeys;

export const PALETTE_COLLAPSE_PROPS = {
	bordered: true,
} as const;
