import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Scrollbar from './Scrollbar';

describe('Scrollbar', () => {
	it('forwards layout props to its scroll container', () => {
		const markup = renderToStaticMarkup(
			<Scrollbar className="palette-scroll" style={{ minHeight: 0 }}>
				<span>Content</span>
			</Scrollbar>,
		);

		expect(markup).toContain('class="palette-scroll"');
		expect(markup).toContain('min-height:0');
		expect(markup).toContain('overflow:auto');
	});
});
