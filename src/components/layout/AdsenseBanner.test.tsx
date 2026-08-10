import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { describe, expect, it } from 'vitest';

import AdsenseBanner, { AdsenseLoader } from './AdsenseBanner';

describe('AdsenseBanner', () => {
	it('renders the configured 600x60 fixed display unit', () => {
		const html = renderToStaticMarkup(<AdsenseBanner />);

		expect(html).toContain('class="adsbygoogle"');
		expect(html).toContain('data-ad-client="ca-pub-8569372752842198"');
		expect(html).toContain('data-ad-slot="5790685139"');
		expect(html).toContain('width:600px');
		expect(html).toContain('height:60px');
	});

	it('loads the AdSense client script through Helmet', () => {
		const html = renderToStaticMarkup(
			<HelmetProvider>
				<AdsenseLoader />
			</HelmetProvider>,
		);

		expect(html).toContain(
			'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8569372752842198',
		);
		expect(html).toContain('crossorigin="anonymous"');
	});
});
