import { Button, Scrollbar, ThemeContext } from '@flomon-ui/components';
import Icon from '@flomon-ui/icons';
import i18next from '@flomon-ui/locales';
import {
	CustomNodeOutputType,
	FlowEnvType,
	FlowNodeClass,
	FlowNodeType,
	getFlowColors,
	getFlowColorsByType,
	getNodeClass,
	IFlowNodeDescriptor,
} from '@flomon-ui/models';
import { extractDefaultsJsonSchema, parseBoolean, sessionStorage, simpleid } from '@flomon-ui/utils';
import { Collapse, Input, Popover } from 'antd';
import classnames from 'classnames';
import clsx from 'clsx';
import { fabric } from 'fabric';
import memoize from 'lodash/memoize';
import React, { Component } from 'react';
import { CanvasInstance, LinkObject } from 'react-design-editor';
import { connect, ConnectedProps } from 'react-redux';
import { AppRootState } from '../../reducers';

const mapStateToProps = (state: AppRootState) => ({
	flow: state.flow.flow,
	currentCustomOutputType: state.flow.currentCustomOutputType,
	selectedNode: state.flow.selectedNode,
});

const connector = connect(mapStateToProps);

type IProps = ConnectedProps<typeof connector> & {
	nodeDescriptors?: IFlowNodeDescriptor[];
	instance: CanvasInstance;
	nodeType: string;
};

interface IState {
	collapsed?: boolean;
	searchText: string;
	tooltipVisible: Record<string, boolean>;
}

class FlowItems extends Component<IProps, IState> {
	static contextType = ThemeContext;
	declare context: React.ContextType<typeof ThemeContext>;

	private item: IFlowNodeDescriptor;
	private intersectedLink: LinkObject;
	private colors = getFlowColors();
	private links: LinkObject[] = [];

	state: IState = {
		collapsed: parseBoolean(sessionStorage.read('flow.itemCollapsed')),
		searchText: '',
		tooltipVisible: {},
	};

	componentDidMount() {
		this.waitForCanvasRender(this.props.instance);
	}

	componentWillUnmount() {
		this.detachEventListener(this.props.instance);
	}

	onDragStart = (e: any, descriptor: IFlowNodeDescriptor) => {
		this.setState({
			tooltipVisible: Object.assign({}, this.state.tooltipVisible, {
				[descriptor.customNodeId || descriptor.nodeClazz]: false,
			}),
		});
		this.item = descriptor;
		const { target } = e;
		target.classList.add('dragging');
		this.links = this.props.instance.handler.getObjects().filter(obj => obj.type === 'link') as LinkObject[];
	};

	onDragOver = (e: DragEvent) => {
		if (e.preventDefault) {
			e.preventDefault();
		}
		e.dataTransfer.dropEffect = 'copy';
		if (this.item?.type !== FlowNodeType.TRIGGER) {
			const pointer = this.props.instance.canvas.getPointer(e);
			this.links.forEach(link => {
				const isIntersecting = link.isPointNear(new fabric.Point(pointer.x, pointer.y), 20);
				if (isIntersecting) {
					this.intersectedLink = link;
					link.setColor(this.colors.SELECTED_LINK.stroke);
					link.line.set({ strokeDashArray: [4, 4] });
				} else {
					if (this.intersectedLink?.id === link.id) {
						this.intersectedLink = undefined;
					}
					link.setColor(this.colors.LINK.stroke);
					link.line.set({ strokeDashArray: undefined });
				}
				this.props.instance.canvas.requestRenderAll();
			});
		}
		return false;
	};

	onDragEnter = (e: any) => {
		const { target } = e;
		target.classList.add('over');
	};

	onDragLeave = (e: any) => {
		const { target } = e;
		target.classList.remove('over');
	};

	onDrop = (e: any) => {
		e = e || window.event;
		if (e.preventDefault) {
			e.preventDefault();
		}
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		const dt = e.dataTransfer;
		if (dt.types.length && dt.types[0] === 'Files') {
			return false;
		}
		const { layerX, layerY } = e;
		const option = Object.assign({}, this.item, { left: layerX, top: layerY });
		this.handleAddItem(option, false);
		return false;
	};

	onDragEnd = (e: any) => {
		this.item = null;
		e.target.classList.remove('dragging');
	};

	attachEventListener = (canvasRef: CanvasInstance) => {
		canvasRef.canvas.wrapperEl.addEventListener('dragenter', this.onDragEnter, false);
		canvasRef.canvas.wrapperEl.addEventListener('dragover', this.onDragOver, false);
		canvasRef.canvas.wrapperEl.addEventListener('dragleave', this.onDragLeave, false);
		canvasRef.canvas.wrapperEl.addEventListener('drop', this.onDrop, false);
	};

	detachEventListener = (canvasRef: CanvasInstance) => {
		canvasRef.canvas.wrapperEl.removeEventListener('dragenter', this.onDragEnter);
		canvasRef.canvas.wrapperEl.removeEventListener('dragover', this.onDragOver);
		canvasRef.canvas.wrapperEl.removeEventListener('dragleave', this.onDragLeave);
		canvasRef.canvas.wrapperEl.removeEventListener('drop', this.onDrop);
	};

