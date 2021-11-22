import { fabric } from 'fabric';
import { FabricObject } from '../../../canvas';

export const CableColorCode = {
	1: 'blue',
	2: 'orange',
	3: 'green',
	4: 'brown',
	5: 'gray',
	6: 'white',
	7: 'red',
	8: 'black',
	9: 'yellow',
	10: 'violet',
	11: 'pink',
	12: 'aqua',
};

export interface CableSectionNodeOptions {
	coreCount: number;
	/**
	 * Created direction of ports
	 *
	 * @type {('left' | 'right')}
	 * @default 'right'
	 */
	portDirection?: 'left' | 'right';
}

export interface CableSectionNodeObject extends FabricObject<fabric.Group> {
	createPort(): any;
}

const CableSectionNode = fabric.util.createClass(fabric.Group, {
	type: 'cableSectionNode',
	coreSplitCount: 12,
	initialize(options: CableSectionNodeOptions) {
		const { coreCount, portDirection = 'right' } = options;
		const coreContainerTotalCount = Math.ceil(coreCount / this.coreSplitCount);
		const coreRemainder = coreCount % this.coreSplitCount;
		const childs = Array.from({ length: coreContainerTotalCount })
			.map((_v, containerNumber) => {
				if (coreRemainder !== 0 && containerNumber === coreContainerTotalCount - 1) {
					return Array.from({ length: coreRemainder }).map((_v, coreNumber) =>
						this.createCore(containerNumber, coreNumber),
					);
				}
				return Array.from({ length: 12 }).map((_v, coreNumber) => this.createCore(containerNumber, coreNumber));
			})
			.flat()
			.concat(Array.from({ length: coreContainerTotalCount }).map((_v, i) => this.createCoreContainer(i)))
			.concat([this.createCableNode(coreContainerTotalCount)]);
		// console.log(childs);
		this.callSuper('initialize', childs, { ...options, subTargetCheck: true, stroke: '#555555', strokeWidth: 1 });
	},
	createCableNode(coreContainerTotalCount: number) {
		return new fabric.Rect({
			type: 'container',
			width: 80,
			height: 120 * coreContainerTotalCount,
			fill: 'rgb(35, 48, 62)',
		});
	},
	createCoreContainer(coreContainerNumber: number) {
		return new fabric.Rect({
			type: 'coreContainer',
			width: 60,
			height: 120,
			left: 80,
			top: 120 * coreContainerNumber,
			fill: CableColorCode[coreContainerNumber + 1],
		});
	},
	createCore(coreContainerNumber: number, coreNumber: number) {
		return new fabric.Rect({
			type: 'core',
			width: 40,
			height: 10,
			left: 140,
			top: 10 * coreNumber + coreContainerNumber * 120,
			fill: CableColorCode[coreNumber + 1],
			stroke: '#555555',
			strokeWidth: 1,
		});
	},
	createPorts() {
		const ports = Array(this.coreCount).map((_v, i) => {
			if (i <= 11) {
			} else if (i <= 23) {
			} else if (i <= 35) {
			} else {
			}
		});
	},
	_render(ctx: CanvasRenderingContext2D) {
		this.callSuper('_render', ctx);
	},
});

export default CableSectionNode;
