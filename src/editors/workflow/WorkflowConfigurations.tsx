import { Tabs } from 'antd';
import React from 'react';
import { CanvasInstance, FabricObject } from '../../canvas';
import { EditorPanelHeader } from '../../components/editor';
import WorkflowGlobalParameters from './WorkflowGlobalParameters';
import WorkflowInfo from './WorkflowInfo';

interface IProps {
	canvasRef?: CanvasInstance;
	selectedItem?: FabricObject;
	workflow?: FabricObject;
	onChange?: (...args: any[]) => void;
}

interface IState {
	activeKey: string;
}

class WorkflowConfigurations extends React.Component<IProps, IState> {
	state: IState = {
		activeKey: 'info',
	};

	handlers = {
		onChange: (activeKey: string) => {
			this.setState({
				activeKey,
			});
		},
	};

	render() {
		const { workflow, onChange } = this.props;
		const { activeKey } = this.state;
		return (
			<div className="rde-editor-configurations rde-workflow-configurations">
				<EditorPanelHeader
					eyebrow="Workflow"
					title="Workflow settings"
					description="Metadata and reusable variables"
				/>
				<Tabs
					tabPlacement="top"
					activeKey={activeKey}
					onChange={this.handlers.onChange}
					className="rde-inspector-tabs"
					items={[
						{
							key: 'info',
							label: 'General',
							children: <WorkflowInfo workflow={workflow} onChange={onChange} />,
						},
						{
							key: 'variables',
							label: 'Variables',
							children: <WorkflowGlobalParameters workflow={workflow} onChange={onChange} />,
						},
					]}
				/>
			</div>
		);
	}
}

export default WorkflowConfigurations;
