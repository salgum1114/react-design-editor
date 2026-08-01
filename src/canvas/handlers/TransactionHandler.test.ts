import * as fabric from 'fabric';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
		add: vi.fn((...objects: any[]) => {
			canvasObjects.push(...objects);
		}),
		discardActiveObject: vi.fn(),
		fire: vi.fn(),
		getActiveObject: vi.fn(() => activeObject),
		getObjects: vi.fn(() => canvasObjects),
		insertAt: vi.fn((index: number, ...objects: any[]) => {
			canvasObjects.splice(index, 0, ...objects);
		}),
		moveObjectTo: vi.fn((object: any, index: number) => {
			canvasObjects = canvasObjects.filter(candidate => candidate !== object);
			canvasObjects.splice(index, 0, object);
		}),
		remove: vi.fn((...objects: any[]) => {
			canvasObjects = canvasObjects.filter(object => !objects.includes(object));
		}),
		renderAll: vi.fn(),
		renderOnAddRemove: true,
		requestRenderAll: vi.fn(),
		selection: true,
		setActiveObject: vi.fn((object: any) => {
			activeObject = object;
		}),
		skipTargetFind: false,
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
		bindObjectEvents: vi.fn(),
		canvas,
		canvasActions: { transaction: true },
		clear: vi.fn(() => {
			canvasObjects = [workarea];
			activeObject = undefined;
		}),
		eventHandler: {
			object: {
				mousedown: vi.fn(),
				mousedblclick: vi.fn(),
			},
		},
		getObjects: vi.fn(() => canvasObjects.filter(object => object.id !== 'workarea')),
		linkHandler: {
			create: vi.fn(),
			remove: vi.fn((object: any) => canvas.remove(object)),
		},
		objectMap: {},
		onTransaction: vi.fn(),
		portHandler: { create: vi.fn(), setCoords: vi.fn() },
		propertiesToInclude: ['id', 'superType'],
		runBatch: vi.fn((operation: () => void) => operation()),
	};

	return {
		canvas,
		getCanvasObjects: () => canvasObjects,
		handler,
		restoredObject,
		setCanvasObjects: (objects: any[]) => {
			canvasObjects = [workarea, ...objects];
		},
	};
};

afterEach(() => {
	vi.clearAllMocks();
});

