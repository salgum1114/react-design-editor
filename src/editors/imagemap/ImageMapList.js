import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from 'antd';

import Icon from '../../components/icon/Icon';
import { Flex } from '../../components/flex';
import i18next from 'i18next';

class ImageMapList extends Component {
	static propTypes = {
		canvasRef: PropTypes.any,
		selectedItem: PropTypes.object,
	};

	renderActions = () => {
		const { canvasRef } = this.props;
		const idCropping = canvasRef ? canvasRef.handler?.interactionMode === 'crop' : false;
		return (
			<Flex.Item className="rde-canvas-list-actions" flex="0 1 auto">
				<Flex>
					<Input.Search placeholder={i18next.t('placeholder.search-node')} />
				</Flex>
				<Flex justifyContent="space-between" alignItems="center">
					<Flex flex="1" justifyContent="center">
						<Button
							className="rde-action-btn"
							style={{ width: '100%', height: 30 }}
							disabled={idCropping}
							onClick={e => canvasRef.handler.sendBackwards()}
						>
							<Icon name="arrow-up" />
						</Button>
					</Flex>
					<Flex flex="1" justifyContent="center">
						<Button
							className="rde-action-btn"
							style={{ width: '100%', height: 30 }}
							disabled={idCropping}
							onClick={e => canvasRef.handler.bringForward()}
						>
							<Icon name="arrow-down" />
						</Button>
					</Flex>
				</Flex>
			</Flex.Item>
		);
	};

	renderItem = () => {
		const { canvasRef, selectedItem } = this.props;
		const idCropping = canvasRef ? canvasRef.handler?.interactionMode === 'crop' : false;
		return canvasRef
			? canvasRef.canvas
					.getObjects()
					.filter(obj => {
						if (obj.id === 'workarea') {
							return false;
						}
						if (obj.id) {
							return true;
						}
						return false;
					})
					.map(obj => {
						let icon;
						let title = obj.name || obj.type;
						let prefix = 'fas';
						if (obj.type === 'i-text') {
							icon = 'map-marker-alt';
						} else if (obj.type === 'textbox') {
							icon = 'font';
						} else if (obj.type === 'image') {
							icon = 'image';
						} else if (obj.type === 'triangle') {
							icon = 'image';
						} else if (obj.type === 'rect') {
							icon = 'image';
						} else if (obj.type === 'circle') {
							icon = 'circle';
						} else if (obj.type === 'polygon') {
							icon = 'draw-polygon';
						} else if (obj.type === 'line') {
							icon = 'image';
						} else if (obj.type === 'element') {
							icon = 'html5';
							prefix = 'fab';
						} else if (obj.type === 'iframe') {
							icon = 'window-maximize';
						} else if (obj.type === 'video') {
							icon = 'video';
						} else if (obj.type === 'svg') {
							icon = 'bezier-curve';
						} else {
							icon = 'image';
							title = 'Default';
						}
						let className = 'rde-canvas-list-item';
						if (selectedItem && selectedItem.id === obj.id) {
							className += ' selected-item';
						}
						return (
							<Flex.Item
								key={obj.id}
								className={className}
								flex="1"
								style={{ cursor: 'pointer' }}
								onClick={() => canvasRef.handler.select(obj)}
								onMouseDown={e => e.preventDefault()}
								onDoubleClick={e => {
									canvasRef.handler.zoomHandler.zoomToCenter();
								}}
							>
								<Flex alignItems="center">
									<Icon
										className="rde-canvas-list-item-icon"
										name={icon}
										size={1.5}
										style={{ width: 32 }}
										prefix={prefix}
									/>
									<div className="rde-canvas-list-item-text">{title}</div>
									<Flex className="rde-canvas-list-item-actions" flex="1" justifyContent="flex-end">
										<Button
											className="rde-action-btn"
											shape="circle"
											disabled={idCropping}
											onClick={e => {
												e.stopPropagation();
												canvasRef.handler.duplicateById(obj.id);
											}}
										>
											<Icon name="clone" />
										</Button>
										<Button
											className="rde-action-btn"
											shape="circle"
											disabled={idCropping}
											onClick={e => {
												e.stopPropagation();
												canvasRef.handler.removeById(obj.id);
											}}
										>
											<Icon name="trash" />
										</Button>
									</Flex>
								</Flex>
							</Flex.Item>
						);
					})
			: null;
	};

	render() {
		return (
			<Flex style={{ height: '100%' }} flexDirection="column">
				{this.renderActions()}
				<div className="rde-canvas-list-items">{this.renderItem()}</div>
			</Flex>
		);
	}
}

export default ImageMapList;
