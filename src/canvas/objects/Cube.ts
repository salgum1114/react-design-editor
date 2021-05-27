import { fabric } from 'fabric';
import { FabricObject } from '../utils';

export interface CubeObject extends FabricObject {}

const Cube = fabric.util.createClass(fabric.Object, {
	type: 'cube',
	superType: 'shape',
	initialize(options: any) {
		options = options || {};
		this.callSuper('initialize', options);
	},
	shadeColor(color: any, percent: number) {
		color = color.substr(1);
		const num = parseInt(color, 16);
		const amt = Math.round(2.55 * percent);
		const R = (num >> 16) + amt;
		const G = ((num >> 8) & 0x00ff) + amt;
		const B = (num & 0x0000ff) + amt;
		return (
			'#' +
			(
				0x1000000 +
				(R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
				(G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
				(B < 255 ? (B < 1 ? 0 : B) : 255)
			)
				.toString(16)
				.slice(1)
		);
	},
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
		ctx.lineTo(x, y - h * 1);
		ctx.closePath();
		ctx.fillStyle = this.shadeColor(fill, -10);
		ctx.strokeStyle = fill;
		ctx.stroke();
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + wy, y - wy * 0.5);
		ctx.lineTo(x + wy, y - h - wy * 0.5);
		ctx.lineTo(x, y - h * 1);
		ctx.closePath();
		ctx.fillStyle = this.shadeColor(fill, 10);
		ctx.strokeStyle = this.shadeColor(fill, 50);
		ctx.stroke();
		ctx.fill();

		ctx.beginPath();
		ctx.moveTo(x, y - h);
		ctx.lineTo(x - wx, y - h - wx * 0.5);
		ctx.lineTo(x - wx + wy, y - h - (wx * 0.5 + wy * 0.5));
		ctx.lineTo(x + wy, y - h - wy * 0.5);
		ctx.closePath();
		ctx.fillStyle = this.shadeColor(fill, 20);
		ctx.strokeStyle = this.shadeColor(fill, 60);
		ctx.stroke();
		ctx.fill();

		ctx.restore();
	},
});

Cube.fromObject = (options: CubeObject, callback: (obj: CubeObject) => any) => {
	return callback(new Cube(options));
};

// @ts-ignore
window.fabric.Cube = Cube;

export default Cube;
