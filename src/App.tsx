import { ImageMap } from '@react-design-editor/editors';
import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const App = () => {
	return (
		<HelmetProvider>
			<Helmet>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta
					name="description"
					content="React Design Editor has started to developed direct manipulation of editable design tools like Powerpoint, We've developed it with react.js, ant.design, fabric.js "
				/>
				<link rel="manifest" href="./manifest.json" />
				<link rel="shortcut icon" href="./favicon.ico" />
				<link rel="stylesheet" href="https://fonts.googleapis.com/earlyaccess/notosanskr.css" />
				<title>React Design Editor</title>
				<script async={true} src="https://www.googletagmanager.com/gtag/js?id=UA-97485289-3" />
				<script>
					{`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'UA-97485289-3');
                        `}
				</script>
				<script async={true} src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" />
			</Helmet>
			<ImageMap />
		</HelmetProvider>
	);
};

export default App;
