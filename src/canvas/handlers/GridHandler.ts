import * as fabric from 'fabric';

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
		this.handler.canvas.backgroundColor = pattern;
		this.handler.canvas.renderAll();
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
		this.handler.canvas.backgroundColor = pattern;
		this.handler.canvas.renderAll();
		this.handler.canvasOption.backgroundColor = pattern;
	};

	/**
	 * Get the grid-aligned position without mutating the target.
	 */
	public getSnappedPosition = (target: FabricObject | fabric.ActiveSelection) => {
		const { enabled, grid, snapToGrid } = this.handler.gridOption;
		if (!enabled || !grid || !snapToGrid) {
			return { left: target.left, top: target.top };
		}
		const topLeft = target.getPointByOrigin('left', 'top');
		return {
			left: target.left + Math.round(topLeft.x / grid) * grid - topLeft.x,
			top: target.top + Math.round(topLeft.y / grid) * grid - topLeft.y,
		};
	};

	/**
	 * Set coords in grid
	 * @param {(FabricObject | fabric.ActiveSelection)} target
	 * @returns
	 */
	public setCoords = (target: FabricObject | fabric.ActiveSelection) => {
		const { enabled, grid, snapToGrid } = this.handler.gridOption;
		if (enabled && grid && snapToGrid) {
			const snappedPosition = this.getSnappedPosition(target);
			if (this.handler.isActiveSelection(target)) {
				const activeSelection = target as fabric.ActiveSelection;
				activeSelection.set(snappedPosition);
				activeSelection.setCoords();
				activeSelection.getObjects().forEach((obj: any) => {
					if (obj.superType === 'node') {
						this.handler.portHandler.setCoords(obj);
					}
				});
				return;
			}
			const obj = target as FabricObject;
			obj.set(snappedPosition);
			target.setCoords();
			this.handler.portHandler.setCoords(target as NodeObject);
		}
	};
}

export default GridHandler;
