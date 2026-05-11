import { FormInstance, message, Popconfirm } from 'antd';
import i18next from 'i18next';
import { debounce } from 'lodash-es';
import React from 'react';
import { FabricObject } from '../../canvas';
import Canvas, { CanvasInstance } from '../../canvas/Canvas';
import { CommonButton } from '../../components/common';
import { Content } from '../../components/layout';
import { getNode } from './configuration/NodeConfiguration';
import { OUT_PORT_TYPE } from './constant/constants';
import NodeConfigurationError from './error/NodeConfigurationError';
import Links from './link';
import Nodes from './node';
import WorkflowConfigurations from './WorkflowConfigurations';
import WorkflowItems from './WorkflowItems';
import WorkflowNodeConfigurations from './WorkflowNodeConfigurations';
import WorkflowTitle from './WorkflowTitle';
import WorkflowToolbar from './WorkflowToolbar';

interface IState {
	loading: boolean;
	zoomRatio: number;
	workflow: any;
	selectedItem: any;
	descriptors: any;
	editing: boolean;
}

class WorkflowEditor extends React.Component {
	state: IState = {
		loading: true,
		zoomRatio: 1,
		workflow: {},
		selectedItem: null,
		descriptors: {},
		editing: false,
	};

	canvasRef!: CanvasInstance;
	nodeConfigurationRef = React.createRef<FormInstance>();
	container: HTMLDivElement | null = null;

	componentDidMount() {
		import('./Descriptors.json').then(descriptors => {
			this.setState({ descriptors: descriptors.default }, () => this.hideLoading());
		});
	}

	canvasHandlers = {
		onZoom: (zoom: number) => {
			this.setState({ zoomRatio: zoom });
		},
		onAdd: (target: FabricObject & Record<string, any>) => {
			if (this.canvasRef?.handler.isActiveSelection(target)) {
				this.canvasHandlers.onSelect(null);
				return;
			}
			if (target.superType === 'node') {
				this.canvasRef.handler.nodeHandler.highlightingNode(target as any);
				this.canvasRef.handler.select(target as any);
			}
		},
		onSelect: (target: any) => {
			const currentSelectedItem = this.state.selectedItem;
			this.nodeConfigurationRef.current
				?.validateFields()
				.then(() => {
					if (currentSelectedItem) {
						currentSelectedItem.setErrors(
							!!(currentSelectedItem.errors && currentSelectedItem.errors.length),
						);
					}
				})
				.catch(() => {
					currentSelectedItem?.setErrors(true);
				});
			if (
				target &&
				target.id &&
				target.id !== 'workarea' &&
				!this.canvasRef?.handler.isActiveSelection(target) &&
				target.superType !== 'link' &&
				target.superType !== 'port'
			) {
				this.setState({ selectedItem: target });
				return;
			}
			this.setState({ selectedItem: null }, () => {
				this.canvasRef.handler.nodeHandler.deselect();
			});
		},
		onRemove: () => {
			if (!this.state.editing) {
				this.changeEditing(true);
			}
		},
		onModified: () => {
			if (!this.state.editing) {
				this.changeEditing(true);
			}
		},
	};

