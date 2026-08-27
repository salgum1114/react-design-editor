// @vitest-environment jsdom

import * as fabric from 'fabric';
import { describe, expect, it, vi } from 'vitest';

import GridHandler from './GridHandler';
import PortHandler from './PortHandler';

describe('GridHandler', () => {
	it('snaps a center-origin object by its top-left position', () => {
		const handler = {
			canvas: {},
			canvasOption: {},
			gridOption: {
				enabled: false,
				grid: 20,
				snapToGrid: true,
			},
			isActiveSelection: () => false,
			portHandler: {
				setCoords: vi.fn(),
			},
		};
		const gridHandler = new GridHandler(handler as any);
		const target = new fabric.Rect({
			height: 60,
			left: 153,
			strokeWidth: 0,
			top: 97,
			width: 100,
		});
		handler.gridOption.enabled = true;

		gridHandler.setCoords(target as any);

		expect(target.getPointByOrigin('left', 'top')).toMatchObject({ x: 100, y: 60 });
		expect(target.getCenterPoint()).toMatchObject({ x: 150, y: 90 });
	});

	it('updates ports after snapping nodes in an active selection', () => {
		const handler = {
			canvas: {},
			canvasOption: {},
			gridOption: {
				enabled: false,
				grid: 20,
				snapToGrid: true,
			},
			isActiveSelection: (target: fabric.FabricObject) => target.isType('ActiveSelection'),
		};
		const gridHandler = new GridHandler(handler as any);
		handler.gridOption.enabled = true;
		const node = new fabric.Rect({
			height: 60,
			left: 103,
			strokeWidth: 0,
			top: 87,
			width: 120,
		}) as any;
		node.superType = 'node';
		node.toPort = {
			links: [],
			setPosition: vi.fn(),
		};
		const selection = new fabric.ActiveSelection([
			node,
			new fabric.Rect({ height: 40, left: 360, top: 240, width: 40 }),
		]);
		(handler as any).portHandler = new PortHandler(handler as any);

		expect(() => gridHandler.setCoords(selection)).not.toThrow();
		expect(node.toPort.setPosition).toHaveBeenCalledOnce();
	});
});
