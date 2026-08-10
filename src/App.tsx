import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AdsenseLoader } from './components/layout/AdsenseBanner';
import Title from './components/layout/Title';
import FlowContainer from './containers/FlowContainer';
import { ImageMapEditor, WorkflowEditor } from './editors';
import { EditorThemeContext } from './theme';

type EditorType = 'imagemap' | 'workflow' | 'hexgrid' | 'fiber';

interface IState {
	activeEditor?: EditorType;
}

class App extends React.Component<any, IState> {
	state: IState = {
		activeEditor: 'workflow',
	};

	handleChangeEditor = ({ key }: { key: string }) => {
		this.setState({
			activeEditor: key as EditorType,
		});
	};

	renderEditor = (activeEditor: EditorType) => {
		switch (activeEditor) {
			case 'imagemap':
				return <ImageMapEditor />;
			case 'workflow':
				return <WorkflowEditor />;
			default:
				return null;
		}
	};

	render() {
		const { activeEditor } = this.state;
		return (
			<EditorThemeContext.Consumer>
				{({ theme }) => (
					<div className="rde-main" data-rde-theme={theme}>
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
							<script async={true} src="https://www.googletagmanager.com/gtag/js?id=G-EH7WWSK514" />
							<script>
								{`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-EH7WWSK514');
                        `}
							</script>
						</Helmet>
						<AdsenseLoader />
						<div className="rde-title">
							<Title onChangeEditor={this.handleChangeEditor} currentEditor={activeEditor} />
						</div>
						<FlowContainer>
							<div className="rde-content">{this.renderEditor(activeEditor)}</div>
						</FlowContainer>
					</div>
				)}
			</EditorThemeContext.Consumer>
		);
	}
}

export default App;
