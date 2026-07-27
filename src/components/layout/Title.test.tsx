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
});
