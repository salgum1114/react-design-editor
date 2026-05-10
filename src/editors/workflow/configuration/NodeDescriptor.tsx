import { message } from 'antd';
import i18n from 'i18next';
import React, { Component } from 'react';
import { CommonButton } from '../../../components/common';
import { Flex } from '../../../components/flex';
import Icon from '../../../components/icon/Icon';
import { NODE_COLORS } from '../constant/constants';

interface IProps {
	workflow?: any;
	selectedItem?: any;
}

interface IState {
	loading: boolean;
}

class NodeDescriptor extends Component<IProps, IState> {
	state: IState = {
		loading: false,
	};

	shouldComponentUpdate(nextProps: IProps, nextState: IState) {
		if (nextProps.selectedItem?.id !== this.props.selectedItem?.id) {
			return true;
		} else if (nextState.loading !== this.state.loading) {
			return true;
		}
		return false;
	}

	handlers = {
		onTrigger: async () => {
			const { selectedItem } = this.props;
			this.setState({
				loading: true,
			});
			try {
				this.setState({
					loading: false,
				});
				message.success(i18n.t('workflow.virtual-button-execute-success', { name: selectedItem.name }));
			} catch (error: unknown) {
				this.setState({
					loading: false,
				});
				const errorMessage = error instanceof Error ? error.message : String(error);
				console.error(`[ERROR] ${this.constructor.name} triggerVirtualButton()`, error);
				message.error(
					`${i18n.t('workflow.virtual-button-execute-failed', { name: selectedItem.name })}, ${errorMessage}`,
				);
			}
		},
	};

	render() {
		const { selectedItem, workflow } = this.props;
		if (!selectedItem) {
			return null;
		}
		const { loading } = this.state;
		const { onTrigger } = this.handlers;
		const descriptorType = selectedItem.descriptor.type as keyof typeof NODE_COLORS;
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
				<h2 style={{ color: NODE_COLORS[descriptorType].fill }}>
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
