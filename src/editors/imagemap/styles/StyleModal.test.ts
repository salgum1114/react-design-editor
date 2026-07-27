import { describe, expect, it, vi } from 'vitest';

import { initializeStylePreview } from './stylePreview';

describe('initializeStylePreview', () => {
	it('adds and centers the marker before applying the style', () => {
		const preview = { setCoords: vi.fn() };
		const handler = {
			add: vi.fn(() => preview),
			setById: vi.fn(),
		};
		const canvas = {
			centerObject: vi.fn(),
			requestRenderAll: vi.fn(),
		};

		initializeStylePreview(handler as any, canvas as any, {
			fill: 'rgba(10, 20, 30, 1)',
			opacity: 0.5,
		});

		expect(handler.add).toHaveBeenCalledOnce();
		expect(canvas.centerObject).toHaveBeenCalledWith(preview);
		expect(preview.setCoords).toHaveBeenCalledOnce();
		expect(handler.setById).toHaveBeenNthCalledWith(1, 'styles', 'fill', 'rgba(10, 20, 30, 1)');
		expect(handler.setById).toHaveBeenNthCalledWith(2, 'styles', 'opacity', 0.5);
		expect(canvas.requestRenderAll).toHaveBeenCalledOnce();
	});
});
