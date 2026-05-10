import { Button, Input } from 'antd';
import i18next from 'i18next';
import React from 'react';

import type { CanvasInstance } from '../../canvas';
import { Flex } from '../../components/flex';
import Icon from '../../components/icon/Icon';

type CanvasListObject = {
	id?: string;
	name?: string;
	type?: string;
};

interface ImageMapListProps {
	canvasRef?: CanvasInstance | null;
	selectedItem?: { id?: string } | null;
}

const resolveListItem = (obj: CanvasListObject) => {
	let icon = 'image';
	let title = obj.name || obj.type || 'Default';
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
		title = 'Default';
	}

	return { icon, prefix, title };
};

export default function ImageMapList({ canvasRef, selectedItem }: ImageMapListProps) {
	const isCropping = canvasRef ? canvasRef.handler?.interactionMode === 'crop' : false;
	const objects =
		(canvasRef?.canvas.getObjects() as CanvasListObject[] | undefined)?.filter(obj => {
			if (obj.id === 'workarea') {
				return false;
			}
			return !!obj.id;
		}) || [];

	return (
		<Flex style={{ height: '100%' }} flexDirection="column">
			<Flex.Item className="rde-canvas-list-actions" flex="0 1 auto">
				<Flex>
					<Input.Search placeholder={i18next.t('placeholder.search-node')} />
				</Flex>
				<Flex justifyContent="space-between" alignItems="center">
					<Flex flex="1" justifyContent="center">
						<Button
							className="rde-action-btn"
							style={{ width: '100%', height: 30 }}
							disabled={isCropping}
							onClick={() => canvasRef?.handler.sendBackwards()}
						>
							<Icon name="arrow-up" />
						</Button>
					</Flex>
					<Flex flex="1" justifyContent="center">
						<Button
							className="rde-action-btn"
							style={{ width: '100%', height: 30 }}
							disabled={isCropping}
							onClick={() => canvasRef?.handler.bringForward()}
						>
							<Icon name="arrow-down" />
						</Button>
					</Flex>
				</Flex>
			</Flex.Item>
			<div className="rde-canvas-list-items">
				{objects.map(obj => {
					const { icon, prefix, title } = resolveListItem(obj);
					const className =
						selectedItem?.id === obj.id ? 'rde-canvas-list-item selected-item' : 'rde-canvas-list-item';

					return (
						<Flex.Item
							key={obj.id}
							className={className}
							flex="1"
							style={{ cursor: 'pointer' }}
							onClick={() => canvasRef?.handler.select(obj as any)}
							onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
							onDoubleClick={() => canvasRef?.handler.zoomHandler.zoomToCenter()}
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
										disabled={isCropping}
										onClick={event => {
											event.stopPropagation();
											canvasRef?.handler.duplicateById(obj.id as string);
										}}
									>
										<Icon name="clone" />
									</Button>
									<Button
										className="rde-action-btn"
										shape="circle"
										disabled={isCropping}
										onClick={event => {
											event.stopPropagation();
											canvasRef?.handler.removeById(obj.id as string);
										}}
									>
										<Icon name="trash" />
									</Button>
								</Flex>
							</Flex>
						</Flex.Item>
					);
				})}
			</div>
		</Flex>
	);
}
