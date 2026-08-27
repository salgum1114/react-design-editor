// @vitest-environment jsdom

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
	it('keeps its vertical center after ports are recreated repeatedly', async () => {
		let node = new SwitchNode({
			color: '#a855f7',
			configuration: { routes: ['normal', 'warning', 'error'] },
			descriptor,
			fill: '#ffffff',
			left: 320,
			name: 'Switch',
			stroke: '#000000',
			top: 180,
		});
		createPorts(node);
		const expectedTop = node.getCenterPoint().y;

		for (let index = 0; index < 2; index += 1) {
			node = await SwitchNode.fromObject(node.toObject());
			createPorts(node);
			expect(node.getCenterPoint().y).toBeCloseTo(expectedTop);
		}
	}, 20_000);
});
