import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';
import i18n from 'i18next';

import Icon from '../../icon/Icon';
import CommonButton from '../../common/CommonButton';
import { Flex } from '../../flex';
import { NODE_COLORS } from '../constant/constants';

class NodeDescriptor extends Component {
	static propTypes = {
		selectedItem: PropTypes.object,
		workflow: PropTypes.object,
	};

	state = {
		loading: false,
	};

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.selectedItem.id !== this.props.selectedItem.id) {
			return true;
		} else if (nextState.loading !== this.state.loading) {
			return true;
		}
		return false;
	}

	handlers = {
		onTrigger: async () => {
			const { selectedItem, workflow } = this.props;
			this.setState({
				loading: true,
			});
			try {
				this.setState({
					loading: false,
				});
				message.success(i18n.t('workflow.virtual-button-execute-success', { name: selectedItem.name }));
			} catch (error) {
				this.setState({
					loading: false,
				});
				console.error(`[ERROR] ${this.constructor.name} triggerVirtualButton()`, error);
				message.error(
					`${i18n.t('workflow.virtual-button-execute-failed', { name: selectedItem.name })}, ${
						error.message
					}`,
				);
			}
		},
	};

	render() {
		const { selectedItem, workflow } = this.props;
		const { loading } = this.state;
		const { onTrigger } = this.handlers;
		const virtualButton =
			selectedItem.type === 'VirtualButtonNode' ? (
				<Flex justifyContent="center" alignItems="center" flex="1" style={{ marginTop: 24 }}>
					<CommonButton
						icon="play"
						onClick={onTrigger}
						loading={loading}
						disabled={!workflow.enabled || loading}
					>
						{i18n.t('action.execute')}
					</CommonButton>
				</Flex>
			) : null;
		return (
			<Flex flexDirection="column" style={{ margin: '8px 16px' }}>
				<h2 style={{ color: NODE_COLORS[selectedItem.descriptor.type].fill }}>
					<Icon
						name={selectedItem.descriptor.icon.length ? selectedItem.descriptor.icon : 'image'}
						style={{ marginRight: 8 }}
					/>
					<span>{selectedItem.descriptor.name}</span>
				</h2>
				<div>{selectedItem.descriptor.description}</div>
				{virtualButton}
			</Flex>
		);
	}
}

export default NodeDescriptor;
