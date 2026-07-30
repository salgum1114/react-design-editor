import * as fabric from 'fabric';
import { describe, expect, it, vi } from 'vitest';

import GuidelineHandler from './GuidelineHandler';

const createContext = () =>
	({
		beginPath: vi.fn(),
		lineTo: vi.fn(),
		moveTo: vi.fn(),
		restore: vi.fn(),
		save: vi.fn(),
		stroke: vi.fn(),
		transform: vi.fn(),
	}) as unknown as CanvasRenderingContext2D;

const createRect = (options: fabric.TOptions<fabric.RectProps>) =>
	new fabric.Rect({
		height: 100,
		strokeWidth: 0,
		width: 100,
		...options,
	});

const createGuidelineFixture = (
	objects: fabric.FabricObject[],
	zoom = 1,
	viewportTransform: fabric.TMat2D = [zoom, 0, 0, zoom, 0, 0],
) => {
	const context = createContext();
	const canvas = {
		_currentTransform: {},
		clearContext: vi.fn(),
		getHeight: vi.fn(() => 600),
		getObjects: vi.fn(() => objects),
		getSelectionContext: vi.fn(() => context),
		getWidth: vi.fn(() => 800),
		getZoom: vi.fn(() => zoom),
		off: vi.fn(),
		on: vi.fn(),
		viewportTransform,
	};
	const handler: any = {
		canvas,
		guidelineOption: {
			enabled: true,
		},
	};
	const guidelineHandler = new GuidelineHandler(handler);
	handler.guidelineHandler = guidelineHandler;

	return { canvas, context, guidelineHandler };
};

