import * as fabric from 'fabric';

import { registerFabricClass, resolveFromObject } from '../utils';

class Arrow extends fabric.Line {
	static type = 'arrow';
	superType = 'drawing';

	constructor(points: any, options: any = {}) {
		const nextPoints = points ?? [options.x1, options.y1, options.x2, options.y2];
		super(nextPoints, options);
	}

	_render(ctx: CanvasRenderingContext2D) {
		super._render(ctx);
		ctx.save();
		const xDiff = this.x2 - this.x1;
		const yDiff = this.y2 - this.y1;
		const angle = Math.atan2(yDiff, xDiff);
		ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
		ctx.rotate(angle);
		ctx.beginPath();
		ctx.moveTo(5, 0);
		ctx.lineTo(-5, 5);
		ctx.lineTo(-5, -5);
		ctx.closePath();
		ctx.fillStyle = this.stroke as string;
		ctx.fill();
		ctx.restore();
	}

	static fromObject(options: any, callback?: (obj: Arrow) => void) {
		return resolveFromObject(new Arrow([options.x1, options.y1, options.x2, options.y2], options), callback);
	}
}

registerFabricClass('Arrow', Arrow);

export default Arrow;
