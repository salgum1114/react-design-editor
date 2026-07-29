import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Title from './Title';

describe('Title', () => {
	it('renders the product name without a separate logo mark', () => {
		const html = renderToStaticMarkup(<Title currentEditor="imagemap" onChangeEditor={() => undefined} />);

		expect(html).toContain('React Design Editor');
		expect(html).not.toContain('rde-appbar-brand-mark');
	});

	it('renders an icon-labeled Light and Dark theme selector without forcing a dark navigation menu', () => {
		const html = renderToStaticMarkup(<Title currentEditor="workflow" onChangeEditor={() => undefined} />);

		expect(html).toContain('Light');
		expect(html).toContain('Dark');
		expect(html).toContain('fa-sun');
		expect(html).toContain('fa-moon');
		expect(html).toContain('rde-theme-switch');
		expect(html).not.toContain('ant-menu-dark');
	});
});
