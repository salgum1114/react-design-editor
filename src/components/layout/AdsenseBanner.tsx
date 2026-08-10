import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const ADSENSE_CLIENT = 'ca-pub-8569372752842198';
const ADSENSE_SLOT = '5790685139';

export function AdsenseLoader() {
	return (
		<Helmet>
			<script
				async={true}
				crossOrigin="anonymous"
				src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
			/>
		</Helmet>
	);
}

export default function AdsenseBanner() {
	useEffect(() => {
		(window.adsbygoogle = window.adsbygoogle || []).push({});
	}, []);

	return (
		<div className="rde-appbar-ad">
			<ins
				className="adsbygoogle"
				style={{ display: 'inline-block', height: 60, width: 600 }}
				data-ad-client={ADSENSE_CLIENT}
				data-ad-slot={ADSENSE_SLOT}
			/>
		</div>
	);
}
