import * as fabric from 'fabric';
import { registerFabricClass } from '../utils';

class Line extends fabric.Line {
	static type = 'line';
	superType = 'drawing';

	constructor(points: any, options: any = {}) {
		const nextPoints = points ?? [options.x1, options.y1, options.x2, options.y2];
		const { type: _type, ...lineOptions } = options;
		super(nextPoints, lineOptions);
	}

	_render(ctx: CanvasRenderingContext2D) {
		super._render(ctx);
	}

	static fromObject(options: any, _abortable?: { signal?: AbortSignal }) {
		return Promise.resolve(new Line([options.x1, options.y1, options.x2, options.y2], options));
	}
}

registerFabricClass('Line', Line, Line.type);

export default Line;
