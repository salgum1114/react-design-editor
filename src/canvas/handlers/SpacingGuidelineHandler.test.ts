import * as fabric from 'fabric';
import { describe, expect, it, vi } from 'vitest';

import { defaults } from '../constants';
import SpacingGuidelineHandler from './SpacingGuidelineHandler';

const createContext = () =>
	({
		beginPath: vi.fn(),
		fill: vi.fn(),
		fillRect: vi.fn(),
		fillText: vi.fn(),
		lineTo: vi.fn(),
		measureText: vi.fn(() => ({ width: 28 })),
		moveTo: vi.fn(),
		restore: vi.fn(),
		roundRect: vi.fn(),
		save: vi.fn(),
		stroke: vi.fn(),
		transform: vi.fn(),
	}) as unknown as CanvasRenderingContext2D;

const createRect = (left: number, top: number, width = 100, height = 100) => {
	const rect = new fabric.Rect({
		height,
		left: 0,
		strokeWidth: 0,
		top: 0,
		width,
	});
	rect.setPositionByOrigin(new fabric.Point(left, top), 'left', 'top');
	return rect;
};

const createFixture = (
	objects: fabric.FabricObject[],
	zoom = 1,
	viewportTransform: fabric.TMat2D = [zoom, 0, 0, zoom, 0, 0],
	spacingOptions: Record<string, unknown> = {},
) => {
	const context = createContext();
	const canvas = {
		_currentTransform: {},
		clearContext: vi.fn(),
		getObjects: vi.fn(() => objects),
		getSelectionContext: vi.fn(() => context),
		getZoom: vi.fn(() => zoom),
		off: vi.fn(),
		on: vi.fn(),
		requestRenderAll: vi.fn(),
		viewportTransform,
	};
	const handler: any = {
		canvas,
		guidelineOption: {
			enabled: true,
			spacing: {
				color: '#0f9f8f',
				enabled: true,
				snap: true,
				snapMargin: 4,
				threshold: 80,
				...spacingOptions,
			},
		},
	};
	const spacingGuidelineHandler = new SpacingGuidelineHandler(handler);
	handler.spacingGuidelineHandler = spacingGuidelineHandler;

	return { canvas, context, spacingGuidelineHandler };
};

