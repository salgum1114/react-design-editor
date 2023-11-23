import color from 'color';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { FlowItems, FlowSettings, FlowToolbar } from '.';
import { Canvas, CanvasInstance } from '../../canvas';
import { NodeObject } from '../../canvas/objects/Node';
import { Content } from '../../components/layout';
import { FlowContext } from '../../contexts';
import Descriptors from '../workflow/Descriptors.json';
import Links from './link';
import Nodes from './node';

import './style/index.less';

const nodes = Nodes(Descriptors);

const FlowEditor = () => {
	const canvasRef = useRef<CanvasInstance>();
	const { setSelectedFlowNode } = useContext(FlowContext);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		setLoading(false);
	}, []);
	const handleSelect = (target: NodeObject) => {
		if (target && target.superType === 'node') {
			setSelectedFlowNode(target);
		} else {
			setSelectedFlowNode(null);
		}
	};
	const handleAdd = (target: NodeObject) => {
		if (target.superType === 'node') {
			canvasRef.current.handler.nodeHandler.highlightingNode(target, 100);
		}
	};
	return (
		<Content className="" loading={loading}>
			<div className="flow-editor">
				<div className="flow-editor-left">
					<FlowItems canvas={canvasRef.current} />
				</div>
				<div className="flow-editor-content">
					<div className="flow-editor-canvas">
						<Canvas
							ref={canvasRef}
							fabricObjects={{ ...nodes, ...Links }}
							canvasOption={{
								backgroundColor: '#434f5a',
							}}
							workareaOption={{
								width: 0,
								height: 0,
							}}
							activeSelectionOption={{
								hasBorders: false,
								hasControls: false,
								perPixelTargetFind: true,
							}}
							gridOption={{
								enabled: true,
								snapToGrid: true,
								grid: 20,
								lineColor: color('#434f5a')
									.lighten(0.2)
									.toString(),
								borderColor: color('#434f5a')
									.lighten(0.2)
									.toString(),
							}}
							onSelect={handleSelect}
							onAdd={handleAdd}
						/>
					</div>
					<div className="flow-editor-toolbar">
						<FlowToolbar />
					</div>
				</div>
				<div className="flow-editor-right">
					<FlowSettings canvas={canvasRef.current} />
				</div>
			</div>
		</Content>
	);
};

export default FlowEditor;
