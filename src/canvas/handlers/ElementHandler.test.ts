import * as fabric from 'fabric';
import { describe, expect, it } from 'vitest';

import ElementHandler from './ElementHandler';

describe('ElementHandler position', () => {
	it.each([
		{
			expectedLeft: 134,
			expectedTop: 99,
			name: '100% zoom',
			viewportTransform: [1, 0, 0, 1, 10, -5],
		},
		{
			expectedLeft: 244,
			expectedTop: 244,
			name: '200% zoom',
			viewportTransform: [2, 0, 0, 2, -40, 30],
		},
	])('uses the outer container coordinate plane at $name', ({ expectedLeft, expectedTop, viewportTransform }) => {
		const canvas = {
			viewportTransform,
			wrapperEl: {
				offsetLeft: 24,
				offsetTop: 24,
			},
		};
		const handler = new ElementHandler({ canvas } as any);
		const object = new fabric.Rect({
			height: 60,
			left: 100,
			strokeWidth: 0,
			top: 80,
			width: 120,
		});
		const overlay = { style: {} } as HTMLElement;

		handler.setPosition(overlay, object);

		expect(overlay.style.left).toBe(`${expectedLeft}px`);
		expect(overlay.style.top).toBe(`${expectedTop}px`);
	});
});
