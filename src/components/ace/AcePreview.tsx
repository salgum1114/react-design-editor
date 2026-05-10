import React from 'react';

interface AcePreviewProps {
	html?: string;
	css?: string;
	js?: string;
}

export default function AcePreview({ css = '', html = '', js = '' }: AcePreviewProps) {
	const containerRef = React.useRef<HTMLDivElement | null>(null);

	React.useEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		while (container.hasChildNodes()) {
			container.removeChild(container.firstChild as ChildNode);
		}

		const iframe = document.createElement('iframe');
		iframe.width = '100%';
		iframe.height = '200px';
		container.appendChild(iframe);

		const contentDocument = iframe.contentDocument;
		if (!contentDocument) {
			return;
		}

		const style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = css;
		contentDocument.head.appendChild(style);

		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.innerHTML = js;
		contentDocument.head.appendChild(script);

		contentDocument.body.innerHTML = html;
	}, [css, html, js]);

	return <div ref={containerRef} id="code-preview" style={{ width: '100%', height: 200 }} />;
}
