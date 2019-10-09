import { fabric } from 'fabric';
import 'gifler';

const Gif = fabric.util.createClass(fabric.Object, {
    type: 'gif',
    superType: 'image',
    gifCanvas: null,
    isStarted: false,
    initialize(options) {
        options = options || {};
        this.callSuper('initialize', options);
        this.gifCanvas = document.createElement('canvas');
    },
    drawFrame(ctx, frame) {
        // update canvas size
        this.gifCanvas.width = frame.width;
        this.gifCanvas.height = frame.height;
        // update canvas that we are using for Konva.Image
        ctx.drawImage(frame.buffer, -frame.width / 2, -frame.height / 2, frame.width, frame.height);
    },
    _render(ctx) {
        this.callSuper('_render', ctx);
        if (!this.isStarted) {
            this.isStarted = true;
            gifler('./images/sample/earth.gif')
            .frames(this.gifCanvas, (c, frame) => {
                this.isStarted = true;
                this.drawFrame(ctx, frame);
            });
        }
    },
});

export default Gif;
