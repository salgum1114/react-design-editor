import { fabric } from 'fabric';

import Link, { LinkObject } from './Link';
import { NodeObject } from './Node';
import { PortObject } from './Port';

const OrthogonalLink = fabric.util.createClass(Link, {
	type: 'OrthogonalLink',
	superType: 'link',
	initialize(
		fromNode: Partial<NodeObject>,
		fromPort: Partial<PortObject>,
		toNode: Partial<NodeObject>,
		toPort: Partial<PortObject>,
		options: Partial<LinkObject>,
	) {
		options = options || {};
		this.callSuper('initialize', fromNode, fromPort, toNode, toPort, options);
	},
	_render(ctx: CanvasRenderingContext2D) {
		// Drawing orthogonal link
		const { x1, y1, x2, y2 } = this;
		ctx.strokeStyle = this.stroke;
		const fp = { x: (x1 - x2) / 2, y: (y1 - y2) / 2 };
		const sp = { x: (x2 - x1) / 2, y: (y2 - y1) / 2 };
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.moveTo(fp.x, fp.y);
		ctx.lineTo(fp.x, sp.y / 2);
		ctx.lineTo(sp.x, sp.y / 2);
		ctx.lineTo(sp.x, sp.y);
		ctx.stroke();
		ctx.save();
		const xDiff = this.x2 - this.x1;
		const yDiff = this.y2 - this.y1;
		const angle = Math.atan2(yDiff, xDiff);
		ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
		ctx.rotate(angle >= 0 ? 1.57 : -1.57);
		ctx.beginPath();
		if (this.arrow) {
			// Move 5px in front of line to start the arrow so it does not have the square line end showing in front (0,0)
			ctx.moveTo(5, 0);
			ctx.lineTo(-5, 5);
			ctx.lineTo(-5, -5);
		}
		ctx.closePath();
		ctx.fillStyle = this.stroke;
		ctx.fill();
		ctx.restore();
	},
});

OrthogonalLink.fromObject = (options: LinkObject, callback: (obj: LinkObject) => any) => {
	const { fromNode, fromPort, toNode, toPort } = options;
	return callback(new OrthogonalLink(fromNode, fromPort, toNode, toPort, options));
};

window.fabric.OrthogonalLink = OrthogonalLink;

export default OrthogonalLink;
