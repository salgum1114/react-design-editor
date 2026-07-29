import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
	EditorThemeProvider,
	getEditorAntTheme,
	useEditorTheme,
} from './EditorThemeProvider';

const ThemeConsumer = () => {
	const { theme } = useEditorTheme();
	return <span data-theme={theme}>{theme}</span>;
};

describe('EditorThemeProvider', () => {
	it.each(['light', 'dark'] as const)('provides the explicit %s theme', theme => {
		const html = renderToStaticMarkup(
			<EditorThemeProvider initialTheme={theme}>
				<ThemeConsumer />
			</EditorThemeProvider>,
		);

		expect(html).toContain(`data-theme="${theme}"`);
		expect(html).toContain(`>${theme}</span>`);
	});

	it('uses the approved Cool IDE palette for the light Ant Design theme', () => {
		const config = getEditorAntTheme('light');

		expect(config.token?.colorPrimary).toBe('#0F8F77');
		expect(config.token?.colorBgBase).toBe('#F4F7FA');
		expect(config.token?.colorText).toBe('#172A2D');
		expect(config.token?.colorBorder).toBe('#D7E0E7');
	});

	it('keeps the existing dark palette available', () => {
		const config = getEditorAntTheme('dark');

		expect(config.token?.colorPrimary).toBe('#32C9A3');
		expect(config.token?.colorBgBase).toBe('#0D1413');
		expect(config.token?.colorText).toBe('#EDF4F1');
	});
});