	handlers = {
		onImport: (files: FileList | null) => {
			if (files?.length) {
				this.showLoading();
				const reader = new FileReader();
				reader.onload = (e: ProgressEvent<FileReader>) => {
					try {
						const result = JSON.parse(String(e.target?.result || '{}')) as any;
						this.setState({ workflow: result });
						this.canvasRef.handler.clear();
						const nodes = (result.nodes || []).map((node: any) => {
							return {
								...node,
								type: getNode(node.nodeClazz),
								left: node.properties ? node.properties.left : 0,
								top: node.properties ? node.properties.top : 0,
							};
						});
						const links = (result.links || []).map((link: any) => {
							return {
								fromNodeId: link.fromNode,
								fromPortId: link.fromPort,
								toNodeId: link.toNode,
								type: 'link',
								superType: 'link',
								left: link.properties ? link.properties.left : 0,
								top: link.properties ? link.properties.top : 0,
							};
						});
						const objects = nodes.concat(links) as any[];
						const { viewportTransform } = result.properties;
						if (viewportTransform) {
							this.canvasRef.canvas.setViewportTransform(viewportTransform);
						}
						this.canvasRef.handler.importJSON(objects, () => {
							this.hideLoading();
							this.canvasRef.canvas.setZoom(this.state.zoomRatio);
						});
					} catch (error: any) {
						console.error(error);
						this.hideLoading();
					}
				};
				reader.readAsText(files[0]);
			}
		},
		onUpload: () => {
			const inputEl = document.createElement('input');
			inputEl.accept = '.json';
			inputEl.type = 'file';
			inputEl.hidden = true;
			inputEl.onchange = (e: any) => {
				this.handlers.onImport(e.target.files);
			};
			document.body.appendChild(inputEl); // required for firefox
			inputEl.click();
			inputEl.remove();
		},
		onDownload: () => {
			this.showLoading();
			const workflow = this.handlers.exportJsonCode();
			if (workflow) {
				const anchorEl = document.createElement('a');
				anchorEl.href = `data:text/json;charset=utf-8,${encodeURIComponent(
					JSON.stringify(workflow, null, '\t'),
				)}`;
				anchorEl.download = `${workflow.name}.json`;
				document.body.appendChild(anchorEl); // required for firefox
				anchorEl.click();
				anchorEl.remove();
				this.hideLoading();
			}
		},
		exportJsonCode: () => {
			const workflow = Object.assign({}, this.state.workflow);
			const nodes: any[] = [];
			const links: any[] = [];
			try {
				this.canvasRef.handler.exportJSON().forEach((obj: any) => {
					if (obj.superType === 'node') {
						if (obj.errors) {
							throw new NodeConfigurationError(
								i18next.t('workflow.validate-fields-error'),
								obj.id,
								obj.name,
							);
						}
						const node = {
							id: obj.id,
							name: obj.name,
							description: obj.description,
							nodeClazz: obj.nodeClazz,
							configuration: obj.configuration,
							properties: {
								left: obj.left || 0,
								top: obj.top || 0,
								icon: obj.icon,
							},
						};
						nodes.push(node);
					} else if (obj.superType === 'link') {
						const link = {
							fromNode: obj.fromNode.id,
							fromPort: obj.fromPort.id,
							toNode: obj.toNode.id,
							properties: {
								left: obj.left || 0,
								top: obj.top || 0,
							},
						};
						links.push(link);
					}
				});
				workflow.nodes = nodes;
				workflow.links = links;
				const properties = {
					viewportTransform: this.canvasRef.canvas.viewportTransform,
				};
				workflow.properties = properties;
				return workflow;
			} catch (error: any) {
				console.error(`[ERROR] ${this.constructor.name} exportJsonCode()`, error);
				if (error?.nodeId) {
					this.canvasRef.handler.selectById(error.nodeId);
				}
				message.error(error?.message || 'Failed to export workflow');
				this.hideLoading();
			}
		},
		onChange: debounce((selectedItem: any, changedValues: any, allValues: any) => {
			if (!this.state.editing) {
				this.changeEditing(true);
			}
			if (changedValues.workflow) {
				const workflow = Object.assign({}, this.state.workflow, changedValues.workflow);
				this.setState({
					workflow,
				});
			} else {
				setTimeout(async () => {
					const errors = this.nodeConfigurationRef.current?.getFieldsError();
					if (Object.values(errors).filter(error => error.errors?.length).length) {
						selectedItem?.setErrors(true);
					} else {
						selectedItem?.setErrors(false);
					}
					this.canvasRef.handler.transactionHandler.save('configuration');
					this.canvasRef.canvas.renderAll();
				}, 0);
				const configuration = Object.assign({}, selectedItem?.configuration, changedValues.configuration);
				this.canvasRef.handler.setObject({
					configuration,
					name: allValues.name,
					description: allValues.description,
				});
				selectedItem.setName(allValues.name);
				if (selectedItem.descriptor.outPortType === OUT_PORT_TYPE.DYNAMIC) {
					this.canvasRef.handler.portHandler.recreate(selectedItem);
				}
				this.canvasRef.handler.transactionHandler.save('configuration');
			}
		}, 200),
	};

