import React, { useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { Canvas } from '../../canvas';
import { CanvasInstance } from '../../canvas/Canvas';
import FiberHandler from '../../canvas/handlers/FiberHandler';
import { Content } from '../../components/layout';
import { CableSectionNode } from './node';

const FiberEditor = () => {
	const canvasRef = useRef<CanvasInstance | null>(null);
	const handleLoad = () => {
		canvasRef.current?.handler.add(
			{
				id: uuid(),
				type: 'cableNode',
				coreCount: 27,
				hasControls: false,
			},
			true,
		);
		canvasRef.current?.handler.registerHandler('fiber', FiberHandler) as FiberHandler;
	};
	return (
		<Content>
			<Canvas
				ref={canvasRef}
				onLoad={handleLoad}
				canvasOption={{ backgroundColor: '#272727', fireRightClick: true }}
				workareaOption={{ width: 0, height: 0 }}
				activeSelectionOption={{ hasControls: false, hasBorders: false }}
				fabricObjects={{
					cableNode: {
						create: options => new CableSectionNode(options) as any,
					},
				}}
			/>
		</Content>
	);
};

export default FiberEditor;
