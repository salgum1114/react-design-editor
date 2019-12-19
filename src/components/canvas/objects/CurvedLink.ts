import { fabric } from 'fabric';

import Link, { LinkObject } from './Link';

const CurvedLink = fabric.util.createClass(Link, {
    type: 'curvedLink',
    superType: 'link',
    initialize(fromNode: any, fromPort: any, toNode: any, toPort: any, options: any) {
        options = options || {};
        this.callSuper('initialize', fromNode, fromPort, toNode, toPort, options);
    },
    _render(ctx: CanvasRenderingContext2D) {
        // Drawing curved link
        const { x1, y1, x2, y2 } = this;
        ctx.strokeStyle = this.stroke;
        const fp = { x: (x1 - x2) / 2, y: (y1 - y2) / 2 };
        const sp = { x: (x2 - x1) / 2, y: (y2 - y1) / 2 };
        ctx.beginPath();
        ctx.moveTo(fp.x, fp.y);
        ctx.bezierCurveTo(fp.x, sp.y, sp.x, fp.y, sp.x, sp.y);
        ctx.stroke();
        ctx.save();
        const xDiff = x2 - x1;
        const yDiff = y2 - y1;
        const angle = Math.atan2(yDiff, xDiff);
        ctx.translate((x2 - x1) / 2, (y2 - y1) / 2);
        ctx.rotate(angle >= 0 ? 1.57 : -1.57);
        ctx.beginPath();
        // Move 5px in front of line to start the arrow so it does not have the square line end showing in front (0,0)
        ctx.moveTo(5, 0);
        ctx.lineTo(-5, 5);
        ctx.lineTo(-5, -5);
        ctx.closePath();
        ctx.fillStyle = this.stroke;
        ctx.fill();
        ctx.restore();
    },
});

CurvedLink.fromObject = (options: LinkObject, callback: (obj: LinkObject) => any) => {
    return callback(new CurvedLink(options));
};

window.fabric.CurvedLink = CurvedLink;

export default CurvedLink;
