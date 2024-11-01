import { fabric } from 'fabric';
import { FabricGroup, FabricObject, FabricObjectOption, toObject } from '../utils';

export type SvgObject = (FabricGroup | FabricObject) & {
	loadSvg(option: SvgOption): Promise<SvgObject>;
	setFill(value: string, filter?: (obj: FabricObject) => boolean): SvgObject;
	setStroke(value: string, filter?: (obj: FabricObject) => boolean): SvgObject;
};

export interface SvgOption extends FabricObjectOption {
	src?: string;
	/**
	 *
	 * @deprecated
	 * @type {*}
	 */
	svg?: any;
	loadType?: 'file' | 'svg';
	keepSize?: boolean;
}

const Svg = fabric.util.createClass(fabric.Group, {
	type: 'svg',
	initialize(option: SvgOption = {}) {
		this.callSuper('initialize', [], option);
		this.loadSvg(option);
	},
	addSvgElements(objects: FabricObject[], options: SvgOption) {
		const createdObj = fabric.util.groupSVGElements(objects, options) as SvgObject;
		const { height, scaleY } = this;
		const scale = height ? (height * scaleY) / createdObj.height : createdObj.scaleY;
		this.set({ ...options, scaleX: scale, scaleY: scale });
		if (this._objects?.length) {
			(this as FabricGroup).getObjects().forEach(obj => {
				this.remove(obj);
			});
		}
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
			if (this._objects?.length) {
				(this as FabricGroup)._objects.forEach(obj => this.remove(obj));
			}
			this.add(createdObj);
		}
		this.setCoords();
		if (this.canvas) {
			this.canvas.requestRenderAll();
		}
		return this;
	},
	loadSvg(option: SvgOption) {
		const { src, svg, loadType, fill, stroke } = option;
		return new Promise<SvgObject>(resolve => {
			if (loadType === 'svg') {
				fabric.loadSVGFromString(svg || src, (objects, options) => {
					resolve(this.addSvgElements(objects, { ...options, fill, stroke }));
				});
			} else {
				fabric.loadSVGFromURL(svg || src, (objects, options) => {
					resolve(this.addSvgElements(objects, { ...options, fill, stroke }));
				});
			}
		});
	},
	setFill(value: any, filter: (obj: FabricObject) => boolean = () => true) {
		this.getObjects()
			.filter(filter)
			.forEach((obj: FabricObject) => obj.set('fill', value));
		this.canvas.requestRenderAll();
		return this;
	},
	setStroke(value: any, filter: (obj: FabricObject) => boolean = () => true) {
		this.getObjects()
			.filter(filter)
			.forEach((obj: FabricObject) => obj.set('stroke', value));
		this.canvas.requestRenderAll();
		return this;
	},
	toObject(propertiesToInclude: string[]) {
		return toObject(this, propertiesToInclude, {
			src: this.get('src'),
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
