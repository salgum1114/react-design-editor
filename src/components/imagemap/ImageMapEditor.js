import React, { Component } from 'react';
import { Badge, Button, Popconfirm, Menu } from 'antd';
import debounce from 'lodash/debounce';
import i18n from 'i18next';

import ImageMapFooterToolbar from './ImageMapFooterToolbar';
import ImageMapItems from './ImageMapItems';
import ImageMapTitle from './ImageMapTitle';
import ImageMapHeaderToolbar from './ImageMapHeaderToolbar';
import ImageMapPreview from './ImageMapPreview';
import ImageMapConfigurations from './ImageMapConfigurations';
import SandBox from '../sandbox/SandBox';

import '../../libs/fontawesome-5.2.0/css/all.css';
import '../../styles/index.less';
import Container from '../common/Container';
import CommonButton from '../common/CommonButton';
import Canvas from '../canvas/Canvas';

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

const defaultOption = {
	fill: 'rgba(0, 0, 0, 1)',
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
		delay: 100,
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

class ImageMapEditor extends Component {
	state = {
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
	};

	componentDidMount() {
		this.showLoading(true);
		import('./Descriptors.json').then(descriptors => {
			this.setState(
				{
					descriptors,
				},
				() => {
					this.showLoading(false);
				},
			);
		});
		this.setState({
			selectedItem: null,
		});
		this.shortcutHandlers.esc();
	}

	canvasHandlers = {
		onAdd: target => {
			const { editing } = this.state;
			this.forceUpdate();
			if (!editing) {
				this.changeEditing(true);
			}
			if (target.type === 'activeSelection') {
				this.canvasHandlers.onSelect(null);
				return;
			}
			this.canvasRef.handler.select(target);
		},
		onSelect: target => {
			const { selectedItem } = this.state;
			if (target && target.id && target.id !== 'workarea' && target.type !== 'activeSelection') {
				if (selectedItem && target.id === selectedItem.id) {
					return;
				}
				this.canvasRef.handler.getObjects().forEach(obj => {
					if (obj) {
						this.canvasRef.handler.animationHandler.initAnimation(obj, true);
					}
				});
				this.setState({
					selectedItem: target,
				});
				return;
			}
			this.canvasRef.handler.getObjects().forEach(obj => {
				if (obj) {
					this.canvasRef.handler.animationHandler.initAnimation(obj, true);
				}
			});
			this.setState({
				selectedItem: null,
			});
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
		onZoom: zoom => {
			this.setState({
				zoomRatio: zoom,
			});
		},
		onChange: (selectedItem, changedValues, allValues) => {
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
				this.canvasRef.handler.scaleToResize(allValues.width, allValues.height);
				return;
			}
			if (changedKey === 'angle') {
				this.canvasRef.handler.rotate(allValues.angle);
				return;
			}
			if (changedKey === 'locked') {
				this.canvasRef.handler.setObject({
					lockMovementX: changedValue,
					lockMovementY: changedValue,
					hasControls: !changedValue,
					hoverCursor: changedValue ? 'pointer' : 'move',
					editable: !changedValue,
					locked: changedValue,
				});
				return;
			}
			if (changedKey === 'file' || changedKey === 'src' || changedKey === 'code') {
				if (selectedItem.type === 'image') {
					this.canvasRef.handler.setImageById(selectedItem.id, changedValue);
				} else if (selectedItem.superType === 'element') {
					this.canvasRef.handler.elementHandler.setById(selectedItem.id, changedValue);
				}
				return;
			}
			if (changedKey === 'link') {
				const link = Object.assign({}, defaultOption.link, allValues.link);
				this.canvasRef.handler.set(changedKey, link);
				return;
			}
			if (changedKey === 'tooltip') {
				const tooltip = Object.assign({}, defaultOption.tooltip, allValues.tooltip);
				this.canvasRef.handler.set(changedKey, tooltip);
				return;
			}
			if (changedKey === 'animation') {
				const animation = Object.assign({}, defaultOption.animation, allValues.animation);
				this.canvasRef.handler.set(changedKey, animation);
				return;
			}
			if (changedKey === 'icon') {
				const { unicode, styles } = changedValue[Object.keys(changedValue)[0]];
				const uni = parseInt(unicode, 16);
				if (styles[0] === 'brands') {
					this.canvasRef.handler.set('fontFamily', 'Font Awesome 5 Brands');
				} else if (styles[0] === 'regular') {
					this.canvasRef.handler.set('fontFamily', 'Font Awesome 5 Regular');
				} else {
					this.canvasRef.handler.set('fontFamily', 'Font Awesome 5 Free');
				}
				this.canvasRef.handler.set('text', String.fromCodePoint(uni));
				this.canvasRef.handler.set('icon', changedValue);
				return;
			}
			if (changedKey === 'shadow') {
				if (allValues.shadow.enabled) {
					if ('blur' in allValues.shadow) {
						this.canvasRef.handler.setShadow(allValues.shadow);
					} else {
						this.canvasRef.handler.setShadow({
							enabled: true,
							blur: 15,
							offsetX: 10,
							offsetY: 10,
						});
					}
				} else {
					this.canvasRef.handler.setShadow(null);
				}
				return;
			}
			if (changedKey === 'fontWeight') {
				this.canvasRef.handler.set(changedKey, changedValue ? 'bold' : 'normal');
				return;
			}
			if (changedKey === 'fontStyle') {
				this.canvasRef.handler.set(changedKey, changedValue ? 'italic' : 'normal');
				return;
			}
			if (changedKey === 'textAlign') {
				this.canvasRef.handler.set(changedKey, Object.keys(changedValue)[0]);
				return;
			}
			if (changedKey === 'trigger') {
				const trigger = Object.assign({}, defaultOption.trigger, allValues.trigger);
				this.canvasRef.handler.set(changedKey, trigger);
				return;
			}
			if (changedKey === 'filters') {
				const filterKey = Object.keys(changedValue)[0];
				const filterValue = allValues.filters[filterKey];
				if (filterKey === 'gamma') {
					const rgb = [filterValue.r, filterValue.g, filterValue.b];
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						gamma: rgb,
					});
					return;
				}
				if (filterKey === 'brightness') {
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						brightness: filterValue.brightness,
					});
					return;
				}
				if (filterKey === 'contrast') {
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						contrast: filterValue.contrast,
					});
					return;
				}
				if (filterKey === 'saturation') {
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						saturation: filterValue.saturation,
					});
					return;
				}
				if (filterKey === 'hue') {
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						rotation: filterValue.rotation,
					});
					return;
				}
				if (filterKey === 'noise') {
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						noise: filterValue.noise,
					});
					return;
				}
				if (filterKey === 'pixelate') {
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						blocksize: filterValue.blocksize,
					});
					return;
				}
				if (filterKey === 'blur') {
					this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey].enabled, {
						value: filterValue.value,
					});
					return;
				}
				this.canvasRef.handler.imageHandler.applyFilterByType(filterKey, changedValue[filterKey]);
				return;
			}
			if (changedKey === 'chartOption') {
				try {
					const sandbox = new SandBox();
					const compiled = sandbox.compile(changedValue);
					const { animations, styles } = this.state;
					const chartOption = compiled(3, animations, styles, selectedItem.userProperty);
					selectedItem.setChartOptionStr(changedValue);
					this.canvasRef.handler.elementHandler.setById(selectedItem.id, chartOption);
				} catch (error) {
					console.error(error);
				}
				return;
			}
			this.canvasRef.handler.set(changedKey, changedValue);
		},
		onChangeWokarea: (changedKey, changedValue, allValues) => {
			if (changedKey === 'layout') {
				this.canvasRef.handler.workareaHandler.setLayout(changedValue);
				return;
			}
			if (changedKey === 'file' || changedKey === 'src') {
				this.canvasRef.handler.workareaHandler.setImage(changedValue);
				return;
			}
			if (changedKey === 'width' || changedKey === 'height') {
				this.canvasRef.handler.originScaleToResize(
					this.canvasRef.handler.workarea,
					allValues.width,
					allValues.height,
				);
				this.canvasRef.canvas.centerObject(this.canvasRef.handler.workarea);
				return;
			}
			this.canvasRef.handler.workarea.set(changedKey, changedValue);
			this.canvasRef.canvas.requestRenderAll();
		},
		onTooltip: (ref, target) => {
			const value = Math.random() * 10 + 1;
			const { animations, styles } = this.state;
			// const { code } = target.trigger;
			// const compile = SandBox.compile(code);
			// const result = compile(value, animations, styles, target.userProperty);
			// console.log(result);
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
		onClick: (canvas, target) => {
			const { link } = target;
			if (link.state === 'current') {
				document.location.href = link.url;
				return;
			}
			window.open(link.url);
		},
		onContext: (ref, event, target) => {
			if ((target && target.id === 'workarea') || !target) {
				const { layerX: left, layerY: top } = event;
				return (
					<Menu>
						<Menu.SubMenu key="add" style={{ width: 120 }} title={i18n.t('action.add')}>
							{this.transformList().map(item => {
								const option = Object.assign({}, item.option, { left, top });
								const newItem = Object.assign({}, item, { option });
								return (
									<Menu.Item style={{ padding: 0 }} key={item.name}>
										{this.itemsRef.renderItem(newItem, false)}
									</Menu.Item>
								);
							})}
						</Menu.SubMenu>
					</Menu>
				);
			}
			if (target.type === 'activeSelection') {
				return (
					<Menu>
						<Menu.Item
							onClick={() => {
								this.canvasRef.handler.toGroup();
							}}
						>
							{i18n.t('action.object-group')}
						</Menu.Item>
						<Menu.Item
							onClick={() => {
								this.canvasRef.handler.duplicate();
							}}
						>
							{i18n.t('action.clone')}
						</Menu.Item>
						<Menu.Item
							onClick={() => {
								this.canvasRef.handler.remove();
							}}
						>
							{i18n.t('action.delete')}
						</Menu.Item>
					</Menu>
				);
			}
			if (target.type === 'group') {
				return (
					<Menu>
						<Menu.Item
							onClick={() => {
								this.canvasRef.handler.toActiveSelection();
							}}
						>
							{i18n.t('action.object-ungroup')}
						</Menu.Item>
						<Menu.Item
							onClick={() => {
								this.canvasRef.handler.duplicate();
							}}
						>
							{i18n.t('action.clone')}
						</Menu.Item>
						<Menu.Item
							onClick={() => {
								this.canvasRef.handler.remove();
							}}
						>
							{i18n.t('action.delete')}
						</Menu.Item>
					</Menu>
				);
			}
			return (
				<Menu>
					<Menu.Item
						onClick={() => {
							this.canvasRef.handler.duplicateById(target.id);
						}}
					>
						{i18n.t('action.clone')}
					</Menu.Item>
					<Menu.Item
						onClick={() => {
							this.canvasRef.handler.removeById(target.id);
						}}
					>
						{i18n.t('action.delete')}
					</Menu.Item>
				</Menu>
			);
		},
		onTransaction: transaction => {
			this.forceUpdate();
		},
	};

	handlers = {
		onChangePreview: checked => {
			let data;
			if (this.canvasRef) {
				data = this.canvasRef.handler.exportJSON().objects.filter(obj => {
					if (!obj.id) {
						return false;
					}
					return true;
				});
			}
			this.setState({
				preview: typeof checked === 'object' ? false : checked,
				objects: data,
			});
		},
		onProgress: progress => {
			this.setState({
				progress,
			});
		},
		onImport: files => {
			if (files) {
				this.showLoading(true);
				setTimeout(() => {
					const reader = new FileReader();
					reader.onprogress = e => {
						if (e.lengthComputable) {
							const progress = parseInt((e.loaded / e.total) * 100, 10);
							this.handlers.onProgress(progress);
						}
					};
					reader.onload = e => {
						const { objects, animations, styles, dataSources } = JSON.parse(e.target.result);
						this.setState({
							animations,
							styles,
							dataSources,
						});
						if (objects) {
							this.canvasRef.handler.clear(true);
							const data = objects.filter(obj => {
								if (!obj.id) {
									return false;
								}
								return true;
							});
							this.canvasRef.handler.importJSON(data);
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
			}
		},
		onUpload: () => {
			const inputEl = document.createElement('input');
			inputEl.accept = '.json';
			inputEl.type = 'file';
			inputEl.hidden = true;
			inputEl.onchange = e => {
				this.handlers.onImport(e.target.files);
			};
			document.body.appendChild(inputEl); // required for firefox
			inputEl.click();
			inputEl.remove();
		},
		onDownload: () => {
			this.showLoading(true);
			const objects = this.canvasRef.handler.exportJSON().objects.filter(obj => {
				if (!obj.id) {
					return false;
				}
				return true;
			});
			const { animations, styles, dataSources } = this.state;
			const exportDatas = {
				objects,
				animations,
				styles,
				dataSources,
			};
			const anchorEl = document.createElement('a');
			anchorEl.href = `data:text/json;charset=utf-8,${encodeURIComponent(
				JSON.stringify(exportDatas, null, '\t'),
			)}`;
			anchorEl.download = `${this.canvasRef.handler.workarea.name || 'sample'}.json`;
			document.body.appendChild(anchorEl); // required for firefox
			anchorEl.click();
			anchorEl.remove();
			this.showLoading(false);
		},
		onChangeAnimations: animations => {
			if (!this.state.editing) {
				this.changeEditing(true);
			}
			this.setState({
				animations,
			});
		},
		onChangeStyles: styles => {
			if (!this.state.editing) {
				this.changeEditing(true);
			}
			this.setState({
				styles,
			});
		},
		onChangeDataSources: dataSources => {
			if (!this.state.editing) {
				this.changeEditing(true);
			}
			this.setState({
				dataSources,
			});
		},
		onSaveImage: () => {
			this.canvasRef.handler.saveCanvasImage();
		},
	};

	shortcutHandlers = {
		esc: () => {
			document.addEventListener('keydown', e => {
				if (e.keyCode === 27) {
					this.handlers.onChangePreview(false);
				}
			});
		},
	};

	transformList = () => {
		return Object.values(this.state.descriptors).reduce((prev, curr) => prev.concat(curr), []);
	};

	showLoading = loading => {
		this.setState({
			loading,
		});
	};

	changeEditing = editing => {
		this.setState({
			editing,
		});
	};

	render() {
		const {
			preview,
			selectedItem,
			zoomRatio,
			loading,
			progress,
			animations,
			styles,
			dataSources,
			editing,
			descriptors,
			objects,
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
		const action = (
			<React.Fragment>
				<CommonButton
					className="rde-action-btn"
					shape="circle"
					icon="file-download"
					disabled={!editing}
					tooltipTitle={i18n.t('action.download')}
					onClick={onDownload}
					tooltipPlacement="bottomRight"
				/>
				{editing ? (
					<Popconfirm
						title={i18n.t('imagemap.imagemap-editing-confirm')}
						okText={i18n.t('action.ok')}
						cancelText={i18n.t('action.cancel')}
						onConfirm={onUpload}
						placement="bottomRight"
					>
						<CommonButton
							className="rde-action-btn"
							shape="circle"
							icon="file-upload"
							tooltipTitle={i18n.t('action.upload')}
							tooltipPlacement="bottomRight"
						/>
					</Popconfirm>
				) : (
					<CommonButton
						className="rde-action-btn"
						shape="circle"
						icon="file-upload"
						tooltipTitle={i18n.t('action.upload')}
						tooltipPlacement="bottomRight"
						onClick={onUpload}
					/>
				)}
				<CommonButton
					className="rde-action-btn"
					shape="circle"
					icon="image"
					tooltipTitle={i18n.t('action.image-save')}
					onClick={onSaveImage}
					tooltipPlacement="bottomRight"
				/>
			</React.Fragment>
		);
		const titleContent = (
			<React.Fragment>
				<span>{i18n.t('imagemap.imagemap-editor')}</span>
			</React.Fragment>
		);
		const title = <ImageMapTitle title={titleContent} action={action} />;
		const content = (
			<div className="rde-editor">
				<ImageMapItems
					ref={c => {
						this.itemsRef = c;
					}}
					canvasRef={this.canvasRef}
					descriptors={descriptors}
				/>
				<div className="rde-editor-canvas-container">
					<div className="rde-editor-header-toolbar">
						<ImageMapHeaderToolbar
							canvasRef={this.canvasRef}
							selectedItem={selectedItem}
							onSelect={onSelect}
						/>
					</div>
					<div
						ref={c => {
							this.container = c;
						}}
						className="rde-editor-canvas"
					>
						<Canvas
							ref={c => {
								this.canvasRef = c;
							}}
							minZoom={30}
							maxZoom={500}
							defaultOption={defaultOption}
							propertiesToInclude={propertiesToInclude}
							onModified={onModified}
							onAdd={onAdd}
							onRemove={onRemove}
							onSelect={onSelect}
							onZoom={onZoom}
							onTooltip={onTooltip}
							onClick={onClick}
							onContext={onContext}
							onTransaction={onTransaction}
							keyEvent={{
								transaction: true,
							}}
						/>
					</div>
					<div className="rde-editor-footer-toolbar">
						<ImageMapFooterToolbar
							canvasRef={this.canvasRef}
							preview={preview}
							onChangePreview={onChangePreview}
							zoomRatio={zoomRatio}
						/>
					</div>
				</div>
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
				<ImageMapPreview
					preview={preview}
					onChangePreview={onChangePreview}
					onTooltip={onTooltip}
					onClick={onClick}
					objects={objects}
				/>
			</div>
		);
		return <Container title={title} content={content} loading={loading} className="" />;
	}
}

export default ImageMapEditor;
