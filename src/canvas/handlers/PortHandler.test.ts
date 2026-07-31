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
			height: 60,
			left: 100,
			top: 100,
			width: 240,
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

		expect(handler.canvas.add).toHaveBeenCalledTimes(2);
		expect(handler.canvas.bringObjectToFront).not.toHaveBeenCalled();
	});
});
