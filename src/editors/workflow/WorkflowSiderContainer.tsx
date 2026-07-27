import React, { Component } from 'react';
import { Flex } from '../../components/flex';
import Icon from '../../components/icon/Icon';

interface IProps {
	children?: React.ReactNode;
	title?: React.ReactNode;
	content?: React.ReactNode;
	icon?: string;
	extra?: React.ReactNode;
	titleStyle?: React.CSSProperties;
	contentStyle?: React.CSSProperties;
}

class WorkflowSiderContainer extends Component<IProps> {
	render() {
		const { children, title, content, icon, extra, titleStyle, contentStyle } = this.props;
		return (
			<Flex className="rde-workflow-sider-section" flexDirection="column" style={{ height: '100%' }}>
				<Flex className="rde-workflow-sider-section-header" style={titleStyle}>
					<Flex
						flex="1"
						justifyContent="flex-start"
						alignItems="center"
					>
						<Icon name={icon} style={{ marginRight: 8 }} />
						<h4 style={{ marginBottom: 0 }}>{title}</h4>
					</Flex>
					{extra ? (
						<Flex justifyContent="flex-end" alignItems="center">
							{extra}
						</Flex>
					) : null}
				</Flex>
				<Flex
					className="rde-workflow-sider-section-content"
					flexDirection="column"
					style={contentStyle}
				>
					{children || content}
				</Flex>
			</Flex>
		);
	}
}

export default WorkflowSiderContainer;
