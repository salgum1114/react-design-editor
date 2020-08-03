import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse, Input, Button } from 'antd';
import { v4 } from 'uuid';
import i18n from 'i18next';
import classnames from 'classnames';

import Icon from '../icon/Icon';
import { NODE_COLORS } from './constant/constants';
import { Flex } from '../flex';
import { getNode } from './configuration/NodeConfiguration';
import Scrollbar from '../common/Scrollbar';
import CommonButton from '../common/CommonButton';

class WorkflowItems extends Component {
	static propTypes = {
		canvasRef: PropTypes.any,
		descriptors: PropTypes.object,
	};

	state = {
		activeKey: [],
		collapse: false,
		textSearch: '',
		descriptors: {},
		filteredDescriptors: [],
	};

	componentDidMount() {
		const { canvasRef } = this.props;
		this.waitForCanvasRender(canvasRef);
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
		const { canvasRef } = this.props;
		this.detachEventListener(canvasRef);
	}

	handlers = {
		onAddItem: (item, centered) => {
			const { canvasRef } = this.props;
			const id = v4();
			const option = Object.assign({}, item, {
				id,
				subType: item.type,
				type: getNode(item.nodeClazz),
				configuration: item.defaultConfiguration,
				description: '',
			});
			canvasRef.handler.add(option, centered);
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
		},
		onDragOver: e => {
			if (e.preventDefault) {
				e.preventDefault();
			}
			e.dataTransfer.dropEffect = 'copy';
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
			this.handlers.onAddItem(option, false);
			return false;
		},
		onDragEnd: e => {
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
			const { canvasRef } = this.props;
			this.waitForCanvasRender(canvasRef);
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
					draggable
					onClick={e => this.handlers.onAddItem(item)}
					onDragStart={e => this.events.onDragStart(e, item)}
					onDragEnd={e => this.events.onDragEnd(e, item)}
					className="rde-editor-items-item"
					style={{ justifyContent: this.state.collapse ? 'center' : null }}
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
								allowClear
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