describe('SpacingGuidelineHandler measurements', () => {
	it('shows only the nearest object in each direction inside the screen threshold', () => {
		const nearestLeft = createRect(0, 100);
		const fartherLeft = createRect(-140, 100);
		const target = createRect(140, 100);
		const nearRight = createRect(280, 100);
		const farRight = createRect(500, 100);
		const { spacingGuidelineHandler } = createFixture(
			[fartherLeft, nearestLeft, target, nearRight, farRight],
			1,
			[1, 0, 0, 1, 0, 0],
			{ snap: false },
		);

		spacingGuidelineHandler.movingGuidelines(target);

		expect(spacingGuidelineHandler.guides).toEqual([
			expect.objectContaining({
				axis: 'horizontal',
				distance: 40,
				end: 140,
				kind: 'distance',
				start: 100,
			}),
			expect.objectContaining({
				axis: 'horizontal',
				distance: 40,
				end: 280,
				kind: 'distance',
				start: 240,
			}),
		]);
	});

	it('keeps the proximity threshold stable in screen pixels', () => {
		const reference = createRect(0, 100);
		const target = createRect(250, 100);
		const { spacingGuidelineHandler } = createFixture([reference, target], 0.5);

		spacingGuidelineHandler.movingGuidelines(target);

		expect(spacingGuidelineHandler.guides).toEqual([
			expect.objectContaining({
				distance: 150,
			}),
		]);
	});

	it('ignores non-overlapping and distant objects during automatic measurement', () => {
		const distant = createRect(400, 100);
		const diagonal = createRect(140, 400);
		const target = createRect(140, 100);
		const { spacingGuidelineHandler } = createFixture([distant, diagonal, target]);

		spacingGuidelineHandler.movingGuidelines(target);

		expect(spacingGuidelineHandler.guides).toHaveLength(0);
	});

	it('shows all directional object distances while Alt is held', () => {
		const left = createRect(0, 100);
		const farRight = createRect(500, 100);
		const diagonalRight = createRect(300, 400);
		const target = createRect(140, 100);
		const { spacingGuidelineHandler } = createFixture([left, target, farRight, diagonalRight]);

		spacingGuidelineHandler.movingGuidelines(target, { altKey: true } as MouseEvent);

		expect(spacingGuidelineHandler.guides).toHaveLength(3);
		expect(spacingGuidelineHandler.guides).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ distance: 40, end: 140, start: 100 }),
				expect.objectContaining({ distance: 260, end: 500, start: 240 }),
				expect.objectContaining({ distance: 60, end: 300, start: 240 }),
			]),
		);
	});

	it('treats an active selection as one boundary for Alt measurements', () => {
		const first = createRect(100, 100);
		const second = createRect(300, 100);
		const external = createRect(500, 100);
		const selection = new fabric.ActiveSelection([first, second]);
		const { spacingGuidelineHandler } = createFixture([first, second, external]);

		spacingGuidelineHandler.movingGuidelines(selection, { altKey: true } as MouseEvent);

		expect(spacingGuidelineHandler.guides).toHaveLength(1);
		expect(spacingGuidelineHandler.guides[0]).toEqual(
			expect.objectContaining({
				axis: 'horizontal',
				end: 500,
			}),
		);
	});

	it('measures automatic distances from each active selection member boundary', () => {
		const first = createRect(100, 200);
		const second = createRect(300, 260);
		const aboveFirst = createRect(100, 60);
		const aboveSecond = createRect(300, 120);
		const selection = new fabric.ActiveSelection([first, second]);
		const { spacingGuidelineHandler } = createFixture([aboveFirst, aboveSecond, first, second]);

		spacingGuidelineHandler.movingGuidelines(selection);

		expect(
			spacingGuidelineHandler.guides.filter(guide => guide.axis === 'vertical' && guide.kind === 'distance'),
		).toEqual([
			expect.objectContaining({
				cross: 150,
				distance: 40,
				end: 200,
				start: 160,
			}),
			expect.objectContaining({
				cross: 350,
				distance: 40,
				end: 260,
				start: 220,
			}),
		]);
	});

	it('deduplicates identical active selection member distance guides', () => {
		const first = createRect(100, 200);
		const second = createRect(100, 200);
		const external = createRect(100, 60);
		const selection = new fabric.ActiveSelection([first, second]);
		const { spacingGuidelineHandler } = createFixture([external, first, second]);

		spacingGuidelineHandler.movingGuidelines(selection);

		expect(
			spacingGuidelineHandler.guides.filter(guide => guide.axis === 'vertical' && guide.kind === 'distance'),
		).toEqual([
			expect.objectContaining({
				cross: 150,
				distance: 40,
				end: 200,
				start: 160,
			}),
		]);
	});

	it('excludes hidden objects from distance and snap candidates', () => {
		const hiddenReference = createRect(0, 100);
		hiddenReference.set({ visible: false });
		const target = createRect(140, 100);
		const { spacingGuidelineHandler } = createFixture([hiddenReference, target]);

		spacingGuidelineHandler.movingGuidelines(target, { altKey: true } as MouseEvent);

		expect(spacingGuidelineHandler.guides).toHaveLength(0);
	});
});

