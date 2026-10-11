// @vitest-environment jsdom

import * as fabric from 'fabric';
import TransactionHandler from '../../../../canvas/handlers/TransactionHandler';
import LinkHandler from '../../../../canvas/handlers/LinkHandler';
import Links from '../../link';
import LogicNode from './LogicNode';
import { describe, expect, it, vi } from 'vitest';
import PortHandler from '../../../../canvas/handlers/PortHandler';
import SwitchNode from './SwitchNode';

const descriptor = {
	inEnabled: true,
	outPortType: 'DYNAMIC',
	outPorts: [''],
};

const createPorts = (node: SwitchNode) => {
	const portHandler = new PortHandler({
		activeLine: undefined,
		canvas: {
			add: vi.fn(),
			bringObjectToFront: vi.fn(),
			renderAll: vi.fn(),
		},
		interactionMode: 'selection',
		isBatching: vi.fn(() => true),
	} as any);
	portHandler.create(node as any);
};

describe('SwitchNode transaction restoration', () => {
	it.each([3, 4, 5])('keeps its vertical center after ports are recreated repeatedly with %s routes', async routeCount => {
		let node = new SwitchNode({
			color: '#a855f7',
			configuration: { routes: Array.from({ length: routeCount }, (_, i) => `route-${i}`) },
			descriptor,
			fill: '#ffffff',
			left: 320,
			name: 'Switch',
			stroke: '#000000',
			top: 180,
		});
		createPorts(node);
		const expectedLeft = node.getCenterPoint().x;
		const expectedTop = node.getCenterPoint().y;

		for (let index = 0; index < 2; index += 1) {
			node = await SwitchNode.fromObject(node.toObject());
			createPorts(node);
			expect(node.getCenterPoint().x).toBeCloseTo(expectedLeft);
			expect(node.getCenterPoint().y).toBeCloseTo(expectedTop);
		}
	}, 20_000);
});


describe('Connected SwitchNode undo/redo', () => {
	it.each([3, 4, 5])('restores nodes, ports and connections with %s routes', async routeCount => {
		const canvas = new fabric.Canvas(document.createElement('canvas'));
		let batching = false;
		const handler: any = {
			canvas, canvasActions: { transaction: true }, editable: true,
			fabricObjects: Links('light'), propertiesToInclude: ['id', 'superType'],
			objectMap: {}, objects: [], isBatching: () => batching,
			bindObjectEvents: () => {},
			clear: () => { canvas.remove(...canvas.getObjects()); },
			runBatch: (operation: () => void) => { batching = true; try { operation(); } finally { batching = false; } },
			getObjects: () => canvas.getObjects().filter((object: any) => object.superType !== 'port'),
		};
		handler.portHandler = new PortHandler(handler);
		handler.linkHandler = new LinkHandler(handler);
		const source = new SwitchNode({ id: 'switch', name: 'Switch', fill: '#fff', stroke: '#000', color: '#a855f7', left: 320, top: 180,
			configuration: { routes: Array.from({ length: routeCount }, (_, i) => `route-${i}`) }, descriptor });
		const destination = new LogicNode({ id: 'delay', name: 'Delay', fill: '#fff', stroke: '#000', color: '#a855f7', left: 560, top: 420,
			configuration: {}, descriptor: { inEnabled: true, outPortType: 'STATIC', outPorts: ['defaultFromPort'] } });
		canvas.add(source, destination);
		for (const node of [source, destination]) {
			handler.objectMap[node.id] = node;
			handler.portHandler.create(node);
		}
		handler.linkHandler.create({ type: 'link', fromNodeId: source.id, fromPortId: 'route-0', toNodeId: destination.id });
		const transaction = new TransactionHandler(handler);
		transaction.setDefaultObjects();
		const positions = () => handler.getObjects().sort((a: any, b: any) => a.id.localeCompare(b.id)).map((object: any) => object.superType === 'node'
			? [object.id, object.getCenterPoint().x, object.getCenterPoint().y,
				object.fromPort.map((port: any) => [port.left, port.top]), [object.toPort.left, object.toPort.top]]
			: [object.fromNode.id, object.fromPort.id, object.toNode.id, object.line.path]);
		const before = positions();
		source.set({ left: source.left + 100, top: source.top + 60 });
		source.setCoords();
		handler.portHandler.setCoords(source);
		transaction.save('moved');
		const after = positions();
		// Replay both stacks repeatedly without throttling the public undo/redo controls.
		for (let i = 0; i < 3; i++) {
			await transaction.undo();
			expect(positions()).toEqual(before);
			transaction.undo.cancel();
			await transaction.redo();
			expect(positions()).toEqual(after);
			transaction.redo.cancel();
		}
		await canvas.dispose();
	}, 20_000);
});
