import { Tabs } from 'antd';
import clsx from 'clsx';
import React from 'react';

import { CanvasInstance, FabricObject } from '../../canvas';
import CommonButton from '../../components/common/CommonButton';
import Icon from '../../components/icon/Icon';
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
	collapse?: boolean;
}

class ImageMapConfigurations extends React.Component<ImageMapConfigurationsProps, ImageMapConfigurationsState> {
	state: ImageMapConfigurationsState = {
		activeKey: 'map',
	};

	handlers = {
		onChangeTab: (activeKey: string) => {
			this.setState({
				activeKey,
			});
		},
		onCollapse: () => {
			this.setState(prevState => ({
				collapse: !prevState.collapse,
			}));
		},
	};

	render() {
		const { onChange, selectedItem, canvasRef, animations, styles, onChangeAnimations, onChangeStyles } =
			this.props;
		const { collapse, activeKey } = this.state;
		const { onChangeTab, onCollapse } = this.handlers;
		const className = clsx('rde-editor-configurations', {
			minimize: collapse,
		});

		return (
			<div className={className}>
				<CommonButton
					className="rde-action-btn"
					shape="circle"
					icon={collapse ? 'angle-double-left' : 'angle-double-right'}
					onClick={onCollapse}
					style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}
				/>
				<Tabs
					tabPlacement="end"
					style={{ height: '100%' }}
					activeKey={activeKey}
					onChange={onChangeTab}
					tabBarStyle={{ marginTop: 60 }}
					items={[
						{
							key: 'map',
							label: <Icon name="cog" />,
							children: <MapProperties onChange={onChange} canvasRef={canvasRef} />,
						},
						{
							key: 'node',
							label: <Icon name="cogs" />,
							children: (
								<NodeProperties onChange={onChange} selectedItem={selectedItem} canvasRef={canvasRef} />
							),
						},
						{
							key: 'animations',
							label: <Icon name="vine" prefix="fab" />,
							children: <Animations animations={animations} onChangeAnimations={onChangeAnimations} />,
						},
						{
							key: 'styles',
							label: <Icon name="star-half-alt" />,
							children: <Styles styles={styles} onChangeStyles={onChangeStyles} />,
						},
					]}
				/>
			</div>
		);
	}
}

export default ImageMapConfigurations;
