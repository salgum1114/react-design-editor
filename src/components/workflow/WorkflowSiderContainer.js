import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Icon from '../icon/Icon';
import { FlexBox } from '../flex';

class RuleChainSiderContainer extends Component {
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
			<FlexBox flexDirection="column" style={{ height: '100%' }}>
				<FlexBox style={Object.assign({}, { background: '#f5f4f3', height: '40px' }, titleStyle)}>
					<FlexBox
						flex="1"
						justifyContent="flex-start"
						alignItems="center"
						style={{ marginLeft: '8px', color: '#4d5360' }}
					>
						<Icon name={icon} style={{ marginRight: 8 }} />
						<h4 style={{ marginBottom: 0 }}>{title}</h4>
					</FlexBox>
					{extra ? (
						<FlexBox justifyContent="flex-end" alignItems="center">
							{extra}
						</FlexBox>
					) : null}
				</FlexBox>
				<FlexBox
					flexDirection="column"
					style={Object.assign({}, { height: '100%', margin: '8px 16px' }, contentStyle)}
				>
					{children || content}
				</FlexBox>
			</FlexBox>
		);
	}
}

export default RuleChainSiderContainer;