describe('GuidelineHandler Fabric v6 coordinates', () => {
	it('aligns to the scene bounds of a scaled object at non-default zoom', () => {
		const reference = createRect({
			left: 100,
			scaleX: 2,
			top: 100,
		});
		const target = createRect({
			left: 200,
			top: 300,
		});
		const { guidelineHandler } = createGuidelineFixture([reference, target], 2);

		guidelineHandler.movingGuidelines(target);

		expect(guidelineHandler.verticalLines).toContainEqual(
			expect.objectContaining({
				x: 300,
			}),
		);
		expect(target.left).toBe(200);
	});

	it('keeps the snap tolerance at four screen pixels when zoomed out', () => {
		const reference = createRect({
			left: 100,
			top: 100,
		});
		const target = createRect({
			left: 106,
			top: 300,
		});
		const { guidelineHandler } = createGuidelineFixture([reference, target], 0.5);

		guidelineHandler.movingGuidelines(target);

		expect(target.left).toBe(100);
		expect(guidelineHandler.verticalLines.length).toBeGreaterThan(0);
	});

	it('does not snap beyond four screen pixels when zoomed in', () => {
		const reference = createRect({
			left: 100,
			top: 100,
		});
		const target = createRect({
			left: 103,
			top: 300,
		});
		const { guidelineHandler } = createGuidelineFixture([reference, target], 2);

		guidelineHandler.movingGuidelines(target);

		expect(target.left).toBe(103);
		expect(guidelineHandler.verticalLines).toHaveLength(0);
	});

	it('uses the fullscreen workarea scene edge instead of the canvas viewport edge', () => {
		const workarea = createRect({
			height: 400,
			left: 0,
			top: 0,
			width: 600,
		}) as fabric.Rect & {
			id: string;
			layout: string;
		};
		workarea.id = 'workarea';
		workarea.layout = 'fullscreen';
		const target = createRect({
			left: 500,
			top: 500,
		});
		const { guidelineHandler } = createGuidelineFixture([workarea, target]);

		guidelineHandler.movingGuidelines(target);

		expect(guidelineHandler.verticalLines).toContainEqual(
			expect.objectContaining({
				x: 600,
			}),
		);
	});

	it('refreshes a workarea boundary after its scale changes', () => {
		const workarea = createRect({
			height: 400,
			left: 0,
			top: 0,
			width: 300,
		}) as fabric.Rect & {
			id: string;
			layout: string;
		};
		workarea.id = 'workarea';
		workarea.layout = 'fullscreen';
		workarea.setCoords();
		const target = createRect({
			left: 200,
			top: 500,
		});
		const { guidelineHandler } = createGuidelineFixture([workarea, target]);
		const setCoords = vi.spyOn(workarea, 'setCoords');

		guidelineHandler.movingGuidelines(target);
		expect(setCoords).toHaveBeenCalledTimes(1);
		expect(guidelineHandler.verticalLines).toContainEqual(
			expect.objectContaining({
				x: 300,
			}),
		);

		guidelineHandler.verticalLines.length = 0;
		workarea.set({
			scaleX: 2,
		});
		target.set({
			left: 500,
		});
		guidelineHandler.movingGuidelines(target);

		expect(setCoords).toHaveBeenCalledTimes(2);
		expect(guidelineHandler.verticalLines).toContainEqual(
			expect.objectContaining({
				x: 600,
			}),
		);

		guidelineHandler.movingGuidelines(target);
		expect(setCoords).toHaveBeenCalledTimes(2);
	});

	it('refreshes scaled bounds when strokeUniform changes', () => {
		const reference = createRect({
			left: 100,
			scaleX: 2,
			stroke: '#000000',
			strokeUniform: false,
			strokeWidth: 10,
			top: 100,
		});
		const target = createRect({
			left: 500,
			top: 400,
		});
		const { guidelineHandler } = createGuidelineFixture([reference, target]);

		guidelineHandler.movingGuidelines(target);
		guidelineHandler.verticalLines.length = 0;
		reference.set({
			strokeUniform: true,
		});
		target.set({
			left: 210,
		});
		guidelineHandler.movingGuidelines(target);

		expect(guidelineHandler.verticalLines).toContainEqual(
			expect.objectContaining({
				x: 310,
			}),
		);
	});

	it('draws scene coordinates through the complete viewport transform', () => {
		const viewportTransform: fabric.TMat2D = [2, 0.5, 0.25, 3, 10, 20];
		const { canvas, context, guidelineHandler } = createGuidelineFixture([]);
		canvas.viewportTransform = viewportTransform;
		canvas.getZoom.mockReturnValue(2);

		guidelineHandler.drawLine(10, 20, 30, 40);

		expect(context.transform).toHaveBeenCalledWith(...viewportTransform);
		expect(context.moveTo).toHaveBeenCalledWith(10, 20);
		expect(context.lineTo).toHaveBeenCalledWith(30, 40);
	});

	it('does not offset a guideline in scene coordinates before zooming', () => {
		const { context, guidelineHandler } = createGuidelineFixture([], 2);

		guidelineHandler.drawVerticalLine({
			x: 100,
			y1: 20,
			y2: 40,
		});

		expect(context.moveTo).toHaveBeenCalledWith(100, 20);
		expect(context.lineTo).toHaveBeenCalledWith(100, 40);
	});

	it('does not align an active selection against its own objects', () => {
		const first = createRect({
			left: 100,
			top: 100,
		});
		const second = createRect({
			left: 300,
			top: 300,
		});
		const selection = new fabric.ActiveSelection([first, second]);
		const { guidelineHandler } = createGuidelineFixture([first, second]);

		guidelineHandler.movingGuidelines(selection);

		expect(guidelineHandler.verticalLines).toHaveLength(0);
		expect(guidelineHandler.horizontalLines).toHaveLength(0);
	});

	it('aligns an active selection outer edge with an external object', () => {
		const first = createRect({
			left: 100,
			top: 100,
		});
		const second = createRect({
			left: 300,
			top: 300,
		});
		const reference = createRect({
			left: 100,
			top: 600,
		});
		const selection = new fabric.ActiveSelection([first, second]);
		const { guidelineHandler } = createGuidelineFixture([first, second, reference]);

		guidelineHandler.movingGuidelines(selection);

		expect(guidelineHandler.verticalLines).toContainEqual(
			expect.objectContaining({
				x: 100,
			}),
		);
	});

	it('keeps both axis snaps when horizontal and vertical guides overlap', () => {
		const horizontalReference = createRect({
			left: 100,
			top: 100,
		});
		const verticalReference = createRect({
			left: 300,
			top: 300,
		});
		const target = createRect({
			left: 302,
			top: 102,
		});
		const { guidelineHandler } = createGuidelineFixture([
			horizontalReference,
			verticalReference,
			target,
		]);

		guidelineHandler.movingGuidelines(target);

		expect(guidelineHandler.verticalLines.length).toBeGreaterThan(0);
		expect(guidelineHandler.horizontalLines.length).toBeGreaterThan(0);
		expect(target.left).toBe(300);
		expect(target.top).toBe(100);
	});
});
