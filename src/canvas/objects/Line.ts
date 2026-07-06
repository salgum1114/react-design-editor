import * as fabric from 'fabric';
import { registerFabricClass } from '../utils';

class Line extends fabric.Line {
	static type = 'line';
	superType = 'drawing';

	constructor(points: any, options: any = {}) {
		const nextPoints = points ?? [options.x1, options.y1, options.x2, options.y2];
		super(nextPoints, options);
	}

	_render(ctx: CanvasRenderingContext2D) {
		super._render(ctx);
	}

	static fromObject(options: any, callback?: (obj: Line) => void) {
		const instance = new Line([options.x1, options.y1, options.x2, options.y2], options);
		callback?.(instance);
		return Promise.resolve(instance);
	}
}

registerFabricClass('Line', Line, Line.type);

export default Line;
