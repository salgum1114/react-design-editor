import { Modal } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import React, { Component } from 'react';
import { Flex } from '../flex';
import { ShortcutHelp } from '../help';
import { GitHubButton } from './GithuButton';
import { DocsButton } from './DocsButton';
import { QuestionButton } from './QuestionButton';
import { EditorChange } from './EditorChange';
import { Title } from './Title';
import { Ads } from './Ads';

interface IProps {
	onChangeEditor: (param: ClickParam) => void;
	currentEditor: string;
}

class TitleBar extends Component<IProps> {
	state = {
		visible: false,
	};

	componentDidMount() {
		if (globalThis) {
			(globalThis.adsbygoogle = globalThis.adsbygoogle || []).push({});
		}
	}

	handlers = {
		goGithub: () => {
			window.open('https://github.com/salgum1114/react-design-editor');
		},
		goDocs: () => {
			window.open('https://salgum1114.github.io/react-design-editor/docs');
		},
		showHelp: () => {
			this.setState({
				visible: true,
			});
		},
	};

	render() {
		return (
			<Flex
				style={{ background: 'linear-gradient(141deg,#23303e,#404040 51%,#23303e 75%)' }}
				flexWrap="wrap"
				flex="1"
				alignItems="center"
			>
				<Flex style={{ marginLeft: 8 }} flex="0 1 auto">
					<Title/>
					<GitHubButton onClick={this.handlers.goGithub}/>
					<DocsButton onClick={this.handlers.goDocs}/>
					<QuestionButton onClick={this.handlers.showHelp}/>
				</Flex>
				<EditorChange onClick={this.props.onChangeEditor} selectedKeys={this.props.currentEditor}/>
				<Ads/>
				<Modal
					visible={this.state.visible}
					onCancel={() => this.setState({ visible: false })}
					closable={true}
					footer={null}
					width="50%"
				>
					<ShortcutHelp />
				</Modal>
			</Flex>
		);
	}
}

export default TitleBar;
