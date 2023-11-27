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

class SomeProps {
	children?
	title?
	content?
	icon?
	extra?
	titleStyle? 
	contentStyle?
}

class WorkflowSiderContainer extends Component<IProps> {
	static propType;

	render() {
		const attributes: SomeProps = this.props;
		return (
			<Flex flexDirection="column" style={{ height: '100%' }}>
				<Flex style={Object.assign({}, { background: '#f5f4f3', height: '40px' }, attributes.titleStyle)}>
					<Flex
						flex="1"
						justifyContent="flex-start"
						alignItems="center"
						style={{ marginLeft: '8px', color: '#4d5360' }}
					>
						<Icon name={attributes.icon} style={{ marginRight: 8 }} />
						<h4 style={{ marginBottom: 0 }}>{attributes.title}</h4>
					</Flex>
					{attributes.extra ? (
						<Flex justifyContent="flex-end" alignItems="center">
							{attributes.extra}
						</Flex>
					) : null}
				</Flex>
				<Flex
					flexDirection="column"
					style={Object.assign({}, { height: '100%', margin: '8px 16px' }, attributes.contentStyle)}
				>
					{attributes.children || attributes.content}
				</Flex>
			</Flex>
		);
	}
}

export default WorkflowSiderContainer;