	waitForCanvasRender = (canvasRef: CanvasInstance) => {
		setTimeout(() => {
			if (canvasRef) {
				this.attachEventListener(canvasRef);
				return;
			}
			this.waitForCanvasRender(this.props.instance);
		}, 5);
	};

	convertToObject = (searchText?: string) => {
		const { nodeDescriptors } = this.props;
		const search = searchText?.toLowerCase();
		return nodeDescriptors
			.filter(
				descriptor =>
					i18next
						.t(`flow.node-title.${getNodeClass(descriptor.nodeClazz)}`)
						.toLowerCase()
						.includes(search) || descriptor.name.toLowerCase().includes(search),
			)
			.reduce(
				(prev, curr) => {
					if (prev[curr.type]) {
						return Object.assign(prev, { [curr.type]: prev[curr.type].concat(curr) });
					}
					return Object.assign(prev, { [curr.type]: [curr] });
				},
				{} as { [key: string]: IFlowNodeDescriptor[] },
			);
	};

	filteredNode = (descriptor: IFlowNodeDescriptor) => {
		const nodeClazz = getNodeClass(descriptor.nodeClazz);
		switch (nodeClazz) {
			case FlowNodeClass.LoopTriggerNode:
				return false;
			case FlowNodeClass.CustomTriggerNode:
				return false;
			case FlowNodeClass.CustomOutputFalseNode:
			case FlowNodeClass.CustomOutputTrueNode: {
				if (
					this.props.currentCustomOutputType === CustomNodeOutputType.SINGLE ||
					this.props.currentCustomOutputType === CustomNodeOutputType.NONE
				) {
					return false;
				}
				return true;
			}
			case FlowNodeClass.CustomOutputNode: {
				if (this.props.currentCustomOutputType === CustomNodeOutputType.BRANCH) {
					return false;
				}
			}
			default:
				return true;
		}
	};

	handleAddItem = (descriptor?: IFlowNodeDescriptor & { left?: number; top?: number }, centered?: boolean) => {
		const { instance } = this.props;
		const type = getNodeClass(descriptor.nodeClazz);
		if (instance.handler.interactionMode === 'selection') {
			const id = simpleid();
			const option = Object.assign({}, descriptor, {
				id,
				type,
				configuration:
					descriptor.defaultConfiguration ||
					(descriptor.customNodeId
						? {
								customNodeId: descriptor.customNodeId,
								userInput: extractDefaultsJsonSchema(descriptor.inputSchema),
							}
						: {}),
				description: '',
				name: descriptor.customNodeId ? descriptor.name : i18next.t(`flow.node-title.${type}`),
				customNodeId: descriptor.customNodeId,
				descriptor,
			});
			instance.handler
				.getObjects()
				.filter(obj => obj.type === 'link')
				.forEach(link => {
					link.set({ stroke: this.colors.LINK.stroke, strokeDashArray: undefined });
					instance.canvas.requestRenderAll();
				});
			if (this.intersectedLink) {
				const createdNode = instance.handler.add(option, false, false, false, false);
				if (this.intersectedLink?.fromNode && this.intersectedLink?.toNode) {
					instance.handler.linkHandler.create({
						type: 'link',
						fromNodeId: this.intersectedLink.fromNodeId,
						fromPortId: this.intersectedLink.fromPortId,
						toNodeId: createdNode.id,
					});
					instance.handler.linkHandler.create({
						type: 'link',
						fromNodeId: createdNode.id,
						fromPortId: createdNode.fromPort?.[0].id,
						toNodeId: this.intersectedLink.toNodeId,
					});
					instance.handler.linkHandler.remove(this.intersectedLink);
				}
			} else {
				const selectedNode = this.props.selectedNode;
				const unusedFromPort = selectedNode?.fromPort
					? selectedNode?.fromPort?.find(port => !port.links.length)
					: undefined;
				if (descriptor.type !== FlowNodeType.TRIGGER && unusedFromPort) {
					const createdNode = !centered
						? instance.handler.add(option, false, false, false, false)
						: instance.handler.add(
								{ ...option, left: selectedNode.left, top: selectedNode.top },
								false,
								false,
								false,
								false,
							);
					instance.handler.linkHandler.create({
						type: 'link',
						fromNodeId: selectedNode.id,
						fromPortId: unusedFromPort.id,
						toNodeId: createdNode.id,
					});
					if (centered) {
						createdNode.set({
							left: selectedNode.left + (selectedNode.width - createdNode.width) / 2,
							top: selectedNode.height + selectedNode.top + 40,
						});
						instance.handler.portHandler.setCoords(createdNode as any);
						instance.handler.zoomHandler.zoomToCenterWithObject(createdNode);
					}
				} else {
					const createdNode = instance.handler.add(option, false, false, false, false);
					if (centered) {
						createdNode.set({
							left:
								(instance.canvas.getWidth() / 2 - instance.canvas.viewportTransform[4]) /
								instance.canvas.getZoom(),
							top:
								(instance.canvas.getHeight() / 2 - instance.canvas.viewportTransform[5]) /
								instance.canvas.getZoom(),
						});
						instance.handler.portHandler.setCoords(createdNode as any);
						instance.handler.zoomHandler.zoomToCenterWithObject(createdNode);
						createdNode.setCoords();
					}
				}
			}
			this.intersectedLink = undefined;
			instance.handler.transactionHandler.save('add');
			instance.canvas.requestRenderAll();
		}
	};