describe('SpacingGuidelineHandler equal spacing snap', () => {
	it('snaps a following object to the horizontal gap of two fixed objects', () => {
		const first = createRect(0, 100);
		const second = createRect(200, 100);
		const target = createRect(401, 100);
		const { spacingGuidelineHandler } = createFixture([first, second, target]);

		spacingGuidelineHandler.movingGuidelines(target);

		expect(target.getBoundingRect().left).toBe(400);
		expect(spacingGuidelineHandler.guides).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					axis: 'horizontal',
					distance: 100,
					end: 200,
					kind: 'equal',
					start: 100,
				}),
				expect.objectContaining({
					axis: 'horizontal',
					distance: 100,
					end: 400,
					kind: 'equal',
					start: 300,
				}),
			]),
		);
	});

	it('snaps a following object to the vertical gap of two fixed objects', () => {
		const first = createRect(100, 0);
		const second = createRect(100, 200);
		const target = createRect(100, 401);
		const { spacingGuidelineHandler } = createFixture([first, second, target]);

		spacingGuidelineHandler.movingGuidelines(target);

		expect(target.getBoundingRect().top).toBe(400);
		expect(spacingGuidelineHandler.guides).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					axis: 'vertical',
					distance: 100,
					kind: 'equal',
				}),
			]),
		);
	});

	it('centers an object between two fixed objects with equal gaps', () => {
		const first = createRect(0, 100);
		const second = createRect(500, 100);
		const target = createRect(249, 100);
		const { spacingGuidelineHandler } = createFixture([first, second, target]);

		spacingGuidelineHandler.movingGuidelines(target);

		expect(target.getBoundingRect().left).toBe(250);
		expect(
			spacingGuidelineHandler.guides.filter(guide => guide.axis === 'horizontal' && guide.kind === 'equal'),
		).toEqual([
			expect.objectContaining({ distance: 150, end: 250, start: 100 }),
			expect.objectContaining({ distance: 150, end: 500, start: 350 }),
		]);
	});

	it('keeps equal-spacing snap based on the active selection boundary', () => {
		const first = createRect(0, 100);
		const second = createRect(200, 100);
		const selectedFirst = createRect(401, 100);
		const selectedSecond = createRect(401, 300);
		const selection = new fabric.ActiveSelection([selectedFirst, selectedSecond]);
		const { spacingGuidelineHandler } = createFixture([first, second, selectedFirst, selectedSecond]);

		spacingGuidelineHandler.movingGuidelines(selection);

		expect(selection.getBoundingRect().left).toBe(400);
		expect(
			spacingGuidelineHandler.guides.filter(guide => guide.axis === 'horizontal' && guide.kind === 'equal'),
		).toEqual([
			expect.objectContaining({ distance: 100, end: 200, start: 100 }),
			expect.objectContaining({ distance: 100, end: 400, start: 300 }),
		]);
	});

	it('keeps equal-spacing snap tolerance stable in screen pixels', () => {
		const first = createRect(0, 100);
		const second = createRect(200, 100);
		const target = createRect(402.5, 100);
		const { spacingGuidelineHandler } = createFixture([first, second, target], 2);

		spacingGuidelineHandler.movingGuidelines(target);

		expect(target.getBoundingRect().left).toBe(402.5);
		expect(spacingGuidelineHandler.guides.every(guide => guide.kind !== 'equal')).toBe(true);
	});

	it('preserves simultaneous horizontal and vertical equal-spacing snaps', () => {
		const horizontalFirst = createRect(0, 401);
		const horizontalSecond = createRect(200, 401);
		const verticalFirst = createRect(401, 0);
		const verticalSecond = createRect(401, 200);
		const target = createRect(401, 401);
		const { spacingGuidelineHandler } = createFixture([
			horizontalFirst,
			horizontalSecond,
			verticalFirst,
			verticalSecond,
			target,
		]);

		spacingGuidelineHandler.movingGuidelines(target);

		expect(target.getBoundingRect().left).toBe(400);
		expect(target.getBoundingRect().top).toBe(400);
		expect(
			spacingGuidelineHandler.guides.some(guide => guide.axis === 'horizontal' && guide.kind === 'equal'),
		).toBe(true);
		expect(spacingGuidelineHandler.guides.some(guide => guide.axis === 'vertical' && guide.kind === 'equal')).toBe(
			true,
		);
	});

	it('does not snap or render equal guides on an axis reserved by alignment', () => {
		const first = createRect(0, 100);
		const second = createRect(200, 100);
		const target = createRect(401, 100);
		const { spacingGuidelineHandler } = createFixture([first, second, target]);

		spacingGuidelineHandler.movingGuidelines(target, undefined, {
			disabledSnapAxes: ['horizontal'],
		});

		expect(target.getBoundingRect().left).toBe(401);
		expect(
			spacingGuidelineHandler.guides.some(guide => guide.axis === 'horizontal' && guide.kind === 'equal'),
		).toBe(false);
	});
});

