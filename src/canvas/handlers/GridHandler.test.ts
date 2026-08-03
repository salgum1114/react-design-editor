// @vitest-environment jsdom

import * as fabric from 'fabric';
import { describe, expect, it, vi } from 'vitest';

import GridHandler from './GridHandler';

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
});
