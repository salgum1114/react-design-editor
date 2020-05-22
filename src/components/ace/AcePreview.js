import React, { Component } from 'react';
import PropTypes from 'prop-types';

class AcePreview extends Component {
	static propTypes = {
		html: PropTypes.string,
		css: PropTypes.string,
		js: PropTypes.string,
	};

	static defaultProps = {
		html: '',
		css: '',
		js: '',
	};

	componentDidMount() {
		const { html, css, js } = this.props;
		this.iframeRender(html, css, js);
	}

	componentDidUpdate(prevProps) {
		if (this.container) {
			const { html, css, js } = this.props;
			if (html !== prevProps.html || css !== prevProps.css || js !== prevProps.js) {
				this.iframeRender(html, css, js);
			}
		}
	}

	iframeRender = (html, css, js) => {
		while (this.container.hasChildNodes()) {
			this.container.removeChild(this.container.firstChild);
		}
		const iframe = document.createElement('iframe');
		iframe.width = '100%';
		iframe.height = '200px';
		this.container.appendChild(iframe);
		const style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = css;
		iframe.contentDocument.head.appendChild(style);
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.innerHTML = js;
		iframe.contentDocument.head.appendChild(script);
		iframe.contentDocument.body.innerHTML = html;
	};

	render() {
		return (
			<div
				ref={(c) => {
					this.container = c;
				}}
				id="code-preview"
				style={{ width: '100%', height: 200 }}
			/>
		);
	}
}

export default AcePreview;
