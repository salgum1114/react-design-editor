import { Collapse, Input, message, notification } from 'antd';
import clsx from 'clsx';
import React from 'react';
import { v4 as uuid } from 'uuid';

import i18next from 'i18next';
import type { CanvasInstance } from '../../canvas';
import CommonButton from '../../components/common/CommonButton';
import Scrollbar from '../../components/common/Scrollbar';
import { Flex } from '../../components/flex';
import Icon from '../../components/icon/Icon';

notification.config({
	top: 80,
	duration: 2,
});

type DescriptorItem = {
	name: string;
	type?: string;
	icon: {
		name: string;
		prefix?: string;
		style?: React.CSSProperties;
	};
	option: Record<string, any>;
};

type DescriptorMap = Record<string, DescriptorItem[]>;

interface ImageMapItemsProps {
	canvasRef?: CanvasInstance | null;
	descriptors?: DescriptorMap;
}

type DragItem = DescriptorItem | null;

export interface ImageMapItemsHandle {
	renderItem: (item: DescriptorItem, centered?: boolean) => React.ReactNode;
}

const ImageMapItems = React.forwardRef<ImageMapItemsHandle, ImageMapItemsProps>(function ImageMapItems(
	{ canvasRef, descriptors = {} }: ImageMapItemsProps,
	ref,
) {
	const [activeKey, setActiveKey] = React.useState<string[]>([]);
	const [collapse, setCollapse] = React.useState(false);
	const [textSearch, setTextSearch] = React.useState('');
	const dragItemRef = React.useRef<DragItem>(null);

	React.useEffect(() => {
		let timeoutId: number | undefined;
		let attachedCanvas: CanvasInstance | null | undefined;

		const onDragOver = (event: DragEvent) => {
			if (event.preventDefault) {
				event.preventDefault();
			}
			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = 'copy';
			}
		};

		const onDragEnter = (event: DragEvent) => {
			(event.target as HTMLElement | null)?.classList.add('over');
		};

		const onDragLeave = (event: DragEvent) => {
			(event.target as HTMLElement | null)?.classList.remove('over');
		};

		const onAddItem = (item: DescriptorItem, centered?: boolean) => {
			if (!canvasRef) {
				return;
			}
			if (canvasRef.handler.interactionMode === 'polygon') {
				message.info('Already drawing');
				return;
			}
			const id = uuid();
			const option = Object.assign({}, item.option, { id });
			canvasRef.handler.add(option, centered);
		};

		const onDrop = (event: DragEvent) => {
			const nextEvent = event || window.event;
			if (nextEvent.preventDefault) {
				nextEvent.preventDefault();
			}
			if (nextEvent.stopPropagation) {
				nextEvent.stopPropagation();
			}

			const typedEvent = nextEvent as DragEvent & { layerX?: number; layerY?: number };
			const layerX = typedEvent.layerX || 0;
			const layerY = typedEvent.layerY || 0;
			const dataTransfer = typedEvent.dataTransfer;

			if (dataTransfer?.types.length && dataTransfer.types[0] === 'Files') {
				const { files } = dataTransfer;
				Array.from(files).forEach(file => {
					(file as File & { uid?: string }).uid = uuid();
					const { type } = file;
					if (type === 'image/png' || type === 'image/jpeg' || type === 'image/jpg') {
						onAddItem(
							{
								icon: { name: 'image' },
								name: file.name,
								option: {
									type: 'image',
									file,
									left: layerX,
									top: layerY,
								},
							},
							false,
						);
					} else {
						notification.warning({
							message: 'Not supported file type',
						});
					}
				});
				return false;
			}

			if (!dragItemRef.current) {
				return false;
			}

			const option = Object.assign({}, dragItemRef.current.option, { left: layerX, top: layerY });
			onAddItem(Object.assign({}, dragItemRef.current, { option }), false);
			return false;
		};

		const attach = () => {
			if (canvasRef?.canvas?.wrapperEl) {
				attachedCanvas = canvasRef;
				canvasRef.canvas.wrapperEl.addEventListener('dragenter', onDragEnter, false);
				canvasRef.canvas.wrapperEl.addEventListener('dragover', onDragOver, false);
				canvasRef.canvas.wrapperEl.addEventListener('dragleave', onDragLeave, false);
				canvasRef.canvas.wrapperEl.addEventListener('drop', onDrop, false);
				return;
			}
			timeoutId = window.setTimeout(attach, 5);
		};

		attach();

		return () => {
			if (timeoutId) {
				window.clearTimeout(timeoutId);
			}
			if (attachedCanvas?.canvas?.wrapperEl) {
				attachedCanvas.canvas.wrapperEl.removeEventListener('dragenter', onDragEnter);
				attachedCanvas.canvas.wrapperEl.removeEventListener('dragover', onDragOver);
				attachedCanvas.canvas.wrapperEl.removeEventListener('dragleave', onDragLeave);
				attachedCanvas.canvas.wrapperEl.removeEventListener('drop', onDrop);
			}
		};
	}, [canvasRef]);

	const allDescriptors = Object.values(descriptors).reduce<DescriptorItem[]>(
		(prev, current) => prev.concat(current),
		[],
	);
	const filteredDescriptors = textSearch.length
		? allDescriptors.filter(descriptor => descriptor.name.toLowerCase().includes(textSearch.toLowerCase()))
		: allDescriptors;

	const handleAddItem = (item: DescriptorItem, centered?: boolean) => {
		if (!canvasRef) {
			return;
		}
		if (canvasRef.handler.interactionMode === 'polygon') {
			message.info('Already drawing');
			return;
		}
		const id = uuid();
		const option = Object.assign({}, item.option, { id });
		canvasRef.handler.add(option, centered);
	};

	const handleDrawingItem = (item: DescriptorItem) => {
		if (!canvasRef) {
			return;
		}
		if (canvasRef.handler.interactionMode === 'polygon') {
			message.info('Already drawing');
			return;
		}
		if (item.option.type === 'line') {
			canvasRef.handler.drawingHandler.line.init();
		} else if (item.option.type === 'arrow') {
			canvasRef.handler.drawingHandler.arrow.init();
		} else {
			canvasRef.handler.drawingHandler.polygon.init();
		}
	};

	const renderItem = (item: DescriptorItem, centered?: boolean) => {
		if (item.type === 'drawing') {
			return (
				<div
					key={item.name}
					draggable
					onClick={() => handleDrawingItem(item)}
					className="rde-editor-items-item"
					style={{ justifyContent: collapse ? 'center' : undefined }}
				>
					<span className="rde-editor-items-item-icon">
						<Icon name={item.icon.name} prefix={item.icon.prefix} style={item.icon.style} />
					</span>
					{collapse ? null : <div className="rde-editor-items-item-text">{item.name}</div>}
				</div>
			);
		}

		return (
			<div
				key={item.name}
				draggable
				onClick={() => handleAddItem(item, centered)}
				onDragStart={event => {
					dragItemRef.current = item;
					event.currentTarget.classList.add('dragging');
				}}
				onDragEnd={event => {
					dragItemRef.current = null;
					event.currentTarget.classList.remove('dragging');
				}}
				className="rde-editor-items-item"
				style={{ justifyContent: collapse ? 'center' : undefined }}
			>
				<span className="rde-editor-items-item-icon">
					<Icon name={item.icon.name} prefix={item.icon.prefix} style={item.icon.style} />
				</span>
				{collapse ? null : <div className="rde-editor-items-item-text">{item.name}</div>}
			</div>
		);
	};

	const renderItems = (items: DescriptorItem[]) => (
		<Flex flexWrap="wrap" flexDirection="column" style={{ width: '100%' }}>
			{items.map(item => renderItem(item))}
		</Flex>
	);

	React.useImperativeHandle(
		ref,
		() => ({
			renderItem,
		}),
		[collapse, canvasRef],
	);

	const className = clsx('rde-editor-items', {
		minimize: collapse,
	});

	return (
		<div className={className}>
			<Flex flex="1" flexDirection="column" style={{ height: '100%' }}>
				<Flex justifyContent="center" alignItems="center" style={{ height: 40 }}>
					<CommonButton
						icon={collapse ? 'angle-double-right' : 'angle-double-left'}
						shape="circle"
						className="rde-action-btn"
						style={{ margin: '0 4px' }}
						onClick={() => setCollapse(prevState => !prevState)}
					/>
					{collapse ? null : (
						<Input
							style={{ margin: '8px' }}
							placeholder={i18next.t('action.search-list')}
							onChange={event => setTextSearch(event.target.value)}
							value={textSearch}
							allowClear
						/>
					)}
				</Flex>
				<Scrollbar>
					<Flex flex="1" style={{ overflowY: 'hidden' }}>
						{textSearch.length ? (
							renderItems(filteredDescriptors)
						) : collapse ? (
							<Flex
								flexWrap="wrap"
								flexDirection="column"
								style={{ width: '100%' }}
								justifyContent="center"
							>
								{allDescriptors.map(item => renderItem(item))}
							</Flex>
						) : (
							<Collapse
								style={{ width: '100%' }}
								bordered={false}
								activeKey={activeKey.length ? activeKey : Object.keys(descriptors)}
								onChange={keys => setActiveKey(Array.isArray(keys) ? keys : [keys])}
								items={Object.keys(descriptors).map(key => ({
									key,
									label: key,
									showArrow: !collapse,
									children: renderItems(descriptors[key]),
								}))}
							/>
						)}
					</Flex>
				</Scrollbar>
			</Flex>
		</div>
	);
});

export default ImageMapItems;
