import { Badge, Button, Menu, Popconfirm } from 'antd';
import { debounce } from 'lodash-es';
import React, { Component } from 'react';

import i18next from 'i18next';
import type { CanvasInstance } from '../../canvas';
import Canvas from '../../canvas/Canvas';
import CommonButton from '../../components/common/CommonButton';
import { EditorActivityRail, EditorStatusBar, summarizeImageMap } from '../../components/editor';
import Icon from '../../components/icon/Icon';
import { Content } from '../../components/layout';
import SandBox from '../../components/sandbox/SandBox';
import {
	EditorThemeContext,
	getEditorCanvasTheme,
	type EditorTheme,
} from '../../theme';
import ImageMapConfigurations from './ImageMapConfigurations';
import ImageMapFooterToolbar from './ImageMapFooterToolbar';
import ImageMapHeaderToolbar from './ImageMapHeaderToolbar';
import ImageMapItems, { type ImageMapItemsHandle } from './ImageMapItems';
import ImageMapPreview from './ImageMapPreview';
import ImageMapTitle from './ImageMapTitle';

const propertiesToInclude = [
	'id',
	'name',
	'locked',
	'file',
	'src',
	'link',
	'tooltip',
	'animation',
	'layout',
	'workareaWidth',
	'workareaHeight',
	'videoLoadType',
	'autoplay',
	'shadow',
	'muted',
	'loop',
	'code',
	'icon',
	'userProperty',
	'trigger',
	'configuration',
	'superType',
	'points',
	'svg',
	'loadType',
];

const defaultOption: any = {
	stroke: 'rgba(255, 255, 255, 0)',
	strokeUniform: true,
	resource: {},
	link: {
		enabled: false,
		type: 'resource',
		state: 'new',
		dashboard: {},
	},
	tooltip: {
		enabled: true,
		type: 'resource',
		template: '<div>{{message.name}}</div>',
	},
	animation: {
		type: 'none',
		loop: true,
		autoplay: true,
		duration: 1000,
	},
	userProperty: {},
	trigger: {
		enabled: false,
		type: 'alarm',
		script: 'return message.value > 0;',
		effect: 'style',
	},
};

type DescriptorMap = Record<string, any[]>;

interface ImageMapEditorState {
	selectedItem: any;
	zoomRatio: number;
	preview: boolean;
	loading: boolean;
	progress: number;
	animations: any[];
	styles: any[];
	dataSources: any[];
	editing: boolean;
	descriptors: DescriptorMap;
	objects?: any[];
	activeActivity: string;
}

class ImageMapEditor extends Component<Record<string, never>, ImageMapEditorState> {
	static contextType = EditorThemeContext;
	declare context: React.ContextType<typeof EditorThemeContext>;

	private appliedTheme: EditorTheme | null = null;
	private canvasRef: CanvasInstance | null = null;
	private itemsRef: ImageMapItemsHandle | null = null;

	state: ImageMapEditorState = {
		selectedItem: null,
		zoomRatio: 1,
		preview: false,
		loading: false,
		progress: 0,
		animations: [],
		styles: [],
		dataSources: [],
		editing: false,
		descriptors: {},
		objects: undefined,
		activeActivity: 'assets',
	};

	componentDidMount() {
		this.appliedTheme = this.context.theme;
		this.showLoading(true);
		import('./Descriptors.json').then(descriptors => {
			this.setState({ descriptors: descriptors.default }, () => this.showLoading(false));
		});
		this.setState({
			selectedItem: null,
		});
	}

	componentDidUpdate() {
		if (this.appliedTheme === this.context.theme || !this.canvasRef) {
			return;
		}
		this.appliedTheme = this.context.theme;
		this.canvasRef.canvas.selectionColor = getEditorCanvasTheme(this.context.theme).selectionColor;
		this.canvasRef.canvas.requestRenderAll();
	}

