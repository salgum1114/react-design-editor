import { Tabs } from 'antd';
import React from 'react';

import { CanvasInstance, FabricObject } from '../../canvas';
import { EditorPanelHeader } from '../../components/editor';
import Animations from './animations/Animations';
import MapProperties from './properties/MapProperties';
import NodeProperties from './properties/NodeProperties';
import Styles from './styles/Styles';

interface ImageMapConfigurationsProps {
	canvasRef?: CanvasInstance;
	selectedItem?: FabricObject;
	onChange?: (selectedItem: FabricObject | undefined, changedValues: any, allValues: any) => void;
	onChangeAnimations?: (animations: any[]) => void;
	onChangeStyles?: (styles: any[]) => void;
	onChangeDataSources?: (dataSources: any[]) => void;
	animations?: any[];
	styles?: any[];
	dataSources?: any[];
}

interface ImageMapConfigurationsState {
	activeKey: string;
}

class ImageMapConfigurations extends React.Component<ImageMapConfigurationsProps, ImageMapConfigurationsState> {
	state: ImageMapConfigurationsState = {
		activeKey: 'map',
	};

	componentDidUpdate(prevProps: ImageMapConfigurationsProps) {
		const previousId = prevProps.selectedItem?.id;
		const selectedId = this.props.selectedItem?.id;

		if (selectedId && selectedId !== previousId && this.state.activeKey !== 'node') {
			this.setState({ activeKey: 'node' });
		} else if (!selectedId && previousId && this.state.activeKey === 'node') {
			this.setState({ activeKey: 'map' });
		}
	}

	handlers = {
		onChangeTab: (activeKey: string) => {
			this.setState({
				activeKey,
			});
		},
	};

	render() {
		const { onChange, selectedItem, canvasRef, animations, styles, onChangeAnimations, onChangeStyles } =
			this.props;
		const { activeKey } = this.state;
		const { onChangeTab } = this.handlers;

		return (
			<div className="rde-editor-configurations rde-imagemap-configurations">
				<EditorPanelHeader
					eyebrow={selectedItem ? 'Selection' : 'Image map'}
					title={selectedItem?.name || selectedItem?.type || 'Map settings'}
					description={selectedItem ? 'Object properties and interaction' : 'Canvas and document properties'}
				/>
				<Tabs
					tabPlacement="top"
					className="rde-inspector-tabs"
					activeKey={activeKey}
					onChange={onChangeTab}
					items={[
						{
							key: 'map',
							label: 'Map',
							children: <MapProperties onChange={onChange} canvasRef={canvasRef} />,
						},
						{
							key: 'node',
							label: 'Object',
							children: (
								<NodeProperties onChange={onChange} selectedItem={selectedItem} canvasRef={canvasRef} />
							),
						},
						{
							key: 'animations',
							label: 'Animation',
							children: <Animations animations={animations} onChangeAnimations={onChangeAnimations} />,
						},
						{
							key: 'styles',
							label: 'Styles',
							children: <Styles styles={styles} onChangeStyles={onChangeStyles} />,
						},
					]}
				/>
			</div>
		);
	}
}

export default ImageMapConfigurations;
