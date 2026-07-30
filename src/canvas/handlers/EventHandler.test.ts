import * as fabric from 'fabric';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaults } from '../constants';
import EventHandler from './EventHandler';

const createTarget = (left = 20, top = 30) => {
	const target = new fabric.Rect({
		height: 40,
		left,
		top,
		width: 40,
	}) as any;
	target.superType = 'shape';
	return target;
};

const createEventFixture = (
	axisLock = true,
	guidelineEnabled = false,
	dragDuplicate = true,
) => {
	const wrapperEl = {
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		style: {},
		tabIndex: 0,
	};
	const canvasObjects: fabric.FabricObject[] = [];
	const canvas = {
		add: vi.fn((object: fabric.FabricObject) => {
			canvasObjects.push(object);
		}),
		discardActiveObject: vi.fn(),
		fire: vi.fn(),
		getActiveObject: vi.fn(),
		getObjects: vi.fn(() => canvasObjects),
		getZoom: vi.fn(() => 1),
		off: vi.fn(),
		on: vi.fn(),
		remove: vi.fn((object: fabric.FabricObject) => {
			const index = canvasObjects.indexOf(object);
			if (index >= 0) {
				canvasObjects.splice(index, 1);
			}
		}),
		renderAll: vi.fn(),
		requestRenderAll: vi.fn(),
		setActiveObject: vi.fn(),
		viewportTransform: [1, 0, 0, 1, 0, 0],
		wrapperEl,
	};
	const guidelineHandler = {
		horizontalLines: [] as unknown[],
		movingGuidelines: vi.fn(),
		verticalLines: [] as unknown[],
		viewportTransform: canvas.viewportTransform,
		zoom: 1,
	};
	const spacingGuidelineHandler = {
		clear: vi.fn(),
		movingGuidelines: vi.fn(),
	};
	const handler = {
		activeSelectionOption: {},
		canvas,
		canvasActions: {
			axisLock,
			clipboard: false,
			dragDuplicate,
			grab: false,
		},
		cropHandler: {
			moving: vi.fn(),
		},
		editable: true,
		elementHandler: {
			findById: vi.fn(),
			setPosition: vi.fn(),
			setPositionByOrigin: vi.fn(),
		},
		gridHandler: {
			getSnappedPosition: vi.fn((target: fabric.FabricObject) => ({
				left: target.left,
				top: target.top,
			})),
			setCoords: vi.fn(),
		},
		getObjects: vi.fn(() => canvasObjects),
		guidelineHandler,
		guidelineOption: {
			enabled: guidelineEnabled,
		},
		interactionMode: 'selection',
		interactionHandler: {
			isDrawingMode: vi.fn(() => false),
			selection: vi.fn(),
		},
		isActiveSelection: (target: fabric.FabricObject) => target.isType('ActiveSelection'),
		linkHandler: {
			create: vi.fn(),
		},
		nodeHandler: {
			getNodePath: vi.fn(),
			selectByPath: vi.fn(),
		},
		objects: canvasObjects,
		onClick: vi.fn(),
		onAdd: vi.fn(),
		onModified: vi.fn(),
		onMoving: vi.fn(),
		portHandler: {
			create: vi.fn(),
			setCoords: vi.fn(),
		},
		propertiesToInclude: ['cloneable', 'id', 'superType'],
		shouldHighlightPathOnSelect: false,
		shortcutHandler: {
			isEscape: vi.fn((event: KeyboardEvent) => event.code === 'Escape'),
			isSpace: vi.fn(() => false),
			isW: vi.fn(() => false),
		},
		spacingGuidelineHandler,
		tooltipHandler: {
			hide: vi.fn(),
		},
		transactionHandler: {
			active: false,
			save: vi.fn(),
		},
	};

	const eventHandler = new EventHandler(handler as any);
	return { canvas, eventHandler, guidelineHandler, handler, spacingGuidelineHandler };
};

const installDragPreview = (target: fabric.FabricObject) => {
	const preview = new fabric.Rect({
		height: target.getScaledHeight(),
		width: target.getScaledWidth(),
	}) as any;
	preview.render = vi.fn();
	(target as any).cloneAsImage = vi.fn(() => preview);
	(target as any).__dragPreview = preview;
	return preview;
};

