import { fabric } from 'fabric';
import 'gifler';

interface TempWindow extends Window {
    gifler?: any;
}

const global = window as TempWindow;

const Gif = fabric.util.createClass(fabric.Object, {
    type: 'gif',
    superType: 'image',
    gifCanvas: null,
    isStarted: false,
    initialize(options: any) {
        options = options || {};
        this.callSuper('initialize', options);
        this.gifCanvas = document.createElement('canvas');
    },
    drawFrame(ctx: CanvasRenderingContext2D, frame: any) {
        // update canvas size
        this.gifCanvas.width = frame.width;
        this.gifCanvas.height = frame.height;
        // update canvas that we are using for fabric.js
        ctx.drawImage(frame.buffer, -frame.width / 2, -frame.height / 2, frame.width, frame.height);
    },
    _render(ctx: CanvasRenderingContext2D) {
        this.callSuper('_render', ctx);
        if (!this.isStarted) {
            this.isStarted = true;
            global.gifler('./images/sample/earth.gif')
            .frames(this.gifCanvas, (_c: CanvasRenderingContext2D, frame: any) => {
                this.isStarted = true;
                this.drawFrame(ctx, frame);
            });
        }
    },
});

export default Gif;
