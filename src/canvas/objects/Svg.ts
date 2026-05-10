import { fabric } from 'fabric';
import { FabricGroup, FabricObject, FabricObjectOption } from '../models';
import { registerFabricClass, resolveFromObject, toObject } from '../utils';

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

class Svg extends fabric.Group {
	static type = 'svg';

	constructor(option: SvgOption = {}) {
		super([], option);
		void this.loadSvg(option);
	}

	addSvgElements(objects: FabricObject[], options: SvgOption) {
		const createdObj = fabric.util.groupSVGElements(objects, options) as SvgObject;
		const { height, scaleY } = this;
		const scale = height ? (height * scaleY) / createdObj.height : createdObj.scaleY;
		this.set({ ...options, scaleX: scale, scaleY: scale });
		if (this._objects?.length) {
			this.getObjects().forEach((obj: FabricObject) => {
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
			createdObj.set({ originX: 'center', originY: 'center' });
			if (options.fill) {
				createdObj.set({ fill: options.fill });
			}
			if (options.stroke) {
				createdObj.set({ stroke: options.stroke });
			}
			if (this._objects?.length) {
				this.getObjects().forEach((obj: FabricObject) => this.remove(obj));
			}
			this.add(createdObj);
		}
		this.setCoords();
		this.canvas?.requestRenderAll();
		return this as unknown as SvgObject;
	}

	async loadSvg(option: SvgOption) {
		const { src, svg, loadType, fill, stroke } = option;
		const result =
			loadType === 'svg'
				? await fabric.loadSVGFromString(svg || src)
				: await fabric.loadSVGFromURL(svg || src);
		return this.addSvgElements(result.objects as FabricObject[], { ...result.options, fill, stroke });
	}

	setFill(value: string, filter: (obj: FabricObject) => boolean = () => true) {
		this.getObjects()
			.filter(filter)
			.forEach((obj: FabricObject) => obj.set('fill', value));
		this.canvas?.requestRenderAll();
		return this as unknown as SvgObject;
	}

	setStroke(value: string, filter: (obj: FabricObject) => boolean = () => true) {
		this.getObjects()
			.filter(filter)
			.forEach((obj: FabricObject) => obj.set('stroke', value));
		this.canvas?.requestRenderAll();
		return this as unknown as SvgObject;
	}

	toObject(propertiesToInclude: string[] = []) {
		return toObject(super.toObject(propertiesToInclude), this, propertiesToInclude, {
			src: this.get('src'),
			loadType: this.get('loadType'),
		});
	}

	_render(ctx: CanvasRenderingContext2D) {
		super._render(ctx);
	}

	static fromObject(option: SvgOption, callback?: (obj: SvgObject) => any) {
		return resolveFromObject(new Svg(option) as unknown as SvgObject, callback);
	}
}

registerFabricClass('Svg', Svg, 'Svg');

export default Svg;
