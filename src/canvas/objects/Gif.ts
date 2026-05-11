import * as fabric from 'fabric';
import 'gifler';

import { registerFabricClass, resolveFromObject } from '../utils';

class Gif extends fabric.Image {
	static type = 'gif';
	superType = 'image';
	gifCanvas: HTMLCanvasElement;
	gifler: any;
	isStarted = false;

	constructor(options: any = {}) {
		const gifCanvas = document.createElement('canvas');
		super(gifCanvas, options);
		this.gifCanvas = gifCanvas;
	}

	drawFrame(ctx: CanvasRenderingContext2D, frame: any) {
		this.gifCanvas.width = frame.width;
		this.gifCanvas.height = frame.height;
		ctx.drawImage(frame.buffer, 0, 0);
		this.canvas?.renderAll();
	}

	_render(ctx: CanvasRenderingContext2D) {
		super._render(ctx);
		this.dirty = true;
		if (!this.isStarted) {
			this.isStarted = true;
			this.gifler = window
				.gifler('https://themadcreator.github.io/gifler/assets/gif/nyan.gif')
				.frames(this.gifCanvas, (context: CanvasRenderingContext2D, frame: any) => {
					this.isStarted = true;
					this.drawFrame(context, frame);
				});
		}
	}

	static fromObject(options: any, callback?: any) {
		return resolveFromObject(new Gif(options), callback);
	}
}

registerFabricClass('Gif', Gif);

export default Gif;
