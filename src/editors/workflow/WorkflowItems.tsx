import { Collapse, Input } from 'antd';
import classnames from 'classnames';
import { fabric } from 'fabric';
import i18n from 'i18next';
import PropTypes from 'prop-types';
import React from 'react';
import { v4 as uuid } from 'uuid';
import { CanvasInstance, FabricObject, LinkObject, NodeObject } from '../../canvas';
import { CommonButton, Scrollbar } from '../../components/common';
import { Flex } from '../../components/flex';
import Icon from '../../components/icon/Icon';
import { getNode } from './configuration/NodeConfiguration';
import { NODE_COLORS } from './constant/constants';

interface IProps {
	instance: CanvasInstance;
	descriptors: any[];
	selectedItem?: FabricObject;
}

class WorkflowItems extends React.Component<IProps> {
	static propTypes = {
		canvasRef: PropTypes.any,
		descriptors: PropTypes.object,
	};

	state = {
		activeKey: [],
		collapse: false,
		textSearch: '',
		descriptors: [],
		filteredDescriptors: [],
	};

	private item: any;
	private intersectedLink?: LinkObject;
	private links: LinkObject[] = [];

	componentDidMount() {
		const { instance } = this.props;
		this.waitForCanvasRender(instance);
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (JSON.stringify(this.props.descriptors) !== JSON.stringify(nextProps.descriptors)) {
			const descriptors = Object.keys(nextProps.descriptors).reduce((prev, key) => {
				return prev.concat(nextProps.descriptors[key]);
			}, []);
			this.setState({
				descriptors,
			});
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (JSON.stringify(this.props.descriptors) !== JSON.stringify(nextProps.descriptors)) {
			return true;
		} else if (JSON.stringify(this.state.filteredDescriptors) !== JSON.stringify(nextState.filteredDescriptors)) {
			return true;
		} else if (this.state.textSearch !== nextState.textSearch) {
			return true;
		} else if (JSON.stringify(this.state.activeKey) !== JSON.stringify(nextState.activeKey)) {
			return true;
		} else if (this.state.collapse !== nextState.collapse) {
			return true;
		}
		return false;
	}

	componentWillUnmount() {
		const { instance } = this.props;
		this.detachEventListener(instance);
	}

	handlers = {
		addItem: (item, centered?: boolean) => {
			const { instance } = this.props;
			const id = uuid();
			const option = Object.assign({}, item, {
				id,
				subType: item.type,
				superType: 'node',
				type: getNode(item.nodeClazz),
				configuration: item.defaultConfiguration,
				description: '',
				color: NODE_COLORS[item.type].fill,
			});
			instance.handler
				.getObjects()
				.filter(obj => obj.type === 'link')
				.forEach(link => {
					link.setColor(link.originStroke || '#999');
					link.set({ strokeDashArray: undefined });
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
				const selectedNode = this.props.selectedItem as NodeObject;
				const unusedFromPort = selectedNode?.fromPort
					? selectedNode?.fromPort?.find(port => !port.links!.length)
					: undefined;
				if (item.type !== 'TRIGGER' && unusedFromPort) {
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
							left: selectedNode.left! + (selectedNode.width! - createdNode.width) / 2,
							top: selectedNode.height! + selectedNode.top! + 40,
						});
						instance.handler.portHandler.setCoords(createdNode as any);
						instance.handler.zoomHandler.zoomToCenterWithObject(createdNode);
					}
				} else {
					const createdNode = instance.handler.add(option, false, false, false, false);
					if (centered) {
						createdNode.set({
							left:
								(instance.canvas.getWidth() / 2 - instance.canvas.viewportTransform![4]) /
								instance.canvas.getZoom(),
							top:
								(instance.canvas.getHeight() / 2 - instance.canvas.viewportTransform![5]) /
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
		},
		onChangeActiveKey: activeKey => {
			this.setState({
				activeKey,
			});
		},
		onCollapse: () => {
			this.setState({
				collapse: !this.state.collapse,
			});
		},
		onSearchNode: e => {
			const { descriptors } = this.state;
			const filteredDescriptors = descriptors.filter(descriptor =>
				descriptor.name.toLowerCase().includes(e.target.value.toLowerCase()),
			);
			this.setState({
				textSearch: e.target.value,
				filteredDescriptors,
			});
		},
	};

	events = {
		onDragStart: (e, item) => {
			this.item = item;
			const { target } = e;
			target.classList.add('dragging');
			this.links = this.props.instance.handler.getObjects().filter(obj => obj.type === 'link') as LinkObject[];
		},
		onDragOver: e => {
			if (e.preventDefault) {
				e.preventDefault();
			}
			e.dataTransfer.dropEffect = 'copy';
			if (this.item?.type !== 'TRIGGER') {
				const pointer = this.props.instance.canvas.getPointer(e);
				this.links.forEach(link => {
					const isIntersecting = link.isPointNear(new fabric.Point(pointer.x, pointer.y), 20);
					if (isIntersecting) {
						this.intersectedLink = link;
						link.setColor(link.selectedStroke || 'green');
						link.line.set({ strokeDashArray: [4, 4] });
					} else {
						if (this.intersectedLink?.id === link.id) {
							this.intersectedLink = undefined;
						}
						link.setColor(link.originStroke || '#999');
						link.line.set({ strokeDashArray: undefined });
					}
					this.props.instance.canvas.requestRenderAll();
				});
			}
			return false;
		},
		onDragEnter: e => {
			const { target } = e;
			target.classList.add('over');
		},
		onDragLeave: e => {
			const { target } = e;
			target.classList.remove('over');
		},
		onDrop: e => {
			e = e || window.event;
			if (e.preventDefault) {
				e.preventDefault();
			}
			if (e.stopPropagation) {
				e.stopPropagation();
			}
			const { layerX, layerY } = e;
			const option = Object.assign({}, this.item, { left: layerX, top: layerY });
			this.handlers.addItem(option, false);
			return false;
		},
		onDragEnd: (e: any, item?: any) => {
			this.item = null;
			e.target.classList.remove('dragging');
		},
	};

	waitForCanvasRender = canvas => {
		setTimeout(() => {
			if (canvas) {
				this.attachEventListener(canvas);
				return;
			}
			const { instance } = this.props;
			this.waitForCanvasRender(instance);
		}, 5);
	};

	attachEventListener = canvasRef => {
		canvasRef.canvas.wrapperEl.addEventListener('dragenter', this.events.onDragEnter, false);
		canvasRef.canvas.wrapperEl.addEventListener('dragover', this.events.onDragOver, false);
		canvasRef.canvas.wrapperEl.addEventListener('dragleave', this.events.onDragLeave, false);
		canvasRef.canvas.wrapperEl.addEventListener('drop', this.events.onDrop, false);
	};

	detachEventListener = canvasRef => {
		canvasRef.canvas.wrapperEl.removeEventListener('dragenter', this.events.onDragEnter);
		canvasRef.canvas.wrapperEl.removeEventListener('dragover', this.events.onDragOver);
		canvasRef.canvas.wrapperEl.removeEventListener('dragleave', this.events.onDragLeave);
		canvasRef.canvas.wrapperEl.removeEventListener('drop', this.events.onDrop);
	};

	renderItems = items => (
		<Flex flexWrap="wrap" flexDirection="column" style={{ width: '100%' }}>
			{items.map(item => (
				<div
					key={item.name}
					draggable={true}
					onClick={e => this.handlers.addItem(item, true)}
					onDragStart={e => this.events.onDragStart(e, item)}
					onDragEnd={e => this.events.onDragEnd(e, item)}
					className="rde-editor-items-item"
					style={{ justifyContent: this.state.collapse ? 'center' : undefined }}
				>
					<span className="rde-editor-items-item-icon">
						<Icon
							name={item.icon && item.icon.length ? item.icon : 'image'}
							color={NODE_COLORS[item.type].fill}
						/>
					</span>
					{this.state.collapse ? null : <span className="rde-editor-items-item-text">{item.name}</span>}
				</div>
			))}
		</Flex>
	);

	render() {
		const { descriptors } = this.props;
		const { activeKey, filteredDescriptors, collapse, textSearch } = this.state;
		const className = classnames('rde-editor-items', {
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
							onClick={this.handlers.onCollapse}
						/>
						{collapse ? null : (
							<Input
								style={{ margin: '8px' }}
								placeholder={i18n.t('action.search-list')}
								onChange={this.handlers.onSearchNode}
								value={textSearch}
								allowClear={true}
							/>
						)}
					</Flex>
					<Scrollbar>
						<Flex flex="1" style={{ overflowY: 'hidden' }}>
							{textSearch.length ? (
								this.renderItems(filteredDescriptors)
							) : (
								<Collapse
									style={{ width: '100%' }}
									activeKey={activeKey.length ? activeKey : Object.keys(descriptors)}
									onChange={this.handlers.onChangeActiveKey}
								>
									{Object.keys(descriptors).map(key => (
										<Collapse.Panel
											style={{ background: NODE_COLORS[key].fill }}
											key={key}
											header={collapse ? '' : key}
											showArrow={!collapse}
										>
											{this.renderItems(descriptors[key])}
										</Collapse.Panel>
									))}
								</Collapse>
							)}
						</Flex>
					</Scrollbar>
				</Flex>
			</div>
		);
	}
}

export default WorkflowItems;
