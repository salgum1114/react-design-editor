import React, { useRef } from 'react';
import { uuid } from 'uuidv4';
import { Canvas, FiberHandler } from '../../canvas';
import { CanvasInstance } from '../../canvas/Canvas';
import { Content } from '../../components/layout';
import { CableSectionNode } from './node';

const FiberEditor = () => {
	const canvasRef = useRef<CanvasInstance>();
	const handleLoad = () => {
		const createdObj = canvasRef.current.handler.add(
			{
				id: uuid(),
				type: 'cableNode',
				coreCount: 27,
				hasControls: false,
			},
			true,
		);
		const fiberHandler = canvasRef.current.handler.registerHandler('fiber', FiberHandler) as FiberHandler;
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
						create: options => new CableSectionNode(options),
					},
				}}
			/>
		</Content>
	);
};

export default FiberEditor;