describe('SpacingGuidelineHandler contact snap', () => {
	it.each([
		['right', 102, 20, 100, 20],
		['left', -102, 20, -100, 20],
		['bottom', 20, 102, 20, 100],
		['top', 20, -102, 20, -100],
		['right overlap', 98, 20, 100, 20],
		['left overlap', -98, 20, -100, 20],
		['bottom overlap', 20, 98, 20, 100],
		['top overlap', 20, -98, 20, -100],
	])('snaps %s to a zero gap', (_direction, x, y, expectedX, expectedY) => {
		const reference = createRect(0, 0);
		const target = createRect(x, y);
		const { context, spacingGuidelineHandler } = createFixture([reference, target]);
		spacingGuidelineHandler.movingGuidelines(target);
		expect(target.getBoundingRect().left).toBe(expectedX);
		expect(target.getBoundingRect().top).toBe(expectedY);
		const contact = spacingGuidelineHandler.guides.find(guide => guide.distance === 0);
		expect(contact).toBeDefined();
		spacingGuidelineHandler.drawGuide(contact!);
		expect(context.fillText).toHaveBeenCalledWith('0 px', expect.any(Number), expect.any(Number));
	});

	it.each([
		[0.5, 106, 100],
		[2, 103, 103],
	])('uses screen-pixel tolerance at zoom %s', (zoom, x, expectedX) => {
		const reference = createRect(0, 0);
		const target = createRect(x, 20);
		const { spacingGuidelineHandler } = createFixture([reference, target], zoom);
		spacingGuidelineHandler.movingGuidelines(target);
		expect(target.getBoundingRect().left).toBe(expectedX);
	});

	it('does not snap separated diagonal objects or deeply overlapping objects', () => {
		for (const [x, y] of [
			[102, 200],
			[90, 20],
		]) {
			const reference = createRect(0, 0);
			const target = createRect(x, y);
			const { spacingGuidelineHandler } = createFixture([reference, target]);
			spacingGuidelineHandler.movingGuidelines(target);
			expect(target.getBoundingRect().left).toBe(x);
			expect(target.getBoundingRect().top).toBe(y);
		}
	});

	it.each([{ snap: false }, { enabled: false }])('respects disabled options %j', options => {
		const reference = createRect(0, 0);
		const target = createRect(102, 20);
		const { spacingGuidelineHandler } = createFixture([reference, target], 1, [1, 0, 0, 1, 0, 0], options);
		spacingGuidelineHandler.movingGuidelines(target);
		expect(target.getBoundingRect().left).toBe(102);
	});

	it('respects axes reserved by alignment', () => {
		const reference = createRect(0, 0);
		const target = createRect(102, 20);
		const { spacingGuidelineHandler } = createFixture([reference, target]);
		spacingGuidelineHandler.movingGuidelines(target, undefined, { disabledSnapAxes: ['horizontal'] });
		expect(target.getBoundingRect().left).toBe(102);
	});

	it('moves an active selection as one boundary and excludes its members', () => {
		const reference = createRect(0, 0);
		const first = createRect(102, 20);
		const second = createRect(202, 20);
		const selection = new fabric.ActiveSelection([first, second]);
		const { spacingGuidelineHandler } = createFixture([reference, first, second]);
		spacingGuidelineHandler.movingGuidelines(selection);
		expect(selection.getBoundingRect().left).toBe(100);
		expect(first.getBoundingRect().left).toBe(100);
		expect(second.getBoundingRect().left).toBe(200);
	});

	it('selects the nearest contact when multiple objects are within tolerance', () => {
		const first = createRect(0, 0);
		const closer = createRect(3, 0);
		const target = createRect(104, 20);
		const { spacingGuidelineHandler } = createFixture([first, closer, target]);
		spacingGuidelineHandler.movingGuidelines(target);
		expect(target.getBoundingRect().left).toBe(103);
	});
	it.each(['lockMovementX', 'lockMovementY'] as const)('preserves %s while snapping the free axis', lock => {
		const left = createRect(0, 101);
		const above = createRect(101, 0);
		const target = createRect(102, 102);
		target.set(lock, true);
		const { spacingGuidelineHandler } = createFixture([left, above, target]);
		spacingGuidelineHandler.movingGuidelines(target);
		expect(target.getBoundingRect().left).toBe(lock === 'lockMovementX' ? 102 : 100);
		expect(target.getBoundingRect().top).toBe(lock === 'lockMovementY' ? 102 : 100);
	});

	it('retains the nearest contact when a second axis would break adjacency', () => {
		const left = createRect(0, 0);
		const below = createRect(103, 202);
		const target = createRect(102, 99);
		const { spacingGuidelineHandler } = createFixture([left, below, target]);
		spacingGuidelineHandler.movingGuidelines(target);
		expect(target.getBoundingRect().left).toBe(100);
		expect(target.getBoundingRect().top).toBe(99);
		expect(spacingGuidelineHandler.guides.filter(guide => guide.distance === 0)).toEqual([
			expect.objectContaining({ axis: 'horizontal', start: 100, end: 100 }),
		]);
	});

	it('snaps both axes when approaching two adjacent objects', () => {
		const left = createRect(0, 101);
		const above = createRect(101, 0);
		const target = createRect(102, 102);
		const { spacingGuidelineHandler } = createFixture([left, above, target]);
		spacingGuidelineHandler.movingGuidelines(target);
		expect(target.getBoundingRect().left).toBe(100);
		expect(target.getBoundingRect().top).toBe(100);
		expect(spacingGuidelineHandler.guides.filter(guide => guide.distance === 0)).toHaveLength(2);
	});

	it('honors a custom snap margin and excludes the workarea', () => {
		const reference = createRect(0, 0);
		const target = createRect(102, 20);
		const { spacingGuidelineHandler } = createFixture([reference, target], 1, [1, 0, 0, 1, 0, 0], {
			snapMargin: 1,
		});
		spacingGuidelineHandler.movingGuidelines(target);
		expect(target.getBoundingRect().left).toBe(102);
		(reference as any).id = 'workarea';
		const fixture = createFixture([reference, target]);
		fixture.spacingGuidelineHandler.movingGuidelines(target);
		expect(target.getBoundingRect().left).toBe(102);
	});
});

