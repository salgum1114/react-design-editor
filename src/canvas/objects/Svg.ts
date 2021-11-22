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
		this.callSuper('initialize', [], option);
		this.loadSvg(option);
	},
	addSvgElements(objects: FabricObject[], options: any, path: string) {
		const createdObj = fabric.util.groupSVGElements(objects, options, path) as SvgObject;
		this.set(options);
		if (createdObj.getObjects) {
			(createdObj as FabricGroup).getObjects().forEach(obj => {
				this.add(obj);
				if (options.fill) {
					obj.set('fill', options.fill);
				}
				if (options.stroke) {
					obj.set('stroke', options.stroke);
				}
			});
		} else {
			createdObj.set({
				originX: 'center',
				originY: 'center',
			});
			if (options.fill) {
				createdObj.set({
					fill: options.fill,
				});
			}
			if (options.stroke) {
				createdObj.set({
					stroke: options.stroke,
				});
			}
			this.add(createdObj);
		}
		this.setCoords();
		if (this.canvas) {
			this.canvas.requestRenderAll();
		}
	},
	loadSvg(option: SvgOption) {
		const { svg, loadType, fill, stroke } = option;
		console.log(option);
		return new Promise<SvgObject>(resolve => {
			if (loadType === 'svg') {
				fabric.loadSVGFromString(svg, (objects, options) => {
					resolve(this.addSvgElements(objects, { ...options, fill, stroke }, svg));
				});
			} else {
				fabric.loadSVGFromURL(svg, (objects, options) => {
					resolve(this.addSvgElements(objects, { ...options, fill, stroke }, svg));
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
