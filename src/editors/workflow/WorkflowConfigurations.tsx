import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';
import classnames from 'classnames';
import WorkflowInfo from './WorkflowInfo';
import WorkflowGlobalParameters from './WorkflowGlobalParameters';
import { Canvas, FabricObject } from '../../canvas';
import { CommonButton } from '../../components/common';
import Icon from '../../components/icon/Icon';

interface IProps {
	canvasRef?: Canvas;
	selectedItem?: FabricObject;
	workflow?: FabricObject;
	onChange?: any;
}

class WorkflowConfigurations extends Component<IProps> {
	static propTypes;

	state = {
		collapse: false,
		activeKey: 'info',
	};

	handlers = {
		onCollapse: () => {
			this.setState({
				collapse: !this.state.collapse,
			});
		},
		onChange: activeKey => {
			this.setState({
				activeKey,
			});
		},
	};

	render() {
		const className = classnames('rde-editor-configurations', {
			minimize: this.state.collapse,
		});
		return (
			<div className={className}>
				<CommonButton
					className="rde-action-btn"
					shape="circle"
					icon={this.state.collapse ? 'angle-double-left' : 'angle-double-right'}
					onClick={this.handlers.onCollapse}
					style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}
				/>
				<Tabs
					tabPosition="right"
					activeKey={this.state.activeKey}
					onChange={this.handlers.onChange}
					style={{ height: '100%' }}
					tabBarStyle={{ marginTop: 60 }}
				>
					<Tabs.TabPane tab={<Icon name="cog" />} key="info">
						<WorkflowInfo workflow={this.props.workflow} onChange={this.props.onChange} />
					</Tabs.TabPane>
					<Tabs.TabPane tab={<Icon name="globe" />} key="variables">
						<WorkflowGlobalParameters workflow={this.props.workflow} onChange={this.props.onChange} />
					</Tabs.TabPane>
				</Tabs>
			</div>
		);
	}
}

export default WorkflowConfigurations;