describe('SpacingGuidelineHandler lifecycle and rendering', () => {
	it('enables proximity, equal-spacing snap, and Alt measurement by default', () => {
		expect(defaults.guidelineOption.spacing).toEqual({
			color: '#0f9f8f',
			enabled: true,
			labelBackgroundColor: '#0f172a',
			labelTextColor: '#ffffff',
			snap: true,
			snapMargin: 4,
			threshold: 80,
		});
	});

	it('subscribes and unsubscribes with the Fabric render lifecycle', () => {
		const { canvas, spacingGuidelineHandler } = createFixture([]);

		expect(canvas.on).toHaveBeenCalledWith({
			'after:render': spacingGuidelineHandler.afterRender,
			'before:render': spacingGuidelineHandler.beforeRender,
		});

		spacingGuidelineHandler.destroy();

		expect(canvas.off).toHaveBeenCalledWith({
			'after:render': spacingGuidelineHandler.afterRender,
			'before:render': spacingGuidelineHandler.beforeRender,
		});
	});

	it('does not measure or subscribe when spacing guides are disabled', () => {
		const reference = createRect(0, 100);
		const target = createRect(140, 100);
		const { canvas, spacingGuidelineHandler } = createFixture([reference, target], 1, [1, 0, 0, 1, 0, 0], {
			enabled: false,
		});

		spacingGuidelineHandler.movingGuidelines(target, { altKey: true } as MouseEvent);

		expect(canvas.on).not.toHaveBeenCalled();
		expect(spacingGuidelineHandler.guides).toHaveLength(0);
	});

	it('draws dimension lines through the complete viewport transform with screen-stable styling', () => {
		const viewportTransform: fabric.TMat2D = [2, 0.5, 0.25, 3, 10, 20];
		const { context, spacingGuidelineHandler } = createFixture([], 2, viewportTransform);

		spacingGuidelineHandler.drawGuide({
			axis: 'horizontal',
			cross: 150,
			distance: 40,
			end: 140,
			kind: 'distance',
			start: 100,
		});

		expect(context.transform).toHaveBeenCalledWith(...viewportTransform);
		expect(context.moveTo).toHaveBeenCalledWith(100, 150);
		expect(context.lineTo).toHaveBeenCalledWith(140, 150);
		expect(context.fillText).toHaveBeenCalledWith('40 px', 120, 150);
		expect(context.lineWidth).toBe(0.5);
		expect(context.font).toBe('6px sans-serif');
	});

	it('clears rendered guides after each Fabric render', () => {
		const { spacingGuidelineHandler } = createFixture([]);
		spacingGuidelineHandler.guides.push({
			axis: 'vertical',
			cross: 100,
			distance: 40,
			end: 140,
			kind: 'distance',
			start: 100,
		});
		const drawGuide = vi.spyOn(spacingGuidelineHandler, 'drawGuide');

		spacingGuidelineHandler.afterRender({} as any);

		expect(drawGuide).toHaveBeenCalledTimes(1);
		expect(spacingGuidelineHandler.guides).toHaveLength(0);
	});
});
