import React, { useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import { extendHex, defineGrid } from 'honeycomb-grid';
import { v4 } from 'uuid';

import { Container } from '../common';
import { Canvas, Handler } from '../canvas';

const Hexagon = fabric.util.createClass(fabric.Polygon, {
	type: 'polygon',
	superType: 'shape',
	editable: false,
	initialize(points: fabric.Point, option: fabric.Polygon) {
		this.callSuper('initialize', points, option);
	},
	_render(ctx: CanvasRenderingContext2D) {
		this.callSuper('_render', ctx);
	},
});

const HexGrid = () => {
	const canvasRef = useRef<Canvas>();
	const handleLoad = (handler: Handler, canvas: fabric.Canvas) => {
		const size = 20;
		const Hex = extendHex({
			size,
		});
		const Grid = defineGrid(Hex);
		const corners = Grid.rectangle({ width: 10, height: 10 }).map(hex => {
			const point = hex.toPoint();
			const corners = hex.corners().map(corner => corner.add(point));
			return corners;
			// handler.add(
			// 	{
			// 		type: 'hexagon',
			// 		originX: 'center',
			// 		originY: 'center',
			// 		fill: 'rgba(153, 153, 153, 0.5)',
			// 		borderColor: '#999999',
			// 		points: corners,
			// 	},
			// 	false,
			// 	false,
			// 	false,
			// );
		});
		const group = {
			id: v4(),
			type: 'group',
			objects: corners.map(
				cs =>
					new fabric.Polygon(cs, {
						type: 'polygon',
						originX: 'center',
						originY: 'center',
						fill: 'rgba(153, 153, 153, 0.5)',
						borderColor: '#999999',
					}),
			),
		};
		const createdObj = handler.add(group, false, false, false);
		handler.centerObject(createdObj, true);
		handler.toActiveSelection(createdObj);
	};
	return (
		<Container>
			<Canvas
				ref={canvasRef}
				editable={false}
				onLoad={handleLoad}
				fabricObjects={{
					hexagon: {
						create: ({ points, ...other }) => new Hexagon(points, other),
					},
				}}
				canvasOption={{
					backgroundColor: '#434f5a',
				}}
			/>
		</Container>
	);
};

export default HexGrid;
