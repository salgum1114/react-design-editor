import { Tabs } from 'antd';
import clsx from 'clsx';
import React from 'react';
import { CanvasInstance, FabricObject } from '../../canvas';
import { CommonButton } from '../../components/common';
import Icon from '../../components/icon/Icon';
import WorkflowGlobalParameters from './WorkflowGlobalParameters';
import WorkflowInfo from './WorkflowInfo';

interface IProps {
	canvasRef?: CanvasInstance;
	selectedItem?: FabricObject;
	workflow?: FabricObject;
	onChange?: (...args: any[]) => void;
}

interface IState {
	collapse: boolean;
	activeKey: string;
}

class WorkflowConfigurations extends React.Component<IProps, IState> {
	state: IState = {
		collapse: false,
		activeKey: 'info',
	};

	handlers = {
		onCollapse: () => {
			this.setState(prevState => ({
				collapse: !prevState.collapse,
			}));
		},
		onChange: (activeKey: string) => {
			this.setState({
				activeKey,
			});
		},
	};

	render() {
		const { workflow, onChange } = this.props;
		const { collapse, activeKey } = this.state;
		const className = clsx('rde-editor-configurations', {
			minimize: collapse,
		});
		return (
			<div className={className}>
				<CommonButton
					className="rde-action-btn"
					shape="circle"
					icon={collapse ? 'angle-double-left' : 'angle-double-right'}
					onClick={this.handlers.onCollapse}
					style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}
				/>
				<Tabs
					tabPosition="right"
					activeKey={activeKey}
					onChange={this.handlers.onChange}
					style={{ height: '100%' }}
					tabBarStyle={{ marginTop: 60 }}
					items={[
						{
							key: 'info',
							label: <Icon name="cog" />,
							children: <WorkflowInfo workflow={workflow} onChange={onChange} />,
						},
						{
							key: 'variables',
							label: <Icon name="globe" />,
							children: <WorkflowGlobalParameters workflow={workflow} onChange={onChange} />,
						},
					]}
				/>
			</div>
		);
	}
}

export default WorkflowConfigurations;
