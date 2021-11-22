import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Icon from '../../components/icon/Icon';
import { Flex } from '../../components/flex';

interface IProps {
	title?: React.ReactNode;
	content?: React.ReactNode;
	icon?: string;
	extra?: React.ReactNode;
	titleStyle?: React.CSSProperties;
	contentStyle?: React.CSSProperties;
}

class WorkflowSiderContainer extends Component<IProps> {
	static propTypes = {
		children: PropTypes.any,
		title: PropTypes.string,
		icon: PropTypes.string,
		content: PropTypes.any,
		extra: PropTypes.any,
		titleStyle: PropTypes.object,
		contentStyle: PropTypes.object,
	};

	render() {
		const { children, title, content, icon, extra, titleStyle, contentStyle } = this.props;
		return (
			<Flex flexDirection="column" style={{ height: '100%' }}>
				<Flex style={Object.assign({}, { background: '#f5f4f3', height: '40px' }, titleStyle)}>
					<Flex
						flex="1"
						justifyContent="flex-start"
						alignItems="center"
						style={{ marginLeft: '8px', color: '#4d5360' }}
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
					flexDirection="column"
					style={Object.assign({}, { height: '100%', margin: '8px 16px' }, contentStyle)}
				>
					{children || content}
				</Flex>
			</Flex>
		);
	}
}

export default WorkflowSiderContainer;