	canvasHandlers = {
		onAdd: (target: any) => {
			const { editing } = this.state;
			this.forceUpdate();
			if (!editing) {
				this.changeEditing(true);
			}
			if (this.canvasRef?.handler.isActiveSelection(target)) {
				this.canvasHandlers.onSelect(null);
				return;
			}
			this.canvasRef?.handler.select(target);
		},
		onSelect: (target: any) => {
			const { selectedItem } = this.state;
			if (target && target.id && target.id !== 'workarea' && !this.canvasRef?.handler.isActiveSelection(target)) {
				if (selectedItem && target.id === selectedItem.id) {
					return;
				}
				this.canvasRef?.handler.getObjects().forEach(obj => {
					if (obj) {
						this.canvasRef?.handler.animationHandler.resetAnimation(obj, true);
					}
				});
				this.setState({ selectedItem: target });
				return;
			}
			this.canvasRef?.handler.getObjects().forEach(obj => {
				if (obj) {
					this.canvasRef?.handler.animationHandler.resetAnimation(obj, true);
				}
			});
			this.setState({ selectedItem: null });
		},
		onRemove: () => {
			const { editing } = this.state;
			if (!editing) {
				this.changeEditing(true);
			}
			this.canvasHandlers.onSelect(null);
		},
		onModified: debounce(() => {
			const { editing } = this.state;
			this.forceUpdate();
			if (!editing) {
				this.changeEditing(true);
			}
		}, 300),
		onZoom: (zoom: number) => {
			this.setState({ zoomRatio: zoom });
		},
		onChange: (selectedItem: any, changedValues: Record<string, any>, allValues: Record<string, any>) => {
			const { editing } = this.state;
			if (!editing) {
				this.changeEditing(true);
			}
			const changedKey = Object.keys(changedValues)[0];
			const changedValue = changedValues[changedKey];
			if (allValues.workarea) {
				this.canvasHandlers.onChangeWokarea(changedKey, changedValue, allValues.workarea);
				return;
			}
			if (changedKey === 'width' || changedKey === 'height') {
				this.canvasRef?.handler.scaleToResize(allValues.width, allValues.height);
				return;
			}
			if (changedKey === 'angle') {
				this.canvasRef?.handler.rotate(allValues.angle);
				return;
			}
			if (changedKey === 'locked') {
				this.canvasRef?.handler.setObject({
					lockMovementX: changedValue,
					lockMovementY: changedValue,
					hasControls: !changedValue,
					hoverCursor: changedValue ? 'pointer' : 'move',
					editable: !changedValue,
					locked: changedValue,
				});
				return;
			}
			if (changedKey === 'file' || changedKey === 'src' || changedKey === 'code' || changedKey === 'svg') {
				if (selectedItem.type === 'image') {
					this.canvasRef?.handler.setImageById(selectedItem.id, changedValue, true);
				} else if (selectedItem.superType === 'element') {
					this.canvasRef?.handler.elementHandler.setById(selectedItem.id, changedValue);
				} else if (selectedItem.superType === 'svg') {
					this.canvasRef?.handler.setSvg(selectedItem, changedValue);
				}
				return;
			}
			if (changedKey === 'link') {
				const link = Object.assign({}, defaultOption.link, allValues.link);
				this.canvasRef?.handler.set(changedKey, link);
				return;
			}
			if (changedKey === 'tooltip') {
				const tooltip = Object.assign({}, defaultOption.tooltip, allValues.tooltip);
				this.canvasRef?.handler.set(changedKey, tooltip);
				return;
			}
			if (changedKey === 'animation') {
				const animation = Object.assign({}, defaultOption.animation, allValues.animation);
				this.canvasRef?.handler.set(changedKey, animation);
				return;
			}
			if (changedKey === 'icon') {
				const { unicode, styles } = changedValue[Object.keys(changedValue)[0]];
				const uni = parseInt(unicode, 16);
				if (styles[0] === 'brands') {
					this.canvasRef?.handler.set('fontFamily', 'Font Awesome 5 Brands');
				} else if (styles[0] === 'regular') {
					this.canvasRef?.handler.set('fontFamily', 'Font Awesome 5 Regular');
				} else {
					this.canvasRef?.handler.set('fontFamily', 'Font Awesome 5 Free');
				}
				this.canvasRef?.handler.set('text', String.fromCodePoint(uni));
				this.canvasRef?.handler.set('icon', changedValue);
				return;
			}
			if (changedKey === 'shadow') {
				if (allValues.shadow.enabled) {
					if ('blur' in allValues.shadow) {
						this.canvasRef?.handler.setShadow(allValues.shadow as any);
					} else {
						this.canvasRef?.handler.setShadow({
							enabled: true,
							color: '#000000',
							affectStroke: false,
							nonScaling: false,
							type: 'shadow',
							blur: 15,
							offsetX: 10,
							offsetY: 10,
						} as any);
					}
				} else {
					this.canvasRef?.handler.setShadow(null);
				}
				return;
			}
			if (changedKey === 'fontWeight') {
				this.canvasRef?.handler.set(changedKey, changedValue ? 'bold' : 'normal');
				return;
			}
			if (changedKey === 'fontStyle') {
				this.canvasRef?.handler.set(changedKey, changedValue ? 'italic' : 'normal');
				return;
			}
			if (changedKey === 'textAlign') {
				this.canvasRef?.handler.set(changedKey, Object.keys(changedValue)[0]);
				return;
			}
			if (changedKey === 'trigger') {
				const trigger = Object.assign({}, defaultOption.trigger, allValues.trigger);
				this.canvasRef?.handler.set(changedKey, trigger);
				return;
			}
			if (changedKey === 'filters') {
				const filterKey = Object.keys(changedValue)[0];
				const filterValue = allValues.filters[filterKey];
				const enabled = typeof filterValue === 'object' ? filterValue.enabled : filterValue;
				if (filterKey === 'gamma') {
					const rgb = [filterValue.r, filterValue.g, filterValue.b];
					this.canvasRef?.handler.imageHandler.applyFilterByType(filterKey, enabled, { gamma: rgb });
					return;
				}
				if (filterKey === 'brightness') {
					this.canvasRef?.handler.imageHandler.applyFilterByType(filterKey, enabled, {
						brightness: filterValue.brightness,
					});
					return;
				}
				if (filterKey === 'contrast') {
					this.canvasRef?.handler.imageHandler.applyFilterByType(filterKey, enabled, {
						contrast: filterValue.contrast,
					});
					return;
				}
				if (filterKey === 'saturation') {
					this.canvasRef?.handler.imageHandler.applyFilterByType(filterKey, enabled, {
						saturation: filterValue.saturation,
					});
					return;
				}
				if (filterKey === 'hue') {
					this.canvasRef?.handler.imageHandler.applyFilterByType(filterKey, enabled, {
						rotation: filterValue.rotation,
					});
					return;
				}
				if (filterKey === 'noise') {
					this.canvasRef?.handler.imageHandler.applyFilterByType(filterKey, enabled, {
						noise: filterValue.noise,
					});
					return;
				}
				if (filterKey === 'pixelate') {
					this.canvasRef?.handler.imageHandler.applyFilterByType(filterKey, enabled, {
						blocksize: filterValue.blocksize,
					});
					return;
				}
				if (filterKey === 'blur') {
					this.canvasRef?.handler.imageHandler.applyFilterByType(filterKey, enabled, {
						value: filterValue.value,
					});
					return;
				}
				this.canvasRef?.handler.imageHandler.applyFilterByType(filterKey, enabled);
				return;
			}
			if (changedKey === 'chartOption') {
				try {
					const sandbox = new SandBox();
					const compiled = sandbox.compile(changedValue);
					const { animations, styles } = this.state;
					const chartOption = compiled(3, animations, styles, selectedItem.userProperty);
					selectedItem.setChartOptionStr(changedValue);
					this.canvasRef?.handler.elementHandler.setById(selectedItem.id, chartOption);
				} catch (error) {
					console.error(error);
				}
				return;
			}
			if (selectedItem.type === 'svg' && changedKey === 'fill') {
				selectedItem.setFill(changedValue);
			} else {
				this.canvasRef?.handler.set(changedKey, changedValue);
			}
		},
		onChangeWokarea: (changedKey: string, changedValue: any, allValues: Record<string, any>) => {
			if (changedKey === 'layout') {
				this.canvasRef?.handler.workareaHandler.setLayout(changedValue);
				return;
			}
			if (changedKey === 'file' || changedKey === 'src') {
				this.canvasRef?.handler.workareaHandler.setImage(changedValue);
				return;
			}
			if (changedKey === 'width' || changedKey === 'height') {
				this.canvasRef?.handler.originScaleToResize(
					this.canvasRef.handler.workarea,
					allValues.width,
					allValues.height,
				);
				this.canvasRef?.canvas.centerObject(this.canvasRef.handler.workarea);
				return;
			}
			this.canvasRef?.handler.workarea.set(changedKey, changedValue);
			this.canvasRef?.canvas.requestRenderAll();
		},
		onTooltip: (target: any) => {
			const value = Math.random() * 10 + 1;
			return (
				<div>
					<div>
						<div>
							<Button>{target.id}</Button>
						</div>
						<Badge count={value} />
					</div>
				</div>
			);
		},
		onClick: (_canvas: any, target: any) => {
			const { link } = target;
			if (link.state === 'current') {
				document.location.href = link.url;
				return;
			}
			window.open(link.url);
		},
		onContext: (event: any, target: any) => {
			if ((target && target.id === 'workarea') || !target) {
				const { layerX: left, layerY: top } = event;
				return (
					<Menu>
						<Menu.SubMenu key="add" style={{ width: 120 }} title={i18next.t('action.add')}>
							{this.transformList().map(item => {
								const option = Object.assign({}, item.option, { left, top });
								const newItem = Object.assign({}, item, { option });
								return (
									<Menu.Item style={{ padding: 0 }} key={item.name}>
										{this.itemsRef?.renderItem(newItem, false)}
									</Menu.Item>
								);
							})}
						</Menu.SubMenu>
					</Menu>
				);
			}
			if (this.canvasRef?.handler.isActiveSelection(target)) {
				return (
					<Menu
						items={[
							{
								key: 'objec-group',
								label: i18next.t('action.object-group'),
								onClick: () => this.canvasRef?.handler.toGroup(),
							},
						]}
					>
						<Menu.Item onClick={() => this.canvasRef?.handler.duplicate()}>
							{i18next.t('action.clone')}
						</Menu.Item>
						<Menu.Item onClick={() => this.canvasRef?.handler.remove()}>
							{i18next.t('action.delete')}
						</Menu.Item>
					</Menu>
				);
			}
			if (target.isType('Group')) {
				return (
					<Menu>
						<Menu.Item onClick={() => this.canvasRef?.handler.toActiveSelection()}>
							{i18next.t('action.object-ungroup')}
						</Menu.Item>
						<Menu.Item onClick={() => this.canvasRef?.handler.duplicate()}>
							{i18next.t('action.clone')}
						</Menu.Item>
						<Menu.Item onClick={() => this.canvasRef?.handler.remove()}>
							{i18next.t('action.delete')}
						</Menu.Item>
					</Menu>
				);
			}
			return (
				<Menu>
					<Menu.Item onClick={() => this.canvasRef?.handler.duplicateById(target.id)}>
						{i18next.t('action.clone')}
					</Menu.Item>
					<Menu.Item onClick={() => this.canvasRef?.handler.removeById(target.id)}>
						{i18next.t('action.delete')}
					</Menu.Item>
				</Menu>
			);
		},
		onTransaction: (_transaction: any) => {
			this.forceUpdate();
		},
	};

