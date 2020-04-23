import React, { useRef, useContext, useState, useEffect } from 'react';
import color from 'color';

import Container from '../common/Container';
import { FlowItems, FlowSettings, FlowToolbar } from '.';
import { Canvas } from '../canvas';
import { FlowContext } from '../../contexts';
import { NodeObject } from '../canvas/objects/Node';
import Nodes from './node';
import Links from './link';
import Descriptors from '../workflow/Descriptors.json';

const nodes = Nodes(Descriptors);

import './style/index.less';

const FlowEditor = () => {
	const canvasRef = useRef<Canvas>();
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
	console.log(canvasRef);
	return (
		<Container className="" loading={loading}>
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
							activeSelection={{
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
		</Container>
	);
};

export default FlowEditor;
