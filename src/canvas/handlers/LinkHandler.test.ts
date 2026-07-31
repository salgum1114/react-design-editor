import { describe, expect, it, vi } from 'vitest';

vi.mock('mediaelement', () => ({}));

import LinkHandler from './LinkHandler';

describe('LinkHandler batch creation', () => {
	it('defers object refresh and rendering while a batch is active', () => {
		const fromPort = {
			id: 'output-1',
			setConnected: vi.fn(),
		};
		const toPort = {
			id: 'input-1',
			setConnected: vi.fn(),
		};
		const fromNode = {
			fromPort: [fromPort],
			id: 'timer-1',
		};
		const toNode = {
			id: 'delay-1',
			toPort,
		};
		const link = {
			setPort: vi.fn(),
		};
		const handler: any = {
			canvas: {
				add: vi.fn(),
				renderAll: vi.fn(),
				requestRenderAll: vi.fn(),
				sendObjectToBack: vi.fn(),
			},
			editable: true,
			fabricObjects: {
				link: {
					create: vi.fn(() => link),
				},
			},
			getObjects: vi.fn(),
			isBatching: vi.fn(() => true),
			objectMap: {
				'delay-1': toNode,
				'timer-1': fromNode,
			},
			onAdd: vi.fn(),
			portHandler: {
				setCoords: vi.fn(),
			},
		};
		const linkHandler = new LinkHandler(handler);

		linkHandler.create({
			type: 'link',
			fromNodeId: 'timer-1',
			fromPortId: 'output-1',
			toNodeId: 'delay-1',
			toPortId: 'input-1',
		});

		expect(handler.canvas.add).toHaveBeenCalledWith(link);
		expect(handler.getObjects).not.toHaveBeenCalled();
		expect(handler.canvas.renderAll).not.toHaveBeenCalled();
		expect(handler.canvas.requestRenderAll).not.toHaveBeenCalled();
		expect(handler.canvas.sendObjectToBack).not.toHaveBeenCalled();
		expect(handler.portHandler.setCoords).not.toHaveBeenCalled();
		expect(handler.onAdd).toHaveBeenCalledWith(link);
	});
});
