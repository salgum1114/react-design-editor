import { fabric } from 'fabric';
import { FabricObject } from '../models';
import { registerFabricClass, resolveFromObject } from '../utils';

export interface CubeObject extends FabricObject {}

class Cube extends fabric.Object {
	static type = 'cube';
	superType = 'shape';

	constructor(options: any = {}) {
		super(options);
	}

	shadeColor(color: string, percent: number) {
		const normalizedColor = color.substr(1);
		const num = parseInt(normalizedColor, 16);
		const amount = Math.round(2.55 * percent);
		const red = (num >> 16) + amount;
		const green = ((num >> 8) & 0x00ff) + amount;
		const blue = (num & 0x0000ff) + amount;
		return (
			'#' +
			(
				0x1000000 +
				(red < 255 ? (red < 1 ? 0 : red) : 255) * 0x10000 +
				(green < 255 ? (green < 1 ? 0 : green) : 255) * 0x100 +
				(blue < 255 ? (blue < 1 ? 0 : blue) : 255)
			)
				.toString(16)
				.slice(1)
		);
	}

	_render(ctx: CanvasRenderingContext2D) {
		const { width, height, fill } = this;
		const wx = width / 2;
		const wy = width / 2;
		const h = height / 2;
		const x = 0;
		const y = wy;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x - wx, y - wx * 0.5);
		ctx.lineTo(x - wx, y - h - wx * 0.5);
		ctx.lineTo(x, y - h);
		ctx.closePath();
		ctx.fillStyle = this.shadeColor(fill as string, -10);
		ctx.strokeStyle = fill as string;
		ctx.stroke();
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + wy, y - wy * 0.5);
		ctx.lineTo(x + wy, y - h - wy * 0.5);
		ctx.lineTo(x, y - h);
		ctx.closePath();
		ctx.fillStyle = this.shadeColor(fill as string, 10);
		ctx.strokeStyle = this.shadeColor(fill as string, 50);
		ctx.stroke();
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(x, y - h);
		ctx.lineTo(x - wx, y - h - wx * 0.5);
		ctx.lineTo(x - wx + wy, y - h - (wx * 0.5 + wy * 0.5));
		ctx.lineTo(x + wy, y - h - wy * 0.5);
		ctx.closePath();
		ctx.fillStyle = this.shadeColor(fill as string, 20);
		ctx.strokeStyle = this.shadeColor(fill as string, 60);
		ctx.stroke();
		ctx.fill();
	}

	static fromObject(options: CubeObject, callback?: (obj: CubeObject) => any) {
		return resolveFromObject(new Cube(options), callback);
	}
}

registerFabricClass('Cube', Cube);

export default Cube;