const beginDrag = (
	eventHandler: EventHandler,
	target: fabric.FabricObject,
	modifiers: Partial<Pick<MouseEvent, 'ctrlKey' | 'metaKey' | 'shiftKey'>> = {},
) => {
	installDragPreview(target);
	eventHandler.mousedown({
		e: {
			ctrlKey: false,
			metaKey: false,
			shiftKey: false,
			...modifiers,
		} as MouseEvent,
		subTargets: [],
		target,
	} as any);
};

const moveTarget = (
	eventHandler: EventHandler,
	target: fabric.FabricObject,
	left: number,
	top: number,
	shiftKey: boolean,
	modifiers: Partial<Pick<MouseEvent, 'ctrlKey' | 'metaKey'>> = {},
) => {
	target.set({ left, top });
	eventHandler.moving({
		e: {
			ctrlKey: false,
			metaKey: false,
			shiftKey,
			...modifiers,
		} as MouseEvent,
		target,
	} as any);
};

const createWorkflowNode = (id: string, left: number, top: number) => {
	const node = createTarget(left, top) as any;
	node.id = id;
	node.superType = 'node';
	node.fromPort = [];
	return node;
};

const createWorkflowPort = (node: any, id: string) => {
	const port = createTarget(node.left, node.top) as any;
	port.id = id;
	port.connected = false;
	port.connectedFill = '#22c55e';
	port.originFill = '#64748b';
	port.links = [];
	port.nodeId = node.id;
	port.setConnected = vi.fn((connected = false) => {
		port.connected = connected;
		port.set({ fill: connected ? port.connectedFill : port.originFill });
	});
	port.setPosition = vi.fn((left: number, top: number) => {
		port.set({ left, top });
		port.setCoords();
	});
	port.superType = 'port';
	return port;
};

