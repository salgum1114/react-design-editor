import { describe, expect, it, vi } from 'vitest';

import PortHandler from './PortHandler';

describe('PortHandler batch creation', () => {
	it('adds ports without repeated stack changes while a batch is active', () => {
		const toPort = {
			on: vi.fn(),
			setCoords: vi.fn(),
		};
		const fromPort = {
			on: vi.fn(),
			setCoords: vi.fn(),
		};
		const node = {
			createFromPort: vi.fn(() => [fromPort]),
			createToPort: vi.fn(() => toPort),
			getCenterPoint: vi.fn(() => ({ x: 220, y: 130 })),
			getScaledHeight: vi.fn(() => 60),
		};
		const handler: any = {
			activeLine: undefined,
			canvas: {
				add: vi.fn(),
				bringObjectToFront: vi.fn(),
				renderAll: vi.fn(),
			},
			interactionMode: 'selection',
			isBatching: vi.fn(() => true),
		};
		const portHandler = new PortHandler(handler);

		portHandler.create(node as any);

		expect(node.createToPort).toHaveBeenCalledWith(220, 100);
		expect(node.createFromPort).toHaveBeenCalledWith(220, 160);
		expect(handler.canvas.add).toHaveBeenCalledTimes(2);
		expect(handler.canvas.bringObjectToFront).not.toHaveBeenCalled();
	});

	it('keeps existing ports anchored to the scaled node center', () => {
		const toPort = {
			links: [] as any[],
			setPosition: vi.fn(),
		};
		const fromPort = {
			leftDiff: 12,
			links: [] as any[],
			setPosition: vi.fn(),
			topDiff: 4,
		};
		const node = {
			fromPort: [fromPort],
			getCenterPoint: vi.fn(() => ({ x: 300, y: 200 })),
			getScaledHeight: vi.fn(() => 90),
			toPort,
		};
		const portHandler = new PortHandler({} as any);

		portHandler.setCoords(node as any);

		expect(toPort.setPosition).toHaveBeenCalledWith(300, 155);
		expect(fromPort.setPosition).toHaveBeenCalledWith(312, 249);
	});
});
