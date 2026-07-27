import i18next from 'i18next';
import React, { Component } from 'react';
import type { CanvasInstance } from '../../../canvas';
import { CommonButton } from '../../../components/common';

interface IProps {
	canvasRef?: CanvasInstance;
	selectedItem?: any;
	workflow?: any;
}

class NodeAction extends Component<IProps> {
	render() {
		const { canvasRef } = this.props;
		return (
			<div className="rde-inspector-actions">
				<CommonButton
					className="rde-inspector-action is-secondary"
					icon="clone"
					onClick={() => {
						canvasRef?.handler.duplicate();
					}}
				>
					{i18next.t('action.clone')}
				</CommonButton>
				<CommonButton
					className="rde-inspector-action is-danger"
					icon="trash"
					danger
					onClick={() => {
						canvasRef?.handler.remove();
					}}
				>
					{i18next.t('action.delete')}
				</CommonButton>
			</div>
		);
	}
}

export default NodeAction;