	handlers = {
		onChangePreview: (checked: boolean | object) => {
			let data: any[] | undefined;
			if (this.canvasRef) {
				data = this.canvasRef.handler.exportJSON().filter(obj => !!obj.id);
			}
			this.setState({
				preview: typeof checked === 'object' ? false : checked,
				objects: data,
			});
		},
		onProgress: (progress: number) => {
			this.setState({ progress });
		},
		onImport: (files?: FileList | null) => {
			if (!files) {
				return;
			}
			this.showLoading(true);
			setTimeout(() => {
				const reader = new FileReader();
				reader.onprogress = event => {
					if (event.lengthComputable) {
						const progress = parseInt(String((event.loaded / event.total) * 100), 10);
						this.handlers.onProgress(progress);
					}
				};
				reader.onload = event => {
					const result = event.target?.result;
					if (!result) {
						return;
					}
					const { objects, animations, styles, dataSources } = JSON.parse(String(result));
					this.setState({ animations, styles, dataSources });
					if (objects) {
						this.canvasRef?.handler.clear(true);
						const data = objects.filter((obj: any) => !!obj.id);
						this.canvasRef?.handler.importJSON(data);
					}
				};
				reader.onloadend = () => {
					this.showLoading(false);
				};
				reader.onerror = () => {
					this.showLoading(false);
				};
				reader.readAsText(files[0]);
			}, 500);
		},
		onUpload: () => {
			const inputEl = document.createElement('input');
			inputEl.accept = '.json';
			inputEl.type = 'file';
			inputEl.hidden = true;
			inputEl.onchange = event => {
				this.handlers.onImport((event.target as HTMLInputElement | null)?.files);
			};
			document.body.appendChild(inputEl);
			inputEl.click();
			inputEl.remove();
		},
		onDownload: () => {
			this.showLoading(true);
			const objects = this.canvasRef?.handler.exportJSON().filter(obj => !!obj.id) || [];
			const { animations, styles, dataSources } = this.state;
			const exportDatas = { objects, animations, styles, dataSources };
			const anchorEl = document.createElement('a');
			anchorEl.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportDatas, null, '\t'))}`;
			anchorEl.download = `${this.canvasRef?.handler.workarea.name || 'sample'}.json`;
			document.body.appendChild(anchorEl);
			anchorEl.click();
			anchorEl.remove();
			this.changeEditing(false);
			this.showLoading(false);
		},
		onChangeAnimations: (animations: any[]) => {
			if (!this.state.editing) {
				this.changeEditing(true);
			}
			this.setState({ animations });
		},
		onChangeStyles: (styles: any[]) => {
			if (!this.state.editing) {
				this.changeEditing(true);
			}
			this.setState({ styles });
		},
		onChangeDataSources: (dataSources: any[]) => {
			if (!this.state.editing) {
				this.changeEditing(true);
			}
			this.setState({ dataSources });
		},
		onSaveImage: () => {
			this.canvasRef?.handler.saveCanvasImage();
		},
		onActivityChange: (activeActivity: string) => {
			this.setState({ activeActivity });
		},
	};

	transformList = () => Object.values(this.state.descriptors).reduce<any[]>((prev, curr) => prev.concat(curr), []);

	showLoading = (loading: boolean) => {
		this.setState({ loading });
	};

	changeEditing = (editing: boolean) => {
		this.setState({ editing });
	};

	render() {
		const canvasTheme = getEditorCanvasTheme(this.context.theme);
		const {
			preview,
			selectedItem,
			zoomRatio,
			loading,
			animations,
			styles,
			dataSources,
			editing,
			descriptors,
			objects,
			activeActivity,
		} = this.state;
		const {
			onAdd,
			onRemove,
			onSelect,
			onModified,
			onChange,
			onZoom,
			onTooltip,
			onClick,
			onContext,
			onTransaction,
		} = this.canvasHandlers;
		const {
			onChangePreview,
			onDownload,
			onUpload,
			onChangeAnimations,
			onChangeStyles,
			onChangeDataSources,
			onSaveImage,
		} = this.handlers;
		const canvasObjects = this.canvasRef?.handler.getObjects() || [];
		const summary = summarizeImageMap(canvasObjects, selectedItem);

		const action = (
			<React.Fragment>
				<CommonButton
					className="rde-action-btn"
					variant="text"
					icon="file-download"
					disabled={!editing}
					tooltipTitle={i18next.t('action.download')}
					onClick={onDownload}
					tooltipPlacement="bottomRight"
				>
					Export
				</CommonButton>
				{editing ? (
					<Popconfirm
						title={i18next.t('imagemap.imagemap-editing-confirm')}
						okText={i18next.t('action.ok')}
						cancelText={i18next.t('action.cancel')}
						onConfirm={onUpload}
						placement="bottomRight"
					>
						<CommonButton
							className="rde-action-btn"
							shape="circle"
							icon="file-upload"
							tooltipTitle={i18next.t('action.upload')}
							tooltipPlacement="bottomRight"
						/>
					</Popconfirm>
				) : (
					<CommonButton
						className="rde-action-btn"
						shape="circle"
						icon="file-upload"
						tooltipTitle={i18next.t('action.upload')}
						tooltipPlacement="bottomRight"
						onClick={onUpload}
					/>
				)}
				<CommonButton
					className="rde-action-btn"
					shape="circle"
					icon="image"
					tooltipTitle={i18next.t('action.image-save')}
					onClick={onSaveImage}
					tooltipPlacement="bottomRight"
				/>
			</React.Fragment>
		);

		const title = (
			<ImageMapTitle
				title={
					<React.Fragment>
						<span className="rde-editor-breadcrumb-section">Image maps</span>
						<span className="rde-editor-breadcrumb-divider">/</span>
						<strong>{this.canvasRef?.handler.workarea?.name || i18next.t('imagemap.imagemap-editor')}</strong>
						<span className={`rde-editor-save-state ${editing ? 'editing' : 'saved'}`}>
							{editing ? 'Unsaved changes' : 'Saved'}
						</span>
					</React.Fragment>
				}
				action={action}
			/>
		);

		const content = (
			<div className="rde-editor rde-operator-editor rde-imagemap-editor">
				<EditorActivityRail
					label="Image map workspace"
					activeKey={activeActivity}
					onChange={this.handlers.onActivityChange}
					items={[
						{ key: 'assets', label: 'Assets', icon: 'shapes' },
						{ key: 'layers', label: 'Layers', icon: 'layer-group' },
					]}
				/>
				<ImageMapItems
					ref={(ref: ImageMapItemsHandle | null) => {
						this.itemsRef = ref;
					}}
					canvasRef={this.canvasRef}
					descriptors={descriptors}
					mode={activeActivity === 'layers' ? 'layers' : 'assets'}
					selectedItem={selectedItem}
				/>
				<section className="rde-editor-workspace rde-imagemap-workspace">
					<div className="rde-editor-header-toolbar">
						<ImageMapHeaderToolbar canvasRef={this.canvasRef} selectedItem={selectedItem} />
					</div>
					<div className="rde-editor-canvas">
						<Canvas
							ref={(ref: CanvasInstance | null) => {
								this.canvasRef = ref;
							}}
							className="rde-canvas"
							minZoom={1}
							maxZoom={500}
							objectOption={defaultOption}
							propertiesToInclude={propertiesToInclude}
							onModified={onModified}
							onAdd={onAdd}
							onRemove={onRemove}
							onSelect={onSelect}
							onZoom={onZoom}
							onTooltip={onTooltip}
							onContext={onContext}
							onTransaction={onTransaction}
							canvasOption={{
								backgroundColor: canvasTheme.backgroundColor,
								selectionColor: canvasTheme.selectionColor,
							}}
							rulerOption={{
								enabled: true,
								backgroundColor: canvasTheme.rulerBackgroundColor,
								lineColor: canvasTheme.rulerLineColor,
								textColor: canvasTheme.rulerTextColor,
							}}
						/>
					</div>
					<EditorStatusBar
						left={
							<ImageMapFooterToolbar
								canvasRef={this.canvasRef}
								preview={preview}
								onChangePreview={onChangePreview}
								zoomRatio={zoomRatio}
							/>
						}
						center={<span>{summary.objectCount} objects</span>}
						right={
							<span className={summary.hasSelection ? 'rde-status-selected' : 'rde-status-ok'}>
								<Icon name={summary.hasSelection ? 'mouse-pointer' : 'check-circle'} />
								{summary.hasSelection ? `${summary.selectedType} selected` : 'Map ready'}
							</span>
						}
					/>
				</section>
				<aside className="rde-editor-inspector">
					<ImageMapConfigurations
						canvasRef={this.canvasRef}
						onChange={onChange}
						selectedItem={selectedItem}
						onChangeAnimations={onChangeAnimations}
						onChangeStyles={onChangeStyles}
						onChangeDataSources={onChangeDataSources}
						animations={animations}
						styles={styles}
						dataSources={dataSources}
					/>
				</aside>
				<ImageMapPreview
					preview={preview}
					onChangePreview={() => onChangePreview(false)}
					onTooltip={onTooltip}
					onClick={onClick}
					objects={objects}
				/>
			</div>
		);

		return <Content title={title} content={content} loading={loading} className="" />;
	}
}

export default ImageMapEditor;