	showLoading = () => {
		this.setState({
			loading: true,
		});
	};

	hideLoading = () => {
		this.setState({
			loading: false,
		});
	};

	changeEditing = (editing: boolean) => {
		this.setState({
			editing,
		});
	};

	render() {
		const { zoomRatio, workflow, selectedItem, descriptors, loading, editing } = this.state;
		const { onChange, onDownload, onUpload } = this.handlers;
		const { onZoom, onAdd, onSelect, onRemove, onModified } = this.canvasHandlers;
		const nodes = Nodes(descriptors);
		const action = (
			<React.Fragment>
				<CommonButton
					className="rde-action-btn"
					shape="circle"
					icon="file-download"
					disabled={!editing}
					tooltipTitle={i18next.t('action.download')}
					onClick={onDownload}
					tooltipPlacement="bottomRight"
				/>
				{editing ? (
					<Popconfirm
						title={i18next.t('workflow.workflow-editing-confirm')}
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
			</React.Fragment>
		);
		const titleContent = (
			<React.Fragment>
				<span>{i18next.t('workflow.workflow-editor')}</span>
				<span style={{ width: 40, textAlign: 'center' }}>/</span>
				<span style={{ color: workflow.enabled ? '#49a9ee' : 'rgba(0, 0, 0, 0.65)' }}>{workflow.name}</span>
			</React.Fragment>
		);
		const title = <WorkflowTitle title={titleContent} action={action} />;
		const content = (
			<div className="rde-editor">
				<WorkflowItems
					instance={this.canvasRef}
					selectedItem={this.state.selectedItem}
					descriptors={descriptors}
				/>
				<div
					ref={(c: HTMLDivElement | null) => {
						this.container = c;
					}}
					className="rde-editor-canvas"
				>
					<Canvas
						ref={(c: CanvasInstance | null) => {
							if (c) {
								this.canvasRef = c;
							}
						}}
						className="rde-canvas"
						canvasOption={{ backgroundColor: '#1c2128' }}
						fabricObjects={{ ...nodes, ...Links } as any}
						workareaOption={{
							width: 0,
							height: 0,
						}}
						gridOption={{
							enabled: true,
							grid: 20,
							snapToGrid: true,
							type: 'dot',
							dotColor: '#5f646b',
						}}
						activeSelectionOption={{
							hasControls: false,
							hasBorders: false,
							perPixelTargetFind: true,
						}}
						linkOption={{ stroke: '#c3c9d5', strokeWidth: 2 }}
						minZoom={30}
						maxZoom={200}
						onZoom={onZoom}
						onSelect={onSelect}
						onAdd={onAdd}
						onRemove={onRemove}
						onModified={onModified}
						onClick={(_canvas: any, target: any, subTarget: any) => {
							if (subTarget) {
								if (target.ports?.length) {
									const spinner = target.ports.find((p: any) => p.type === 'spinner');
									spinner?.setVisibility(true);
									setTimeout(() => {
										spinner?.setVisibility(false);
									}, 5000);
								}
							}
						}}
						canvasActions={{ move: false, transaction: true, clipboard: true }}
						guidelineOption={{ enabled: false }}
						shouldHighlightPathOnSelect={true}
					/>
					<div className="rde-editor-properties" style={{ display: selectedItem ? 'block' : 'none' }}>
						<WorkflowNodeConfigurations
							ref={this.nodeConfigurationRef}
							selectedItem={selectedItem}
							workflow={workflow}
							canvasRef={this.canvasRef}
							descriptors={descriptors}
							onChange={onChange}
						/>
					</div>
					<div className="rde-editor-toolbar-container">
						<WorkflowToolbar instance={this.canvasRef} zoomRatio={zoomRatio} />
					</div>
				</div>
				<WorkflowConfigurations
					workflow={workflow}
					selectedItem={selectedItem}
					canvasRef={this.canvasRef}
					onChange={onChange}
				/>
			</div>
		);
		return <Content title={title} content={content} loading={loading} className="" />;
	}
}

export default WorkflowEditor;
