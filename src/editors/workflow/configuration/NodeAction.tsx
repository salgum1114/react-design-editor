import React, { Component } from 'react';
import i18n from 'i18next';
import { Canvas } from '../../../canvas';
import { Flex } from '../../../components/flex';
import { CommonButton } from '../../../components/common';

interface IProps {
	canvasRef?: Canvas;
	selectedItem?: any;
	workflow?: any;
}

class NodeAction extends Component<IProps> {
	render() {
		const { canvasRef, selectedItem } = this.props;
		return (
			<Flex justifyContent="center" alignItems="flex-end" flex="1">
				<Flex.Item alignSelf="flex-start">
					<CommonButton
						icon="clone"
						onClick={() => {
							canvasRef.handler.duplicate();
						}}
					>
						{i18n.t('action.clone')}
					</CommonButton>
				</Flex.Item>
				<Flex.Item alignSelf="flex-end">
					<CommonButton
						icon="trash"
						type="danger"
						onClick={() => {
							canvasRef.handler.remove();
						}}
					>
						{i18n.t('action.delete')}
					</CommonButton>
				</Flex.Item>
			</Flex>
		);
	}
}

export default NodeAction;
