import { message, Popconfirm } from 'antd';
import i18n from 'i18next';
import React, { Component } from 'react';
import Canvas, { CanvasInstance } from '../../canvas/Canvas';
import { CommonButton } from '../../components/common';
import { Content } from '../../components/layout';
import { getEllipsis, getNode } from './configuration/NodeConfiguration';
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

class WorkflowEditor extends Component {
	state: IState = {
		loading: true,
		zoomRatio: 1,
		workflow: {},
		selectedItem: null,
		descriptors: {},
		editing: false,
	};

	canvasRef: CanvasInstance;
	nodeConfigurationRef: any;
	container: any;

	componentDidMount() {
		import('./Descriptors.json').then(descriptors => {
			this.setState(
				{
					descriptors,
				},
				() => {
					this.hideLoading();
				},
			);
		});
	}

	canvasHandlers = {
		onZoom: zoom => {
			this.setState({
				zoomRatio: zoom,
			});
		},
		onAdd: target => {
			if (target.type === 'activeSelection') {
				this.canvasHandlers.onSelect(null);
				return;
			}
			if (target.superType === 'node') {
				this.canvasRef.handler.select(target);
				this.canvasRef.handler.nodeHandler.highlightingNode(target);
			}
		},
		onSelect: target => {
			this.nodeConfigurationRef.props.form.validateFields(err => {
				if (this.state.selectedItem) {
					if (err || (this.state.selectedItem.errors && this.state.selectedItem.errors.length)) {
						this.state.selectedItem.setErrors(true);
					} else {
						this.state.selectedItem.setErrors(false);
					}
				}
			});
			if (
				target &&
				target.id &&
				target.id !== 'workarea' &&
				target.type !== 'activeSelection' &&
				target.superType !== 'link' &&
				target.superType !== 'port'
			) {
				this.setState({
					selectedItem: target,
				});
				return;
			}
			this.setState(
				{
					selectedItem: null,
				},
				() => {
					this.canvasRef.handler.nodeHandler.deselect();
				},
			);
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
		onImport: files => {
			if (files) {
				this.showLoading();
				const reader = new FileReader();
				reader.onload = e => {
					const result = JSON.parse(e.target.result as string);
					this.setState({
						workflow: result,
					});
					this.canvasRef.handler.clear();
					const nodes = result.nodes.map(node => {
						return {
							...node,
							type: getNode(node.nodeClazz),
							left: node.properties ? node.properties.left : 0,
							top: node.properties ? node.properties.top : 0,
						};
					});
					const links = result.links.map(link => {
						return {
							fromNodeId: link.fromNode,
							fromPortId: link.fromPort,
							toNodeId: link.toNode,
							type: 'curvedLink',
							superType: 'link',
							left: link.properties ? link.properties.left : 0,
							top: link.properties ? link.properties.top : 0,
						};
					});
					const objects = nodes.concat(links);
					const { viewportTransform } = result.properties;
					if (viewportTransform) {
						this.canvasRef.canvas.setViewportTransform(viewportTransform);
					}
					this.canvasRef.handler.importJSON(objects, () => {
						this.hideLoading();
						this.canvasRef.canvas.setZoom(this.state.zoomRatio);
					});
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
			const workflow = this.handlers.exportJsonCode() as any;
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
			const nodes = [];
			const links = [];
			try {
				this.canvasRef.handler.exportJSON().forEach(obj => {
					if (obj.superType === 'node') {
						if (obj.errors) {
							throw new NodeConfigurationError(
								i18n.t('workflow.validate-fields-error'),
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
			} catch (error) {
				console.error(`[ERROR] ${this.constructor.name} exportJsonCode()`, error);
				this.canvasRef.handler.selectById(error.nodeId);
				message.error(error.message);
				this.hideLoading();
			}
		},
		onChange: (selectedItem, changedValues, allValues) => {
			if (!this.state.editing) {
				this.changeEditing(true);
			}
			if (changedValues.workflow) {
				const workflow = Object.assign({}, this.state.workflow, changedValues.workflow);
				this.setState({
					workflow,
				});
			} else {
				setTimeout(() => {
					const configurationList = Object.keys(allValues.configuration).map(key => `configuration.${key}`);
					const errors = this.nodeConfigurationRef.props.form.getFieldsError(
						configurationList.concat(['name']),
					);
					if (Object.values(errors.configuration).filter(error => error).length || errors.name) {
						selectedItem.setErrors(true);
					} else {
						selectedItem.setErrors(false);
					}
					this.canvasRef.canvas.renderAll();
				}, 0);
				const configuration = Object.assign({}, selectedItem.configuration, changedValues.configuration);
				this.canvasRef.handler.setObject({
					configuration,
					name: allValues.name,
					description: allValues.description,
				});
				selectedItem.label.set({
					text: getEllipsis(allValues.name, 18),
				});
				if (selectedItem.descriptor.outPortType === OUT_PORT_TYPE.DYNAMIC) {
					this.canvasRef.handler.portHandler.recreate(selectedItem);
				}
			}
		},
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

	changeEditing = editing => {
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
					tooltipTitle={i18n.t('action.download')}
					onClick={onDownload}
					tooltipPlacement="bottomRight"
				/>
				{editing ? (
					<Popconfirm
						title={i18n.t('workflow.workflow-editing-confirm')}
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
			</React.Fragment>
		);
		const titleContent = (
			<React.Fragment>
				<span>{i18n.t('workflow.workflow-editor')}</span>
				<span style={{ width: 40, textAlign: 'center' }}>/</span>
				<span style={{ color: workflow.enabled ? '#49a9ee' : 'rgba(0, 0, 0, 0.65)' }}>{workflow.name}</span>
			</React.Fragment>
		);
		const title = <WorkflowTitle title={titleContent} action={action} />;
		const content = (
			<div className="rde-editor">
				<WorkflowItems canvasRef={this.canvasRef} descriptors={descriptors} />
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
						className="rde-canvas"
						fabricObjects={{ ...nodes, ...Links }}
						workareaOption={{
							width: 0,
							height: 0,
						}}
						gridOption={{ enabled: true, grid: 20, snapToGrid: true }}
						activeSelectionOption={{
							hasControls: false,
							hasBorders: false,
							perPixelTargetFind: true,
						}}
						minZoom={50}
						maxZoom={150}
						onZoom={onZoom}
						onSelect={onSelect}
						onAdd={onAdd}
						onRemove={onRemove}
						onModified={onModified}
						keyEvent={{ move: false, transaction: true, clipboard: true }}
					/>
					<div className="rde-editor-properties" style={{ display: selectedItem ? 'block' : 'none' }}>
						<WorkflowNodeConfigurations
							wrappedComponentRef={c => {
								this.nodeConfigurationRef = c;
							}}
							selectedItem={selectedItem}
							workflow={workflow}
							canvasRef={this.canvasRef}
							descriptors={descriptors}
							onChange={onChange}
						/>
					</div>
					<div className="rde-editor-toolbar">
						<WorkflowToolbar canvasRef={this.canvasRef} zoomRatio={zoomRatio} />
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
