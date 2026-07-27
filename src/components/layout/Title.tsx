import { Button, Menu, Modal, Tooltip } from 'antd';
import i18next from 'i18next';
import React from 'react';
import { Flex } from '../flex';
import { ShortcutHelp } from '../help';
import Icon from '../icon/Icon';

interface IProps {
	onChangeEditor: NonNullable<React.ComponentProps<typeof Menu>['onClick']>;
	currentEditor: string;
}

class Title extends React.Component<IProps> {
	state = {
		visible: false,
	};

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
		const { visible } = this.state;
		return (
			<Flex className="rde-appbar" flex="1" alignItems="center">
				<Flex className="rde-appbar-brand" flex="0 1 auto" alignItems="center">
					<span className="rde-appbar-brand-name">React Design Editor</span>
				</Flex>
				<Flex className="rde-appbar-navigation">
					<Menu
						mode="horizontal"
						theme="dark"
						className="rde-appbar-menu"
						onClick={this.props.onChangeEditor}
						selectedKeys={[this.props.currentEditor]}
						items={[
							{ key: 'imagemap', label: i18next.t('imagemap.imagemap') },
							{ key: 'workflow', label: i18next.t('workflow.workflow') },
						]}
					/>
				</Flex>
				<Flex className="rde-appbar-actions" flex="1" justifyContent="flex-end">
					<Tooltip title={i18next.t('action.go-github')} styles={{ root: { fontSize: 16 } }}>
						<Button
							className="rde-action-btn rde-appbar-action"
							shape="circle"
							onClick={this.handlers.goGithub}
						>
							<Icon name="github" prefix="fab" />
						</Button>
					</Tooltip>
					<Tooltip title={i18next.t('action.go-docs')} styles={{ root: { fontSize: 16 } }}>
						<Button
							className="rde-action-btn rde-appbar-action"
							shape="circle"
							onClick={this.handlers.goDocs}
						>
							<Icon name="book" prefix="fas" />
						</Button>
					</Tooltip>
					<Tooltip title={i18next.t('action.shortcut-help')} styles={{ root: { fontSize: 16 } }}>
						<Button
							className="rde-action-btn rde-appbar-action"
							shape="circle"
							onClick={this.handlers.showHelp}
						>
							<Icon name="question" prefix="fas" />
						</Button>
					</Tooltip>
				</Flex>
				<Modal
					rootClassName="rde-editor-modal"
					open={visible}
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

export default Title;
