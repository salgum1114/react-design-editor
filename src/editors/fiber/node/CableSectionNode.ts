import { fabric } from 'fabric';
import { FabricObject, registerFabricClass, resolveFromObject } from '../../../canvas';

export const CableColorCode: Record<number, string> = {
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

class CableSectionNode extends fabric.Group {
	static type = 'cableSectionNode';
	type = 'cableSectionNode';
	coreSplitCount = 12;
	declare coreCount: number;
	declare portDirection: 'left' | 'right';

	constructor(options: CableSectionNodeOptions) {
		const coreSplitCount = 12;
		const { coreCount, portDirection = 'right' } = options;
		const coreContainerTotalCount = Math.ceil(coreCount / coreSplitCount);
		const coreRemainder = coreCount % coreSplitCount;
		const childs = Array.from({ length: coreContainerTotalCount })
			.map((_v, containerNumber) => {
				if (coreRemainder !== 0 && containerNumber === coreContainerTotalCount - 1) {
					return Array.from({ length: coreRemainder }).map((_item, coreNumber) =>
						CableSectionNode.createCore(containerNumber, coreNumber),
					);
				}
				return Array.from({ length: 12 }).map((_item, coreNumber) =>
					CableSectionNode.createCore(containerNumber, coreNumber),
				);
			})
			.flat()
			.concat(
				Array.from({ length: coreContainerTotalCount }).map((_item, i) =>
					CableSectionNode.createCoreContainer(i),
				),
			)
			.concat([CableSectionNode.createCableNode(coreContainerTotalCount)]);
		super(childs, {
			...options,
			type: CableSectionNode.type,
			coreCount,
			portDirection,
			subTargetCheck: true,
			stroke: '#555555',
			strokeWidth: 1,
		});
		this.coreSplitCount = coreSplitCount;
		this.coreCount = coreCount;
		this.portDirection = portDirection;
	}

	private static createCableNode(coreContainerTotalCount: number) {
		return new fabric.Rect({
			type: 'container',
			width: 80,
			height: 120 * coreContainerTotalCount,
			fill: 'rgb(35, 48, 62)',
		});
	}

	private static createCoreContainer(coreContainerNumber: number) {
		return new fabric.Rect({
			type: 'coreContainer',
			width: 60,
			height: 120,
			left: 80,
			top: 120 * coreContainerNumber,
			fill: CableColorCode[coreContainerNumber + 1],
		});
	}

	private static createCore(coreContainerNumber: number, coreNumber: number) {
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
	}

	createPorts() {
		const ports = Array(this.coreCount).map((_v, i) => {
			if (i <= 11) {
			} else if (i <= 23) {
			} else if (i <= 35) {
			} else {
			}
		});
		return ports;
	}

	_render(ctx: CanvasRenderingContext2D) {
		super._render(ctx);
	}

	static fromObject(options: CableSectionNodeOptions, callback?: (obj: CableSectionNode) => any) {
		return resolveFromObject(new CableSectionNode(options), callback);
	}
}

registerFabricClass('CableSectionNode', CableSectionNode);

export default CableSectionNode;
