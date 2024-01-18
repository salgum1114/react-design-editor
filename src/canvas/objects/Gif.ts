import { fabric } from 'fabric';
import 'gifler';

const Gif = fabric.util.createClass(fabric.Image, {
	type: 'gif',
	superType: 'image',
	gifCanvas: null,
	gifler: undefined,
	isStarted: false,
	initialize(options: any) {
		options = options || {};
		this.gifCanvas = document.createElement('canvas');
		this.callSuper('initialize', this.gifCanvas, options);
	},
	drawFrame(ctx: CanvasRenderingContext2D, frame: any) {
		// update canvas size
		this.gifCanvas.width = frame.width;
		this.gifCanvas.height = frame.height;
		// update canvas that we are using for fabric.js
		ctx.drawImage(frame.buffer, 0, 0);
		this.canvas?.renderAll();
	},
	_render(ctx: CanvasRenderingContext2D) {
		this.callSuper('_render', ctx);
		this.dirty = true;
		if (!this.isStarted) {
			this.isStarted = true;
			this.gifler = window
				// @ts-ignore
				.gifler('https://themadcreator.github.io/gifler/assets/gif/nyan.gif')
				// .gifler('./images/sample/earth.gif')
				.frames(this.gifCanvas, (context: CanvasRenderingContext2D, frame: any) => {
					this.isStarted = true;
					this.drawFrame(context, frame);
				});
		}
	},
});

Gif.fromObject = (options: any, callback: (obj: any) => any) => {
	return callback(new Gif(options));
};

// @ts-ignore
window.fabric.Gif = Gif;

export default Gif;
