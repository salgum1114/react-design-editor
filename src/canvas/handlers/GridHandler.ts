import { fabric } from 'fabric';

import { FabricObject, GridOption } from '../models';
import { NodeObject } from '../objects/Node';
import AbstractHandler from './AbstractHandler';

class GridHandler extends AbstractHandler {
	constructor(handler: any) {
		super(handler);
		this.initialize();
	}

	/**
	 * Init grid
	 *
	 */
	public initialize = () => {
		const { type, grid, enabled } = this.handler.gridOption;
		if (enabled && grid) {
			if (type === 'line') {
				this.drawLine(this.handler.gridOption);
			} else {
				this.drawDot(this.handler.gridOption);
			}
		}
	};

	private drawLine = (option: GridOption) => {
		const { grid, lineColor, borderColor } = option;
		const patternCanvas = document.createElement('canvas');
		patternCanvas.width = grid * 5;
		patternCanvas.height = grid * 5;
		const ctx = patternCanvas.getContext('2d');
		if (!ctx) return;

		ctx.fillStyle = this.handler.canvasOption.backgroundColor as string;
		ctx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);

		ctx.strokeStyle = lineColor;
		ctx.lineWidth = 1;

		for (let i = 0; i <= 5; i++) {
			const pos = i * grid;

			// 세로 얇은 선
			ctx.beginPath();
			ctx.moveTo(pos, 0);
			ctx.lineTo(pos, patternCanvas.height);
			ctx.stroke();

			// 가로 얇은 선
			ctx.beginPath();
			ctx.moveTo(0, pos);
			ctx.lineTo(patternCanvas.width, pos);
			ctx.stroke();
		}

		ctx.strokeStyle = borderColor;

		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, patternCanvas.height);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(patternCanvas.width, 0);
		ctx.lineTo(patternCanvas.width, patternCanvas.height);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(patternCanvas.width, 0);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(0, patternCanvas.height);
		ctx.lineTo(patternCanvas.width, patternCanvas.height);
		ctx.stroke();

		const image = new Image();
		image.src = patternCanvas.toDataURL();
		const pattern = new fabric.Pattern({ source: image, repeat: 'repeat' });
		this.handler.canvas.setBackgroundColor(pattern, this.handler.canvas.renderAll.bind(this.handler.canvas));
		this.handler.canvasOption.backgroundColor = pattern;
	};

	private drawDot = (option: GridOption) => {
		const { grid, dotColor } = option;
		const patternCanvas = document.createElement('canvas');
		patternCanvas.width = grid * 5;
		patternCanvas.height = grid * 5;

		const ctx = patternCanvas.getContext('2d');
		if (!ctx) return;

		ctx.fillStyle = this.handler.canvasOption.backgroundColor as string;
		ctx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);

		const dotRadius = 1;
		ctx.fillStyle = dotColor;
		for (let i = 0; i <= 5; i++) {
			for (let j = 0; j <= 5; j++) {
				const x = i * grid;
				const y = j * grid;

				ctx.beginPath();
				ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		const image = new Image();
		image.src = patternCanvas.toDataURL();
		const pattern = new fabric.Pattern({ source: image, repeat: 'repeat' });
		this.handler.canvas.setBackgroundColor(pattern, this.handler.canvas.renderAll.bind(this.handler.canvas));
		this.handler.canvasOption.backgroundColor = pattern;
	};

	/**
	 * Set coords in grid
	 * @param {(FabricObject | fabric.ActiveSelection)} target
	 * @returns
	 */
	public setCoords = (target: FabricObject | fabric.ActiveSelection) => {
		const { enabled, grid, snapToGrid } = this.handler.gridOption;
		if (enabled && grid && snapToGrid) {
			if (target.type === 'activeSelection') {
				const activeSelection = target as fabric.ActiveSelection;
				activeSelection.set({
					left: Math.round(target.left / grid) * grid,
					top: Math.round(target.top / grid) * grid,
				});
				activeSelection.setCoords();
				activeSelection.getObjects().forEach((obj: any) => {
					if (obj.superType === 'node') {
						const left = target.left + obj.left + target.width / 2;
						const top = target.top + obj.top + target.height / 2;
						this.handler.portHandler.setCoords({ ...obj, left, top });
					}
				});
				return;
			}
			const obj = target as FabricObject;
			obj.set({
				left: Math.round(target.left / grid) * grid,
				top: Math.round(target.top / grid) * grid,
			});
			target.setCoords();
			this.handler.portHandler.setCoords(target as NodeObject);
		}
	};
}

export default GridHandler;
