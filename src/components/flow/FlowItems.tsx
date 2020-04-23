import React, { Component } from 'react';
import { Collapse } from 'antd';
import { v4 } from 'uuid';

import { Canvas } from '../canvas';
import Icon from '../icon/Icon';
import Descriptors from '../workflow/Descriptors.json';
import { getNode } from '../workflow/configuration/NodeConfiguration';
import { NODE_COLORS } from '../canvas/objects/Node';

interface IProps {
	canvas: Canvas;
}

class FlowItems extends Component<IProps> {
	attachEventListener = canvasRef => {
		this.props.canvas.canvas.wrapperEl.addEventListener('dragenter', this.handleDragEnter, false);
		this.props.canvas.canvas.wrapperEl.addEventListener('dragover', this.handleDragOver, false);
		this.props.canvas.canvas.wrapperEl.addEventListener('dragleave', this.handleDragLeave, false);
		this.props.canvas.canvas.wrapperEl.addEventListener('drop', this.handleDrop, false);
	};

	detachEventListener = canvasRef => {
		this.props.canvas.canvas.wrapperEl.removeEventListener('dragenter', this.handleDragEnter);
		this.props.canvas.canvas.wrapperEl.removeEventListener('dragover', this.handleDragOver);
		this.props.canvas.canvas.wrapperEl.removeEventListener('dragleave', this.handleDragLeave);
		this.props.canvas.canvas.wrapperEl.removeEventListener('drop', this.handleDrop);
	};

	handleDragStart = () => {
		this.item = item;
		const { target } = e;
		target.classList.add('dragging');
	};

	handleDragOver = () => {
		if (e.preventDefault) {
			e.preventDefault();
		}
		e.dataTransfer.dropEffect = 'copy';
		return false;
	};

	handleDragEnter = () => {
		const { target } = e;
		target.classList.add('over');
	};

	handleDragLeave = () => {
		const { target } = e;
		target.classList.remove('over');
	};

	handleDrop = () => {
		e = e || window.event;
		if (e.preventDefault) {
			e.preventDefault();
		}
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		const { layerX, layerY } = e;
		const option = Object.assign({}, this.item, { left: layerX, top: layerY });
		this.handleAddNode(option, false);
		return false;
	};

	handleDragEnd = () => {
		this.item = null;
		e.target.classList.remove('dragging');
	};

	handleAddNode = (descriptor: any, centered = true) => {
		console.log(this.props.canvas);
		this.props.canvas.handler.add(
			Object.assign({}, descriptor, {
				id: v4(),
				subType: descriptor.type,
				type: getNode(descriptor.nodeClazz),
				configuration: descriptor.defaultConfiguration,
				descrption: '',
			}),
			centered,
			false,
			true,
		);
	};

	renderItems = (descriptors: any[]) => {
		return (
			<div className="flow-editor-items-wrapper">
				{descriptors.map(descriptor => this.renderItem(descriptor))}
			</div>
		);
	};

	renderItem = (descriptor: any) => {
		return (
			<div
				key={descriptor.nodeClazz}
				className="flow-editor-items-node"
				draggable={true}
				onClick={() => this.handleAddNode(descriptor)}
			>
				<div className="flow-editor-items-node-icon">
					<Icon
						name={descriptor.icon && descriptor.icon.length ? descriptor.icon : 'image'}
						color={NODE_COLORS[descriptor.type].fill}
					/>
				</div>
				<div className="flow-editor-items-node-name">{descriptor.name}</div>
			</div>
		);
	};

	render() {
		return (
			<div className="flow-editor-items">
				<Collapse defaultActiveKey={Object.keys(Descriptors)}>
					{Object.keys(Descriptors).map(key => (
						<Collapse.Panel key={key} header={key} showArrow={false}>
							{this.renderItems(Descriptors[key])}
						</Collapse.Panel>
					))}
				</Collapse>
			</div>
		);
	}
}

export default FlowItems;
