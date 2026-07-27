import { Collapse, Input, message, notification } from 'antd';
import clsx from 'clsx';
import React from 'react';
import { v4 as uuid } from 'uuid';

import i18next from 'i18next';
import type { CanvasInstance } from '../../canvas';
import CommonButton from '../../components/common/CommonButton';
import Scrollbar from '../../components/common/Scrollbar';
import {
	EditorPanelHeader,
	PALETTE_COLLAPSE_PROPS,
	resolvePaletteActiveKeys,
} from '../../components/editor';
import { Flex } from '../../components/flex';
import Icon from '../../components/icon/Icon';
import ImageMapList from './ImageMapList';
import { getImageMapPaletteAccent } from './imagemapPalette.model';

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
	mode?: 'assets' | 'layers';
	selectedItem?: any;
}

type DragItem = DescriptorItem | null;

export interface ImageMapItemsHandle {
	renderItem: (item: DescriptorItem, centered?: boolean) => React.ReactNode;
}

const ImageMapItems = React.forwardRef<ImageMapItemsHandle, ImageMapItemsProps>(function ImageMapItems(
	{ canvasRef, descriptors = {}, mode = 'assets', selectedItem }: ImageMapItemsProps,
	ref,
) {
	const [activeKey, setActiveKey] = React.useState<string[] | null>(null);
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

	const getDescriptorCategory = (item: DescriptorItem) =>
		Object.entries(descriptors).find(([, items]) => items.includes(item))?.[0] || '';

	const renderItem = (item: DescriptorItem, centered?: boolean, category = '') => {
		const accent = getImageMapPaletteAccent(category || getDescriptorCategory(item));
		const itemStyle = {
			justifyContent: collapse ? 'center' : undefined,
			'--rde-palette-accent': accent,
		} as React.CSSProperties;

		if (item.type === 'drawing') {
			return (
				<div
					key={item.name}
					draggable
					onClick={() => handleDrawingItem(item)}
					className="rde-editor-items-item"
					style={itemStyle}
				>
					<span className="rde-editor-items-item-icon">
						<Icon
							name={item.icon.name}
							prefix={item.icon.prefix}
							style={{ ...item.icon.style, color: accent }}
						/>
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
				style={itemStyle}
			>
				<span className="rde-editor-items-item-icon">
					<Icon name={item.icon.name} prefix={item.icon.prefix} style={{ ...item.icon.style, color: accent }} />
				</span>
				{collapse ? null : <div className="rde-editor-items-item-text">{item.name}</div>}
			</div>
		);
	};

	const renderItems = (items: DescriptorItem[], category?: string) => (
		<Flex flexWrap="wrap" flexDirection="column" style={{ width: '100%' }}>
			{items.map(item => renderItem(item, undefined, category || getDescriptorCategory(item)))}
		</Flex>
	);

	React.useImperativeHandle(
		ref,
		() => ({
			renderItem,
		}),
		[collapse, canvasRef],
	);

	const className = clsx('rde-editor-items rde-imagemap-items', `mode-${mode}`, {
		minimize: collapse,
	});

	return (
		<div className={className}>
			<Flex className="rde-editor-items-layout" flex="1" flexDirection="column">
				<EditorPanelHeader
					eyebrow={collapse ? undefined : mode === 'assets' ? 'Create' : 'Canvas'}
					title={collapse ? null : mode === 'assets' ? 'Asset library' : 'Layers'}
					action={
						<CommonButton
							icon={collapse ? 'angle-double-right' : 'angle-double-left'}
							shape="circle"
							className="rde-action-btn"
							onClick={() => setCollapse(prevState => !prevState)}
						/>
					}
				/>
				{collapse || mode === 'layers' ? null : (
					<div className="rde-editor-items-search">
						<Input
							placeholder={i18next.t('action.search-list')}
							onChange={event => setTextSearch(event.target.value)}
							value={textSearch}
							allowClear
							prefix={<Icon name="search" />}
						/>
					</div>
				)}
				<Scrollbar
					className={clsx('rde-editor-items-scroll', { 'is-layer-list': mode === 'layers' })}
					style={{ height: 'auto', minHeight: 0, flex: '1 1 0%' }}
				>
					<div
						className={clsx('rde-editor-items-scroll-content', {
							'fill-height': mode === 'layers',
						})}
					>
						{mode === 'layers' ? (
							<ImageMapList canvasRef={canvasRef} selectedItem={selectedItem} />
						) : textSearch.length ? (
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
								{...PALETTE_COLLAPSE_PROPS}
								activeKey={resolvePaletteActiveKeys(activeKey, Object.keys(descriptors))}
								onChange={keys => setActiveKey(Array.isArray(keys) ? keys : [keys])}
								items={Object.keys(descriptors).map(key => {
									const accent = getImageMapPaletteAccent(key);
									return {
										key,
										label: (
											<span className="rde-editor-items-category">
												<span style={{ backgroundColor: accent }} />
												{key}
											</span>
										),
										showArrow: !collapse,
										children: renderItems(descriptors[key], key),
									};
								})}
							/>
						)}
					</div>
				</Scrollbar>
			</Flex>
		</div>
	);
});

export default ImageMapItems;