	handleItemsCollapse = () => {
		sessionStorage.write('flow.itemCollapsed', `${!this.state.collapsed}`);
		this.setState({
			collapsed: !this.state.collapsed,
		});
	};

	handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ searchText: e.target.value });
	};

	renderItem = (descriptor: IFlowNodeDescriptor, collapsed: boolean) => {
		const colors = getFlowColorsByType(descriptor.type);
		const isSelf = descriptor.deprecated || descriptor.customNodeId === this.props.flow?.id;
		const name = descriptor.customNodeId
			? descriptor.name
			: i18next.t(`flow.node-title.${getNodeClass(descriptor.nodeClazz)}`);
		const desc = descriptor.customNodeId
			? descriptor.description || descriptor.name
			: i18next.t(`flow.node-desc.${getNodeClass(descriptor.nodeClazz)}`);
		return this.filteredNode(descriptor) ? (
			<Popover
				key={descriptor.customNodeId || descriptor.nodeClazz}
				title={name}
				content={desc}
				placement="right"
				visible={this.state.tooltipVisible[descriptor.customNodeId || descriptor.nodeClazz]}
				onVisibleChange={visible =>
					this.setState({
						tooltipVisible: Object.assign({}, this.state.tooltipVisible, {
							[descriptor.customNodeId || descriptor.nodeClazz]: visible,
						}),
					})
				}
			>
				<div
					draggable={!isSelf}
					className={clsx('fui-flow-editor-items-list-item', {
						disabled: isSelf,
					})}
					onDragStart={e => (isSelf ? void 0 : this.onDragStart(e, descriptor))}
					onDragEnd={e => (isSelf ? void 0 : this.onDragEnd(e))}
					onClick={() => (isSelf ? void 0 : this.handleAddItem(descriptor, true))}
				>
					<div
						className="fui-flow-item-director"
						style={
							colors.stroke?.includes('gradient')
								? { backgroundImage: colors.stroke }
								: { backgroundColor: colors.stroke }
						}
					/>
					<div className="fui-flow-item-icon">
						<Icon name={descriptor.icon} color={colors.fill} />
					</div>
					{!collapsed && <div className="fui-flow-item-text">{name}</div>}
					{descriptor.deprecated && (
						<div className="fui-flow-item-extra-icon">
							<Icon name="exclamation-triangle" />
						</div>
					)}
					{descriptor.customNodeId && (
						<div className="fui-flow-item-extra-icon">
							<Icon name="sliders" />
						</div>
					)}
				</div>
			</Popover>
		) : null;
	};

	renderList = (nodeDescriptors: { [key: string]: IFlowNodeDescriptor[] }, collapsed: boolean) => {
		const { nodeType, flow } = this.props;
		const nodeTypes = Object.keys(nodeDescriptors).filter(key => {
			if (nodeType && nodeType === FlowNodeType.LOOP && key === FlowNodeType.TRIGGER) {
				return false;
			} else if (key === FlowNodeType.CUSTOM && flow?.envType === FlowEnvType.CUSTOM_NODE) {
				return false;
			}
			return key !== FlowNodeType.LOOP;
		});
		if (nodeType === FlowNodeType.LOOP) {
			nodeTypes.unshift(nodeType);
		} else if (flow?.envType === FlowEnvType.CUSTOM_NODE) {
			nodeTypes.unshift(FlowNodeType.CUSTOM);
		}
		return (
			<Collapse bordered={false} defaultActiveKey={Object.keys(FlowNodeType)}>
				{nodeTypes.map(key => {
					return (
						<Collapse.Panel
							showArrow={false}
							key={key}
							header={!collapsed && i18next.t(`flow.${key.toLowerCase()}`)}
						>
							{nodeDescriptors[key]
								?.filter(descriptor => !descriptor.deprecated)
								.map(descriptor => this.renderItem(descriptor, collapsed))}
						</Collapse.Panel>
					);
				})}
			</Collapse>
		);
	};

	render() {
		const { collapsed, searchText } = this.state;
		const itemsClassName = classnames('fui-flow-editor-items', {
			minimize: collapsed,
		});
		const memoizedDescriptors = memoize(this.convertToObject)(searchText);
		return (
			<div className={itemsClassName}>
				<div className="fui-flow-editor-items-action">
					{!collapsed && (
						<Input
							value={searchText}
							onChange={this.handleSearch}
							placeholder={i18next.t('placeholder.search-name')}
						/>
					)}
					<Button onClick={this.handleItemsCollapse} icon={collapsed ? 'indent' : 'dedent'} />
				</div>
				<div className="fui-flow-editor-items-list">
					<Scrollbar>{this.renderList(memoizedDescriptors, collapsed)}</Scrollbar>
				</div>
			</div>
		);
	}
}

export default connector(FlowItems);