const connectWorkflowNodes = (fromNode: any, toNode: any, id = 'source-link') => {
	const fromPort = createWorkflowPort(fromNode, 'defaultFromPort');
	const toPort = createWorkflowPort(toNode, 'defaultInPort');
	const link = createTarget() as any;
	Object.defineProperty(link, 'type', {
		configurable: true,
		value: 'link',
		writable: true,
	});
	link.id = id;
	link.fromNode = fromNode;
	link.fromPort = fromPort;
	link.superType = 'link';
	link.toNode = toNode;
	link.update = vi.fn();
	link.toObject = vi.fn(() => ({
		fromNode,
		fromPort,
		id,
		onlyLeft: true,
		originStroke: '#64748b',
		stroke: '#8a99a6',
		superType: 'link',
		toNode,
		toPort,
		type: 'link',
	}));
	link.toPort = toPort;
	fromNode.fromPort = [fromPort];
	toNode.toPort = toPort;
	fromPort.connected = true;
	toPort.connected = true;
	fromPort.links = [link];
	toPort.links = [link];
	return { fromPort, link, toPort };
};

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe('EventHandler Shift-drag axis lock', () => {
	it('is enabled by default', () => {
		expect(defaults.canvasActions.axisLock).toBe(true);
	});

	it('locks a horizontal drag to the starting top coordinate', () => {
		const { eventHandler } = createEventFixture();
		const target = createTarget();
		beginDrag(eventHandler, target);

		moveTarget(eventHandler, target, 80, 40, true);

		expect(target.left).toBe(80);
		expect(target.top).toBe(30);
	});

	it('locks a vertical drag to the starting left coordinate', () => {
		const { eventHandler } = createEventFixture();
		const target = createTarget();
		beginDrag(eventHandler, target);

		moveTarget(eventHandler, target, 30, 100, true);

		expect(target.left).toBe(20);
		expect(target.top).toBe(100);
	});

	it('keeps the initially selected axis stable for the drag session', () => {
		const { eventHandler } = createEventFixture();
		const target = createTarget();
		beginDrag(eventHandler, target);
		moveTarget(eventHandler, target, 80, 35, true);

		moveTarget(eventHandler, target, 90, 140, true);

		expect(target.left).toBe(90);
		expect(target.top).toBe(30);
	});

	it('restores free movement as soon as Shift is released', () => {
		const { eventHandler } = createEventFixture();
		const target = createTarget();
		beginDrag(eventHandler, target);
		moveTarget(eventHandler, target, 80, 35, true);

		moveTarget(eventHandler, target, 90, 70, false);

		expect(target.left).toBe(90);
		expect(target.top).toBe(70);
	});

	it('does not constrain movement when the option is disabled', () => {
		const { eventHandler } = createEventFixture(false);
		const target = createTarget();
		beginDrag(eventHandler, target);

		moveTarget(eventHandler, target, 80, 70, true);

		expect(target.left).toBe(80);
		expect(target.top).toBe(70);
	});

	it('applies the same constraint to an active selection', () => {
		const { eventHandler } = createEventFixture();
		const selection = new fabric.ActiveSelection([createTarget(), createTarget(80, 90)], {
			left: 20,
			top: 30,
		});
		beginDrag(eventHandler, selection);

		moveTarget(eventHandler, selection, 90, 45, true);

		expect(selection.left).toBe(90);
		expect(selection.top).toBe(30);
	});

	it('restores the locked coordinate after guideline snapping', () => {
		const { eventHandler, guidelineHandler } = createEventFixture(true, true);
		const target = createTarget();
		guidelineHandler.movingGuidelines.mockImplementation((movingTarget: fabric.FabricObject) => {
			movingTarget.set({ top: 99 });
		});
		beginDrag(eventHandler, target);

		moveTarget(eventHandler, target, 80, 35, true);

		expect(guidelineHandler.movingGuidelines).toHaveBeenCalledWith(target);
		expect(target.top).toBe(30);
	});

	it('measures spacing after alignment snapping and forwards the Alt modifier', () => {
		const { eventHandler, guidelineHandler, spacingGuidelineHandler } = createEventFixture(true, true);
		const target = createTarget();
		beginDrag(eventHandler, target);

		moveTarget(eventHandler, target, 80, 35, false);
		eventHandler.moving({
			e: { altKey: true, shiftKey: false } as MouseEvent,
			target,
		} as any);

		expect(spacingGuidelineHandler.movingGuidelines).toHaveBeenLastCalledWith(
			target,
			expect.objectContaining({ altKey: true }),
			expect.objectContaining({ disabledSnapAxes: [] }),
		);
		expect(guidelineHandler.movingGuidelines.mock.invocationCallOrder[1]).toBeLessThan(
			spacingGuidelineHandler.movingGuidelines.mock.invocationCallOrder[1],
		);
	});

	it('reserves an axis already consumed by alignment snapping', () => {
		const { eventHandler, guidelineHandler, spacingGuidelineHandler } = createEventFixture(true, true);
		const target = createTarget();
		guidelineHandler.movingGuidelines.mockImplementation(() => {
			guidelineHandler.verticalLines.push({ x: 80 });
		});
		beginDrag(eventHandler, target);

		moveTarget(eventHandler, target, 80, 35, false);

		expect(spacingGuidelineHandler.movingGuidelines).toHaveBeenCalledWith(
			target,
			expect.anything(),
			expect.objectContaining({
				disabledSnapAxes: ['horizontal'],
			}),
		);
	});

	it('reserves the Shift-locked axis from equal-spacing snap guides', () => {
		const { eventHandler, spacingGuidelineHandler } = createEventFixture(true, true);
		const target = createTarget();
		beginDrag(eventHandler, target);

		moveTarget(eventHandler, target, 80, 35, true);

		expect(spacingGuidelineHandler.movingGuidelines).toHaveBeenCalledWith(
			target,
			expect.anything(),
			expect.objectContaining({
				disabledSnapAxes: ['vertical'],
			}),
		);
	});

	it('does not run either guideline handler when guidelines are globally disabled', () => {
		const { eventHandler, guidelineHandler, spacingGuidelineHandler } = createEventFixture(true, false);
		const target = createTarget();
		beginDrag(eventHandler, target);

		moveTarget(eventHandler, target, 80, 35, false);

		expect(guidelineHandler.movingGuidelines).not.toHaveBeenCalled();
		expect(spacingGuidelineHandler.movingGuidelines).not.toHaveBeenCalled();
	});

	it('clears spacing guides when the drag ends', () => {
		const { eventHandler, spacingGuidelineHandler } = createEventFixture(true, true);
		const target = createTarget();

		eventHandler.mouseup({
			e: { shiftKey: false } as MouseEvent,
			isClick: false,
			target,
		} as any);

		expect(spacingGuidelineHandler.clear).toHaveBeenCalledTimes(1);
	});

	it('starts a new axis decision after mouse up', () => {
		const { eventHandler } = createEventFixture();
		const target = createTarget();
		beginDrag(eventHandler, target);
		moveTarget(eventHandler, target, 80, 35, true);
		eventHandler.mouseup({
			e: { shiftKey: false } as MouseEvent,
			isClick: false,
			target,
		} as any);
		beginDrag(eventHandler, target);

		moveTarget(eventHandler, target, 85, 100, true);

		expect(target.left).toBe(80);
		expect(target.top).toBe(100);
	});

	it('keeps the locked coordinate after final grid snapping', () => {
		const { eventHandler, handler } = createEventFixture();
		const target = createTarget(20, 33);
		handler.gridHandler.setCoords.mockImplementation((movingTarget: fabric.FabricObject) => {
			movingTarget.set({ left: 80, top: 30 });
		});
		beginDrag(eventHandler, target);
		moveTarget(eventHandler, target, 80, 38, true);

		eventHandler.moved({
			e: { shiftKey: true } as MouseEvent,
			target,
		} as any);

		expect(target.left).toBe(80);
		expect(target.top).toBe(33);
	});

	it('finishes a normal drag synchronously before mouseup clears its movement state', () => {
		const { eventHandler, handler } = createEventFixture();
		const target = createTarget(20, 33);
		beginDrag(eventHandler, target);
		moveTarget(eventHandler, target, 80, 38, true);

		eventHandler.modified({
			action: 'drag',
			e: { ctrlKey: false, shiftKey: true } as MouseEvent,
			target,
		} as any);

		expect(handler.transactionHandler.save).toHaveBeenCalledWith('moved');
		expect(handler.onModified).toHaveBeenCalledWith(target);
	});

	it('does not treat a Shift drag on a node as a path-selection click', () => {
		const { eventHandler, handler } = createEventFixture();
		const target = createTarget() as any;
		target.superType = 'node';
		beginDrag(eventHandler, target);
		moveTarget(eventHandler, target, 80, 35, true);

		eventHandler.mouseup({
			e: { shiftKey: true } as MouseEvent,
			isClick: false,
			target,
		} as any);

		expect(handler.nodeHandler.getNodePath).not.toHaveBeenCalled();
	});
});

