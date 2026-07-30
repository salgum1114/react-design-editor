import * as fabric from 'fabric';
import { describe, expect, it, vi } from 'vitest';

import TransactionHandler from './TransactionHandler';

vi.mock('fabric', async importOriginal => {
	const actual = await importOriginal<typeof import('fabric')>();
	return {
		...actual,
		util: {
			...actual.util,
			enlivenObjects: vi.fn(),
		},
	};
});

const createHandler = () => {
	const workarea = { id: 'workarea' };
	const restoredObject = { id: 'marker-1', type: 'i-text' };
	let canvasObjects: any[] = [workarea];
	let activeObject: any = restoredObject;

	const canvas = {
		discardActiveObject: vi.fn(),
		getActiveObject: vi.fn(() => activeObject),
		getObjects: vi.fn(() => canvasObjects),
		insertAt: vi.fn((_index: number, object: any) => {
			canvasObjects.push(object);
		}),
		renderAll: vi.fn(),
		renderOnAddRemove: true,
		requestRenderAll: vi.fn(),
		setActiveObject: vi.fn((object: any) => {
			activeObject = object;
		}),
		toJSON: vi.fn(() => ({
			objects: [{ type: 'image' }, { type: 'i-text' }],
		})),
		toObject: vi.fn(() => ({
			objects: [
				{ id: 'workarea', type: 'image' },
				{ id: 'marker-1', type: 'i-text' },
			],
		})),
	};

	const handler: any = {
		canvas,
		canvasActions: { transaction: true },
		clear: vi.fn(() => {
			canvasObjects = [workarea];
			activeObject = undefined;
		}),
		getObjects: vi.fn(() => canvasObjects.filter(object => object.id !== 'workarea')),
		linkHandler: { create: vi.fn() },
		onTransaction: vi.fn(),
		portHandler: { create: vi.fn() },
		propertiesToInclude: ['id', 'superType'],
	};

	return { canvas, handler, restoredObject };
};

describe('TransactionHandler', () => {
	it('serializes v6 snapshots with custom properties and excludes the workarea', () => {
		const { canvas, handler } = createHandler();
		const transaction = new TransactionHandler(handler);

		transaction.save('add');

		expect(canvas.toObject).toHaveBeenCalledWith(handler.propertiesToInclude);
		expect(canvas.toJSON).not.toHaveBeenCalled();
		expect((transaction as any).currentObjects).toEqual([{ id: 'marker-1', type: 'i-text' }]);
	});

	it('serializes active selection members in the canvas coordinate plane', () => {
		const first = new fabric.Rect({
			height: 40,
			left: 100,
			strokeWidth: 0,
			top: 120,
			width: 40,
		}) as any;
		const second = new fabric.Rect({
			height: 30,
			left: 300,
			strokeWidth: 0,
			top: 260,
			width: 60,
		}) as any;
		first.id = 'first';
		second.id = 'second';

		const selection = new fabric.ActiveSelection([first, second]);
		selection.set({
			left: selection.left + 120,
			top: selection.top + 70,
		});
		selection.setCoords();
		selection.getObjects().forEach(object => object.setCoords());

		const firstLocalPosition = { left: first.left, top: first.top };
		const secondLocalPosition = { left: second.left, top: second.top };
		const firstCanvasPosition = first.getBoundingRect();
		const secondCanvasPosition = second.getBoundingRect();
		const canvasObjects = [first, second];
		const canvas = {
			getActiveObject: vi.fn(() => selection),
			getObjects: vi.fn(() => canvasObjects),
			toObject: vi.fn((propertiesToInclude: string[]) => ({
				objects: canvasObjects.map(object => object.toObject(propertiesToInclude)),
			})),
		};
		const handler: any = {
			canvas,
			canvasActions: { transaction: true },
			propertiesToInclude: ['id'],
		};
		const transaction = new TransactionHandler(handler);

		transaction.save('moved');

		const snapshot = (transaction as any).currentObjects;
		expect(snapshot[0].left).toBeCloseTo(firstCanvasPosition.left);
		expect(snapshot[0].top).toBeCloseTo(firstCanvasPosition.top);
		expect(snapshot[1].left).toBeCloseTo(secondCanvasPosition.left);
		expect(snapshot[1].top).toBeCloseTo(secondCanvasPosition.top);
		expect({ left: first.left, top: first.top }).toEqual(firstLocalPosition);
		expect({ left: second.left, top: second.top }).toEqual(secondLocalPosition);
	});

	it('restores the selected object after replay when it still exists', async () => {
		const { canvas, handler, restoredObject } = createHandler();
		const transaction = new TransactionHandler(handler);
		vi.mocked(fabric.util.enlivenObjects).mockResolvedValue([restoredObject] as any);

		transaction.replay({
			type: 'redo',
			json: JSON.stringify([{ id: 'marker-1', type: 'i-text' }]),
		});

		await vi.waitFor(() => {
			expect(canvas.setActiveObject).toHaveBeenCalledWith(restoredObject);
			expect(handler.onTransaction).toHaveBeenCalled();
		});
	});

	it('keeps existing canvas objects visible while replay objects are enlivening', async () => {
		const { handler, restoredObject } = createHandler();
		const transaction = new TransactionHandler(handler);
		let resolveEnliven: (objects: any[]) => void = () => undefined;
		const enlivening = new Promise<any[]>(resolve => {
			resolveEnliven = resolve;
		});
		vi.mocked(fabric.util.enlivenObjects).mockReturnValue(enlivening as any);

		transaction.replay({
			type: 'undo',
			json: JSON.stringify([{ id: 'marker-1', type: 'i-text' }]),
		});

		expect(handler.clear).not.toHaveBeenCalled();

		resolveEnliven([restoredObject]);
		await vi.waitFor(() => expect(handler.clear).toHaveBeenCalledTimes(1));
	});

	it('retains the selected id across an undo that temporarily removes the object', async () => {
		const { canvas, handler, restoredObject } = createHandler();
		const transaction = new TransactionHandler(handler);
		vi.mocked(fabric.util.enlivenObjects)
			.mockResolvedValueOnce([] as any)
			.mockResolvedValueOnce([restoredObject] as any);

		transaction.replay({
			type: 'undo',
			json: JSON.stringify([]),
		});
		await vi.waitFor(() => expect(handler.onTransaction).toHaveBeenCalledTimes(1));

		transaction.replay({
			type: 'redo',
			json: JSON.stringify([{ id: 'marker-1', type: 'i-text' }]),
		});

		await vi.waitFor(() => {
			expect(canvas.setActiveObject).toHaveBeenCalledWith(restoredObject);
			expect(handler.onTransaction).toHaveBeenCalledTimes(2);
		});
	});
});