describe('TransactionHandler', () => {
	it('serializes v6 snapshots with custom properties and excludes the workarea', () => {
		const { canvas, handler } = createHandler();
		const transaction = new TransactionHandler(handler);

		transaction.save('add');

		expect(canvas.toObject).toHaveBeenCalledWith(
			expect.arrayContaining([...handler.propertiesToInclude, 'onlyLeft', 'originStroke', 'selectedStroke']),
		);
		expect(canvas.toJSON).not.toHaveBeenCalled();
		expect((transaction as any).currentObjects).toEqual([{ id: 'marker-1', type: 'i-text' }]);
	});

	it('stores workflow relationships as endpoint ids without nested nodes or ports', () => {
		const { canvas, handler } = createHandler();
		const fromNode = {
			id: 'timer-1',
			superType: 'node',
			type: 'TriggerNode',
			fromPort: [{ id: 'output-1', nodeId: 'timer-1' }],
		};
		const toNode = {
			id: 'delay-1',
			superType: 'node',
			type: 'LogicNode',
			toPort: { id: 'input-1', nodeId: 'delay-1' },
		};
		canvas.toObject.mockReturnValue({
			objects: [
				{ id: 'workarea', type: 'image' },
				fromNode,
				toNode,
				{
					id: 'link-1',
					superType: 'link',
					type: 'link',
					fromNode,
					fromPort: fromNode.fromPort[0],
					objects: [{ type: 'path' }],
					toNode,
					toPort: toNode.toPort,
					originStroke: '#64748b',
				},
			],
		} as any);
		const transaction = new TransactionHandler(handler);

		transaction.save('add');

		const snapshot = (transaction as any).currentObjects;
		expect(snapshot[0]).not.toHaveProperty('fromPort');
		expect(snapshot[1]).not.toHaveProperty('toPort');
		expect(snapshot[2]).toMatchObject({
			id: 'link-1',
			fromNodeId: 'timer-1',
			fromPortId: 'output-1',
			toNodeId: 'delay-1',
			toPortId: 'input-1',
			originStroke: '#64748b',
		});
		expect(snapshot[2]).not.toHaveProperty('fromNode');
		expect(snapshot[2]).not.toHaveProperty('fromPort');
		expect(snapshot[2]).not.toHaveProperty('objects');
		expect(snapshot[2]).not.toHaveProperty('toNode');
		expect(snapshot[2]).not.toHaveProperty('toPort');
	});

	it('preserves ImageMap and native Fabric object payloads without workflow compaction', () => {
		const { canvas, handler } = createHandler();
		const imageMapObjects = [
			{
				id: 'image-1',
				type: 'image',
				filters: [{ type: 'Brightness', brightness: 0.25 }],
				clipPath: { type: 'circle', radius: 40 },
				tooltip: { enabled: true, template: 'status' },
			},
			{
				id: 'group-1',
				type: 'group',
				objects: [
					{ id: 'rect-1', type: 'rect', fill: '#22c55e' },
					{ id: 'text-1', type: 'i-text', text: 'Pump A' },
				],
				layoutManager: {
					type: 'layoutManager',
					strategy: 'fit-content',
				},
			},
			{
				id: 'element-1',
				superType: 'element',
				type: 'element',
				code: {
					css: '.status { color: green; }',
					html: '<div class="status">Running</div>',
					js: '',
				},
			},
		];
		canvas.toObject.mockReturnValue({
			objects: [{ id: 'workarea', type: 'image' }, ...imageMapObjects],
		} as any);
		const transaction = new TransactionHandler(handler);

		transaction.save('add');

		expect((transaction as any).currentObjects).toEqual(imageMapObjects);
	});

	it('restores generic Fabric objects in one batch and rebinds their object events', async () => {
		const { canvas, handler } = createHandler();
		const objectSnapshots = Array.from({ length: 600 }, (_, index) => ({
			id: `rect-${index}`,
			type: 'rect',
			left: index * 2,
			top: index,
		}));
		const restoredObjects = objectSnapshots.map(snapshot => ({
			...snapshot,
			dblclick: snapshot.id === 'rect-0',
			on: vi.fn(),
		}));
		const transaction = new TransactionHandler(handler);
		vi.mocked(fabric.util.enlivenObjects).mockResolvedValue(restoredObjects as any);

		await transaction.replay({
			type: 'undo',
			json: JSON.stringify(objectSnapshots),
		});

		expect(fabric.util.enlivenObjects).toHaveBeenCalledOnce();
		expect(fabric.util.enlivenObjects).toHaveBeenCalledWith(objectSnapshots);
		expect(canvas.add).toHaveBeenCalledOnce();
		expect(canvas.add).toHaveBeenCalledWith(...restoredObjects);
		expect(handler.bindObjectEvents).toHaveBeenCalledTimes(restoredObjects.length);
		expect(handler.portHandler.create).not.toHaveBeenCalled();
		expect(handler.linkHandler.create).not.toHaveBeenCalled();
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
		const firstCanvasPosition = first.getCenterPoint();
		const secondCanvasPosition = second.getCenterPoint();
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
		expect(snapshot[0].left).toBeCloseTo(firstCanvasPosition.x);
		expect(snapshot[0].top).toBeCloseTo(firstCanvasPosition.y);
		expect(snapshot[1].left).toBeCloseTo(secondCanvasPosition.x);
		expect(snapshot[1].top).toBeCloseTo(secondCanvasPosition.y);
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

	it('restores an active selection from its Fabric object members', async () => {
		const { canvas, handler } = createHandler();
		const first = new fabric.Rect({ height: 40, left: 10, top: 20, width: 40 }) as any;
		const second = new fabric.Rect({ height: 40, left: 90, top: 20, width: 40 }) as any;
		first.id = 'first';
		second.id = 'second';
		const activeSelection = new fabric.ActiveSelection([first, second], { canvas: canvas as any });
		canvas.setActiveObject(activeSelection);
		canvas.setActiveObject.mockClear();

		const restoredFirst = new fabric.Rect({ height: 40, left: 10, top: 20, width: 40 }) as any;
		const restoredSecond = new fabric.Rect({ height: 40, left: 90, top: 20, width: 40 }) as any;
		restoredFirst.id = 'first';
		restoredSecond.id = 'second';
		const transaction = new TransactionHandler(handler);
		vi.mocked(fabric.util.enlivenObjects).mockResolvedValue([restoredFirst, restoredSecond] as any);

		await transaction.replay({
			type: 'undo',
			json: JSON.stringify([
				{ height: 40, id: 'first', left: 10, top: 20, type: 'rect', width: 40 },
				{ height: 40, id: 'second', left: 90, top: 20, type: 'rect', width: 40 },
			]),
		});

		const restoredSelection = canvas.setActiveObject.mock.lastCall?.[0] as fabric.ActiveSelection;
		expect(restoredSelection).toBeInstanceOf(fabric.ActiveSelection);
		expect(restoredSelection.getObjects()).toEqual([restoredFirst, restoredSecond]);
	});

	it('uses the canonical Fabric snapshot when seeding imported objects', () => {
		const { canvas, handler } = createHandler();
		canvas.toObject.mockReturnValue({
			objects: [
				{ id: 'workarea', type: 'image' },
				{
					fromNodeId: 'timer-1',
					fromPortId: 'output-1',
					id: 'link-1',
					onlyLeft: true,
					originStroke: '#64748b',
					selectedStroke: '#3b82f6',
					superType: 'link',
					toNodeId: 'delay-1',
					toPortId: 'input-1',
					type: 'curvedLink',
				},
			],
		} as any);
		const transaction = new TransactionHandler(handler);

		transaction.setDefaultObjects();

		expect(canvas.toObject).toHaveBeenCalledWith(
			expect.arrayContaining([...handler.propertiesToInclude, 'onlyLeft', 'originStroke', 'selectedStroke']),
		);
		expect((transaction as any).currentObjects).toEqual([
			expect.objectContaining({
				id: 'link-1',
				onlyLeft: true,
				originStroke: '#64748b',
				selectedStroke: '#3b82f6',
			}),
		]);
	});

	it('keeps existing canvas objects visible while replay objects are enlivening', async () => {
		const { canvas, handler, restoredObject } = createHandler();
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
		expect(canvas.selection).toBe(false);
		expect(canvas.skipTargetFind).toBe(true);

		resolveEnliven([restoredObject]);
		await vi.waitFor(() => expect(handler.clear).toHaveBeenCalledTimes(1));
		expect(canvas.selection).toBe(true);
		expect(canvas.skipTargetFind).toBe(false);
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

	it('enlivens nodes once and restores links from compact endpoint snapshots', async () => {
		const { canvas, handler } = createHandler();
		const restoredTimer = { id: 'timer-1', superType: 'node', type: 'TriggerNode' };
		const restoredDelay = { id: 'delay-1', superType: 'node', type: 'LogicNode' };
		const timerSnapshot = {
			id: 'timer-1',
			superType: 'node',
			type: 'TriggerNode',
		};
		const delaySnapshot = {
			id: 'delay-1',
			superType: 'node',
			type: 'LogicNode',
		};
		const linkSnapshot = {
			id: 'link-1',
			superType: 'link',
			type: 'curvedLink',
			fromNodeId: 'timer-1',
			fromPortId: 'output-1',
			toNodeId: 'delay-1',
			toPortId: 'input-1',
			originStroke: '#64748b',
		};
		const restoredLink = { id: 'link-1', superType: 'link', type: 'curvedLink' };
		const transaction = new TransactionHandler(handler);
		vi.mocked(fabric.util.enlivenObjects).mockResolvedValue([restoredTimer, restoredDelay] as any);
		handler.linkHandler.create.mockReturnValue(restoredLink);

		transaction.replay({
			type: 'undo',
			json: JSON.stringify([timerSnapshot, delaySnapshot, linkSnapshot]),
		});

		await vi.waitFor(() => expect(handler.onTransaction).toHaveBeenCalledOnce());
		const enlivenedSnapshots = vi.mocked(fabric.util.enlivenObjects).mock.calls[0][0] as any[];
		expect(enlivenedSnapshots).toHaveLength(2);
		expect(enlivenedSnapshots[0]).toMatchObject(timerSnapshot);
		expect(enlivenedSnapshots[1]).toMatchObject(delaySnapshot);
		expect(handler.runBatch).toHaveBeenCalledOnce();
		expect(handler.getObjects).not.toHaveBeenCalled();
		expect(handler.linkHandler.create).toHaveBeenCalledWith(expect.objectContaining(linkSnapshot), true);
		expect(handler.portHandler.setCoords).toHaveBeenCalledTimes(2);
		expect(handler.portHandler.setCoords).toHaveBeenCalledWith(restoredTimer);
		expect(handler.portHandler.setCoords).toHaveBeenCalledWith(restoredDelay);
		expect(canvas.remove).toHaveBeenCalledWith(restoredLink);
		expect(canvas.insertAt).toHaveBeenCalledWith(1, restoredLink);
	});

	it('does not mutate undo or redo stacks while a replay is active', () => {
		const { handler } = createHandler();
		const transaction = new TransactionHandler(handler);
		const undo = { type: 'undo', json: '[]' } as const;
		const redo = { type: 'redo', json: '[]' } as const;
		transaction.undos = [undo];
		transaction.redos = [redo];
		transaction.active = true;
		const replay = vi.spyOn(transaction, 'replay').mockResolvedValue();

		transaction.undo();
		transaction.redo();

		expect(replay).not.toHaveBeenCalled();
		expect(transaction.undos).toEqual([undo]);
		expect(transaction.redos).toEqual([redo]);
	});

	it('restores the undo stack when replay fails before mutating the canvas', async () => {
		const { handler } = createHandler();
		const transaction = new TransactionHandler(handler);
		const undo = {
			type: 'undo',
			json: JSON.stringify([{ id: 'previous-marker', type: 'i-text' }]),
		} as const;
		const current = [{ id: 'current-marker', type: 'i-text' }] as any;
		transaction.setDefaultObjects(current);
		transaction.undos = [undo];
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		vi.mocked(fabric.util.enlivenObjects).mockRejectedValue(new Error('enliven failed'));

		transaction.undo();

		await vi.waitFor(() => {
			expect(transaction.undos).toEqual([undo]);
			expect(transaction.redos).toEqual([]);
		});
		expect((transaction as any).currentObjects).toEqual(current);
		expect(handler.clear).not.toHaveBeenCalled();
		expect(transaction.active).toBe(false);
		consoleError.mockRestore();
	});

	it('rolls the canvas back when replay fails after clearing existing objects', async () => {
		const { getCanvasObjects, handler, restoredObject, setCanvasObjects } = createHandler();
		const transaction = new TransactionHandler(handler);
		const currentSnapshot = [{ id: 'marker-1', type: 'i-text' }] as any;
		const restoredNode = { id: 'timer-1', superType: 'node', type: 'TriggerNode' };
		const targetSnapshot = [
			{ id: 'timer-1', superType: 'node', type: 'TriggerNode' },
			{
				fromNodeId: 'timer-1',
				fromPortId: 'output-1',
				id: 'link-1',
				superType: 'link',
				toNodeId: 'delay-1',
				toPortId: 'input-1',
				type: 'curvedLink',
			},
		];
		setCanvasObjects([restoredObject]);
		transaction.setDefaultObjects(currentSnapshot);
		vi.mocked(fabric.util.enlivenObjects)
			.mockResolvedValueOnce([restoredNode] as any)
			.mockResolvedValueOnce([restoredObject] as any);
		handler.linkHandler.create.mockImplementationOnce(() => {
			throw new Error('link failed');
		});
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(
			transaction.replay({
				type: 'undo',
				json: JSON.stringify(targetSnapshot),
			}),
		).rejects.toThrow('link failed');

		expect(handler.clear).toHaveBeenCalledTimes(2);
		expect(getCanvasObjects()).toEqual([{ id: 'workarea' }, restoredObject]);
		expect((transaction as any).currentObjects).toEqual(currentSnapshot);
		expect(transaction.active).toBe(false);
		consoleError.mockRestore();
	});

	it('keeps the internal snapshot aligned with the partial canvas when rollback also fails', async () => {
		const { canvas, getCanvasObjects, handler, setCanvasObjects } = createHandler();
		const transaction = new TransactionHandler(handler);
		const fallbackNode = { id: 'fallback-node', superType: 'node', type: 'LogicNode' };
		const targetNode = { id: 'target-node', superType: 'node', type: 'TriggerNode' };
		const fallbackSnapshot = [
			fallbackNode,
			{
				fromNodeId: 'fallback-node',
				fromPortId: 'fallback-output',
				id: 'fallback-link',
				superType: 'link',
				toNodeId: 'fallback-node',
				toPortId: 'fallback-input',
				type: 'curvedLink',
			},
		] as any;
		const targetSnapshot = [
			targetNode,
			{
				fromNodeId: 'target-node',
				fromPortId: 'target-output',
				id: 'target-link',
				superType: 'link',
				toNodeId: 'target-node',
				toPortId: 'target-input',
				type: 'curvedLink',
			},
		];
		setCanvasObjects([fallbackNode]);
		canvas.toObject.mockImplementation(() => ({ objects: getCanvasObjects() }) as any);
		transaction.setDefaultObjects(fallbackSnapshot);
		vi.mocked(fabric.util.enlivenObjects)
			.mockResolvedValueOnce([targetNode] as any)
			.mockResolvedValueOnce([fallbackNode] as any);
		handler.linkHandler.create.mockImplementation(() => {
			throw new Error('link factory unavailable');
		});
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

		await expect(
			transaction.replay({
				type: 'undo',
				json: JSON.stringify(targetSnapshot),
			}),
		).rejects.toThrow('link factory unavailable');

		expect(getCanvasObjects()).toEqual([{ id: 'workarea' }, fallbackNode]);
		expect((transaction as any).currentObjects).toHaveLength(1);
		expect((transaction as any).currentObjects[0]).toMatchObject({ id: 'fallback-node' });
		consoleError.mockRestore();
	});
});