describe('EventHandler Ctrl-drag duplication', () => {
	it('is enabled by default', () => {
		expect(defaults.canvasActions.dragDuplicate).toBe(true);
	});

	it('restores the original and places a clone at the drag destination', async () => {
		const { canvas, eventHandler, handler } = createEventFixture();
		const target = createTarget() as any;
		target.id = 'source';
		beginDrag(eventHandler, target, { ctrlKey: true });
		moveTarget(eventHandler, target, 80, 70, false, { ctrlKey: true });

		await eventHandler.modified({
			action: 'drag',
			e: { ctrlKey: true, shiftKey: false } as MouseEvent,
			target,
		} as any);

		const clone = canvas.setActiveObject.mock.lastCall?.[0] as any;
		expect({ left: target.left, top: target.top }).toEqual({ left: 20, top: 30 });
		expect(clone).not.toBe(target);
		expect({ left: clone.left, top: clone.top }).toEqual({ left: 80, top: 70 });
		expect(clone.id).not.toBe(target.id);
		expect(canvas.add).toHaveBeenCalledWith(clone);
		expect(handler.onAdd).toHaveBeenCalledWith(clone);
		expect(handler.onModified).toHaveBeenCalledWith(clone);
		expect(handler.transactionHandler.save).toHaveBeenCalledOnce();
		expect(handler.transactionHandler.save).toHaveBeenCalledWith('duplicate');
	});

	it('snaps the duplicate destination with the configured grid', async () => {
		const { canvas, eventHandler, handler } = createEventFixture();
		const target = createTarget() as any;
		handler.gridHandler.getSnappedPosition.mockReturnValue({
			left: 80,
			top: 60,
		});
		beginDrag(eventHandler, target, { ctrlKey: true });
		moveTarget(eventHandler, target, 83, 67, false, { ctrlKey: true });

		await eventHandler.modified({
			action: 'drag',
			e: { ctrlKey: true, shiftKey: false } as MouseEvent,
			target,
		} as any);

		const clone = canvas.setActiveObject.mock.lastCall?.[0] as fabric.FabricObject;
		expect(handler.gridHandler.getSnappedPosition).toHaveBeenCalledWith(target);
		expect({ left: clone.left, top: clone.top }).toEqual({ left: 80, top: 60 });
		expect({ left: target.left, top: target.top }).toEqual({ left: 20, top: 30 });
	});

	it('keeps a render-only source preview visible while Ctrl-dragging', () => {
		const { canvas, eventHandler } = createEventFixture();
		const target = createTarget() as any;
		const sourceBounds = target.getBoundingRect();
		beginDrag(eventHandler, target, { ctrlKey: true });
		moveTarget(eventHandler, target, 80, 70, false, { ctrlKey: true });
		const preview = target.__dragPreview as any;
		const afterRender = canvas.on.mock.calls
			.map(([events]) => events)
			.find(events => events['after:render'])['after:render'];
		const context = {
			restore: vi.fn(),
			save: vi.fn(),
			transform: vi.fn(),
			translate: vi.fn(),
		};

		afterRender({ ctx: context });

		expect({ left: target.left, top: target.top }).toEqual({ left: 80, top: 70 });
		expect(preview.left).toBe(sourceBounds.left);
		expect(preview.top).toBe(sourceBounds.top);
		expect(context.transform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
		expect(preview.render).toHaveBeenCalledWith(context);
		expect(canvas.add).not.toHaveBeenCalled();
	});

	it('switches from duplication to a normal move when Ctrl is released before drop', async () => {
		const { canvas, eventHandler, handler } = createEventFixture();
		const target = createTarget() as any;
		beginDrag(eventHandler, target, { ctrlKey: true });
		moveTarget(eventHandler, target, 80, 70, false, { ctrlKey: true });

		eventHandler.keyup({
			code: 'ControlLeft',
			ctrlKey: false,
			key: 'Control',
			metaKey: false,
		} as KeyboardEvent);
		await eventHandler.modified({
			action: 'drag',
			e: { ctrlKey: false, metaKey: false, shiftKey: false } as MouseEvent,
			target,
		} as any);

		expect({ left: target.left, top: target.top }).toEqual({ left: 80, top: 70 });
		expect(canvas.add).not.toHaveBeenCalled();
		expect(handler.transactionHandler.save).toHaveBeenCalledOnce();
		expect(handler.transactionHandler.save).toHaveBeenCalledWith('moved');
	});

	it('switches to duplication when Ctrl is pressed after dragging starts', async () => {
		const { canvas, eventHandler, handler } = createEventFixture();
		const target = createTarget() as any;
		target.id = 'source';
		beginDrag(eventHandler, target);
		moveTarget(eventHandler, target, 80, 70, false);
		vi.stubGlobal('document', { activeElement: null });

		eventHandler.keydown({
			code: 'ControlLeft',
			ctrlKey: true,
			key: 'Control',
			metaKey: false,
			preventDefault: vi.fn(),
		} as unknown as KeyboardEvent);
		await eventHandler.modified({
			action: 'drag',
			e: { ctrlKey: true, metaKey: false, shiftKey: false } as MouseEvent,
			target,
		} as any);

		const clone = canvas.setActiveObject.mock.lastCall?.[0] as any;
		expect({ left: target.left, top: target.top }).toEqual({ left: 20, top: 30 });
		expect({ left: clone.left, top: clone.top }).toEqual({ left: 80, top: 70 });
		expect(handler.transactionHandler.save).toHaveBeenCalledWith('duplicate');
	});

	it('cancels the entire drag when Escape is pressed before drop', async () => {
		const { canvas, eventHandler, handler } = createEventFixture();
		const target = createTarget() as any;
		beginDrag(eventHandler, target, { ctrlKey: true });
		moveTarget(eventHandler, target, 80, 70, false, { ctrlKey: true });
		const preventDefault = vi.fn();
		vi.stubGlobal('document', { activeElement: null });

		eventHandler.keydown({
			code: 'Escape',
			ctrlKey: false,
			key: 'Escape',
			metaKey: false,
			preventDefault,
		} as unknown as KeyboardEvent);
		target.set({ left: 100, top: 90 });
		eventHandler.moving({
			e: { ctrlKey: false, metaKey: false, shiftKey: false } as MouseEvent,
			target,
		} as any);
		await eventHandler.modified({
			action: 'drag',
			e: { ctrlKey: false, metaKey: false, shiftKey: false } as MouseEvent,
			target,
		} as any);

		expect({ left: target.left, top: target.top }).toEqual({ left: 20, top: 30 });
		expect(canvas.add).not.toHaveBeenCalled();
		expect(canvas.discardActiveObject).not.toHaveBeenCalled();
		expect(handler.transactionHandler.save).not.toHaveBeenCalled();
		expect(preventDefault).toHaveBeenCalledOnce();
	});

	it('combines Ctrl duplication with the existing Shift axis lock', async () => {
		const { canvas, eventHandler } = createEventFixture();
		const target = createTarget() as any;
		target.id = 'source';
		beginDrag(eventHandler, target, { ctrlKey: true, shiftKey: true });
		moveTarget(eventHandler, target, 80, 40, true, { ctrlKey: true });

		await eventHandler.modified({
			action: 'drag',
			e: { ctrlKey: true, shiftKey: true } as MouseEvent,
			target,
		} as any);

		const clone = canvas.setActiveObject.mock.lastCall?.[0] as any;
		expect({ left: target.left, top: target.top }).toEqual({ left: 20, top: 30 });
		expect({ left: clone.left, top: clone.top }).toEqual({ left: 80, top: 30 });
	});

	it('duplicates every active selection member while preserving relative positions', async () => {
		const { canvas, eventHandler, handler } = createEventFixture();
		const first = createTarget(20, 30) as any;
		const second = createTarget(100, 120) as any;
		first.id = 'first';
		second.id = 'second';
		const selection = new fabric.ActiveSelection([first, second]);
		selection.setCoords();
		selection.getObjects().forEach(object => object.setCoords());
		const originalBounds = selection.getObjects().map(object => object.getBoundingRect());
		beginDrag(eventHandler, selection, { ctrlKey: true });
		selection.set({
			left: selection.left + 120,
			top: selection.top + 70,
		});
		selection.setCoords();

		await eventHandler.modified({
			action: 'drag',
			e: { ctrlKey: true, shiftKey: false } as MouseEvent,
			target: selection,
		} as any);

		const cloneSelection = canvas.setActiveObject.mock.lastCall?.[0] as fabric.ActiveSelection;
		const restoredBounds = selection.getObjects().map(object => object.getBoundingRect());
		const cloneBounds = cloneSelection.getObjects().map(object => object.getBoundingRect());
		restoredBounds.forEach((bounds, index) => {
			expect(bounds.left).toBeCloseTo(originalBounds[index].left);
			expect(bounds.top).toBeCloseTo(originalBounds[index].top);
			expect(cloneBounds[index].left).toBeCloseTo(originalBounds[index].left + 120);
			expect(cloneBounds[index].top).toBeCloseTo(originalBounds[index].top + 70);
		});
		expect(canvas.add).toHaveBeenCalledTimes(2);
		expect(handler.onAdd).toHaveBeenCalledWith(cloneSelection);
		expect(handler.transactionHandler.save).toHaveBeenCalledWith('duplicate');
	});

	it('duplicates a connected node with fresh ports but without its external link', async () => {
		const { canvas, eventHandler, handler } = createEventFixture();
		const sourceNode = createWorkflowNode('source-node', 20, 30);
		const destinationNode = createWorkflowNode('destination-node', 200, 180);
		const { fromPort, link } = connectWorkflowNodes(sourceNode, destinationNode);
		const fromPortPreview = installDragPreview(fromPort);
		const previewConnectedStates: boolean[] = [];
		(fromPort as any).cloneAsImage.mockImplementation(() => {
			previewConnectedStates.push(fromPort.connected);
			return fromPortPreview;
		});
		installDragPreview(link);
		beginDrag(eventHandler, sourceNode, { ctrlKey: true });
		expect(previewConnectedStates).toEqual([false]);
		expect(fromPort.connected).toBe(true);
		handler.portHandler.setCoords.mockClear();
		moveTarget(eventHandler, sourceNode, 80, 70, false, { ctrlKey: true });
		const afterRender = canvas.on.mock.calls
			.map(([events]) => events)
			.find(events => events['after:render'])['after:render'];
		const context = {
			restore: vi.fn(),
			save: vi.fn(),
			transform: vi.fn(),
			translate: vi.fn(),
		};

		afterRender({ ctx: context });
		expect((fromPort as any).__dragPreview.render).toHaveBeenCalledWith(context);
		expect((link as any).__dragPreview.render).not.toHaveBeenCalled();
		expect(context.translate).toHaveBeenCalledWith(60, 40);
		expect(handler.portHandler.setCoords).not.toHaveBeenCalled();

		await eventHandler.modified({
			action: 'drag',
			e: { ctrlKey: true, shiftKey: false } as MouseEvent,
			target: sourceNode,
		} as any);

		const clone = canvas.setActiveObject.mock.lastCall?.[0] as any;
		expect(sourceNode.fromPort[0]).toBe(fromPort);
		expect(fromPort.links).toEqual([link]);
		expect(link.fromNode).toBe(sourceNode);
		expect(link.toNode).toBe(destinationNode);
		expect(handler.portHandler.create).toHaveBeenCalledWith(clone);
		expect(handler.linkHandler.create).not.toHaveBeenCalled();
	});

	it('duplicates links between selected nodes using both cloned node ids', async () => {
		const { canvas, eventHandler, handler } = createEventFixture();
		const sourceNode = createWorkflowNode('source-node', 20, 30);
		const destinationNode = createWorkflowNode('destination-node', 200, 180);
		const { fromPort, link, toPort } = connectWorkflowNodes(sourceNode, destinationNode);
		const fromPortPreview = installDragPreview(fromPort);
		const previewConnectedStates: boolean[] = [];
		(fromPort as any).cloneAsImage.mockImplementation(() => {
			previewConnectedStates.push(fromPort.connected);
			return fromPortPreview;
		});
		installDragPreview(toPort);
		installDragPreview(link);
		const selection = new fabric.ActiveSelection([sourceNode, destinationNode]);
		selection.setCoords();
		selection.getObjects().forEach(object => object.setCoords());
		beginDrag(eventHandler, selection, { ctrlKey: true });
		expect(previewConnectedStates).toEqual([true]);
		selection.set({
			left: selection.left + 120,
			top: selection.top + 70,
		});
		selection.setCoords();
		const linkCreationGroups: Array<Array<fabric.Group | undefined>> = [];
		handler.linkHandler.create.mockImplementation((option: any) => {
			const fromNode = canvas.getObjects().find((object: any) => object.id === option.fromNodeId);
			const toNode = canvas.getObjects().find((object: any) => object.id === option.toNodeId);
			linkCreationGroups.push([fromNode?.group, toNode?.group]);
		});

		await eventHandler.modified({
			action: 'drag',
			e: { ctrlKey: true, shiftKey: false } as MouseEvent,
			target: selection,
		} as any);

		const cloneSelection = canvas.setActiveObject.mock.lastCall?.[0] as fabric.ActiveSelection;
		const [sourceClone, destinationClone] = cloneSelection.getObjects() as any[];
		const linkOption = handler.linkHandler.create.mock.lastCall?.[0];
		expect(linkOption).toMatchObject({
			fromNodeId: sourceClone.id,
			fromPortId: fromPort.id,
			stroke: '#8a99a6',
			toNodeId: destinationClone.id,
			toPortId: toPort.id,
			type: 'link',
		});
		expect(linkOption.id).not.toBe(link.id);
		expect(linkOption).not.toHaveProperty('fromNode');
		expect(linkOption).not.toHaveProperty('fromPort');
		expect(linkOption).not.toHaveProperty('toNode');
		expect(linkOption).not.toHaveProperty('toPort');
		expect(link.toObject).toHaveBeenCalledWith(
			expect.arrayContaining(['onlyLeft', 'originStroke', 'selectedStroke']),
		);
		expect(linkCreationGroups).toEqual([[undefined, undefined]]);
		expect(sourceClone.id).not.toBe(sourceNode.id);
		expect(destinationClone.id).not.toBe(destinationNode.id);
		expect(link.fromNode).toBe(sourceNode);
		expect(link.toNode).toBe(destinationNode);
	});

	it('removes a partial graph when duplicated link creation fails', async () => {
		const { canvas, eventHandler, handler } = createEventFixture();
		const sourceNode = createWorkflowNode('source-node', 20, 30);
		const destinationNode = createWorkflowNode('destination-node', 200, 180);
		const { fromPort, link, toPort } = connectWorkflowNodes(sourceNode, destinationNode);
		const originalObjects = [sourceNode, destinationNode, fromPort, toPort, link];
		originalObjects.forEach(object => canvas.add(object));
		installDragPreview(fromPort);
		installDragPreview(toPort);
		installDragPreview(link);
		handler.linkHandler.create.mockImplementation(() => {
			throw new Error('link factory failed');
		});
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const selection = new fabric.ActiveSelection([sourceNode, destinationNode]);
		selection.setCoords();
		selection.getObjects().forEach(object => object.setCoords());
		beginDrag(eventHandler, selection, { ctrlKey: true });
		selection.set({
			left: selection.left + 80,
			top: selection.top + 70,
		});
		selection.setCoords();

		await eventHandler.modified({
			action: 'drag',
			e: { ctrlKey: true, shiftKey: false } as MouseEvent,
			target: selection,
		} as any);

		expect(canvas.getObjects()).toEqual(originalObjects);
		expect(canvas.setActiveObject.mock.lastCall?.[0]).toBe(selection);
		expect(handler.transactionHandler.save).not.toHaveBeenCalled();
		expect(handler.onModified).not.toHaveBeenCalled();
	});

	it('falls back to a normal move when drag duplication is disabled', async () => {
		const { canvas, eventHandler, handler } = createEventFixture(true, false, false);
		const target = createTarget();
		beginDrag(eventHandler, target, { ctrlKey: true });
		moveTarget(eventHandler, target, 80, 70, false, { ctrlKey: true });

		await eventHandler.modified({
			action: 'drag',
			e: { ctrlKey: true, shiftKey: false } as MouseEvent,
			target,
		} as any);

		expect({ left: target.left, top: target.top }).toEqual({ left: 80, top: 70 });
		expect(canvas.add).not.toHaveBeenCalled();
		expect(handler.transactionHandler.save).toHaveBeenCalledWith('moved');
	});

	it('does not duplicate objects marked as non-cloneable', async () => {
		const { canvas, eventHandler, handler } = createEventFixture();
		const target = createTarget() as any;
		target.cloneable = false;
		beginDrag(eventHandler, target, { ctrlKey: true });
		moveTarget(eventHandler, target, 80, 70, false, { ctrlKey: true });

		await eventHandler.modified({
			action: 'drag',
			e: { ctrlKey: true, shiftKey: false } as MouseEvent,
			target,
		} as any);

		expect(canvas.add).not.toHaveBeenCalled();
		expect(handler.transactionHandler.save).toHaveBeenCalledWith('moved');
	});
});
