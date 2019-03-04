import { fabric } from 'fabric';

const Arrow = fabric.util.createClass(fabric.Line, {
    type: 'arrow',
    superType: 'drawing',
    initialize(points, options) {
        options = options || {};
        this.callSuper('initialize', points, options);
    },
    toObject() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            id: this.get('id'),
            name: this.get('name'),
            superType: this.get('superType'),
        });
    },
    _render(ctx) {
        this.callSuper('_render', ctx);
        ctx.save();
        const xDiff = this.x2 - this.x1;
        const yDiff = this.y2 - this.y1;
        const angle = Math.atan2(yDiff, xDiff);
        ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
        ctx.rotate(angle);
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

Arrow.fromObject = function (options, callback) {
    return callback(new Arrow(options));
};

export default Arrow;
