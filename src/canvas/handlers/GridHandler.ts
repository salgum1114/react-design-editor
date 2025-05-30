import { fabric } from 'fabric';

import { NodeObject } from '../objects/Node';
import { FabricObject } from '../utils';
import type Handler from './Handler';

class GridHandler {
	handler?: Handler;

	constructor(handler: Handler) {
		this.handler = handler;
		this.initialize();
	}

	/**
	 * Init grid
	 *
	 */
	public initialize = () => {
		const { grid, lineColor, borderColor, enabled } = this.handler.gridOption;
		if (enabled && grid) {
			const patternCanvas = document.createElement('canvas');
			patternCanvas.width = grid * 5;
			patternCanvas.height = grid * 5;
			const ctx = patternCanvas.getContext('2d');

			// 작은 칸 선 (얇은 회색)
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

			// 큰 칸 선 (굵은 진회색)
			ctx.strokeStyle = borderColor;

			// 바깥 세로선 (왼쪽, 오른쪽)
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(0, patternCanvas.height);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(patternCanvas.width, 0);
			ctx.lineTo(patternCanvas.width, patternCanvas.height);
			ctx.stroke();

			// 바깥 가로선 (위쪽, 아래쪽)
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
		}
	};

	/**
	 * Set coords in grid
	 * @param {(FabricObject | fabric.ActiveSelection)} target
	 * @returns
	 */
	public setCoords = (target: FabricObject | fabric.ActiveSelection) => {
		const {
			gridOption: { enabled, grid, snapToGrid },
		} = this.handler;
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
