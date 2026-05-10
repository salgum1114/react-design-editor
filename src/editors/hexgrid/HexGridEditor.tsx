import { fabric } from 'fabric';
import { defineGrid, extendHex } from 'honeycomb-grid';
import React, { useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { Canvas, Handler } from '../../canvas';
import { CanvasInstance } from '../../canvas/Canvas';
import { Content } from '../../components/layout';

class Hexagon extends fabric.Polygon {
	superType = 'shape';
	editable = false;

	constructor(points: any, option: any = {}) {
		super(points, { ...option, type: option.type ?? 'polygon' });
	}
}

const HexGridEditor = () => {
	const canvasRef = useRef<CanvasInstance | null>(null);
	const handleLoad = (handler: Handler) => {
		const size = 20;
		const Hex = extendHex({
			size,
		});
		const Grid = defineGrid(Hex);
		const corners = Grid.rectangle({ width: 10, height: 10 }).map(hex => {
			const point = hex.toPoint();
			const corners = hex.corners().map(corner => corner.add(point));
			return corners;
		});
		const group = {
			id: uuid(),
			type: 'group',
			objects: corners.map(
				cs =>
					new fabric.Polygon(cs, {
						type: 'polygon',
						originX: 'center',
						originY: 'center',
						fill: 'rgba(153, 153, 153, 0.5)',
						borderColor: '#999',
					}),
			),
		};
		const createdObj = handler.add(group, false, true);
		handler.centerObject(createdObj, true);
	};
	return (
		<Content>
			<Canvas
				ref={canvasRef}
				editable={false}
				onLoad={handleLoad}
				activeSelectionOption={{
					hasControls: false,
				}}
				fabricObjects={{
					hexagon: {
						create: ({ points, ...other }) => new Hexagon(points, other) as any,
					},
				}}
				canvasOption={{
					backgroundColor: '#434f5a',
				}}
			/>
		</Content>
	);
};

export default HexGridEditor;
