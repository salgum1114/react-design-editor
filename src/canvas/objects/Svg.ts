import { fabric } from 'fabric';
import { FabricGroup, FabricObject, FabricObjectOption, toObject } from '../utils';

export type SvgObject = FabricGroup | FabricObject;

export interface SvgOption extends FabricObjectOption {
	svg?: string;
	loadType?: 'file' | 'svg';
}

const Svg = fabric.util.createClass(fabric.Group, {
	type: 'svg',
	initialize(option: SvgOption = {}) {
		const { svg, loadType } = option;
		this.callSuper('initialize', [], option);
		this.loadSvg(svg, loadType);
	},
	addSvgElements(objects: FabricObject[], options: any, path: string) {
		const createdObj = fabric.util.groupSVGElements(objects, options, path) as SvgObject;
		this.set(options);
		if (createdObj.getObjects) {
			(createdObj as FabricGroup).getObjects().forEach(obj => this.add(obj));
		} else {
			createdObj.set({
				originX: 'center',
				originY: 'center',
			});
			this.add(createdObj);
		}
		this.setCoords();
		if (this.canvas) {
			this.canvas.requestRenderAll();
		}
	},
	loadSvg(svg: string, loadType: 'file' | 'svg') {
		return new Promise<SvgObject>(resolve => {
			if (loadType === 'svg') {
				fabric.loadSVGFromString(svg, (objects, options) => {
					resolve(this.addSvgElements(objects, options, svg));
				});
			} else {
				fabric.loadSVGFromURL(svg, (objects, options) => {
					resolve(this.addSvgElements(objects, options, svg));
				});
			}
		});
	},
	toObject(propertiesToInclude: string[]) {
		return toObject(this, propertiesToInclude, {
			svg: this.get('svg'),
			loadType: this.get('loadType'),
		});
	},
	_render(ctx: CanvasRenderingContext2D) {
		this.callSuper('_render', ctx);
	},
});

Svg.fromObject = (option: SvgOption, callback: (obj: SvgObject) => any) => {
	return callback(new Svg(option));
};

// @ts-ignore
window.fabric.Svg = Svg;

export default Svg;
