import { describe, expect, it, vi } from 'vitest';

vi.mock('mediaelement', () => ({}));

import Handler from './Handler';
import { resolveFabricObjectType } from './resolveFabricObjectType';

describe('Handler object factory resolution', () => {
	it('uses nodeClazz when a serialized workflow node has a base Fabric type', () => {
		const create = vi.fn();

		const objectType = resolveFabricObjectType(
			{
				TimerNode: { create },
			},
			{
				nodeClazz: 'TimerNode',
				superType: 'node',
				type: 'TriggerNode',
			},
		);

		expect(objectType).toBe('TimerNode');
	});
});

describe('Handler batch updates', () => {
	it('binds the standard interaction events to restored Fabric objects', () => {
		const mousedown = vi.fn();
		const mousedblclick = vi.fn();
		const regularObject = {
			dblclick: true,
			on: vi.fn(),
			superType: 'image',
		};
		const elementObject = {
			dblclick: true,
			on: vi.fn(),
			superType: 'element',
		};
		const handler: any = {
			editable: false,
			eventHandler: {
				object: {
					mousedown,
					mousedblclick,
				},
			},
		};
		const bindObjectEvents = (Handler.prototype as any).bindObjectEvents;

		expect(typeof bindObjectEvents).toBe('function');
		bindObjectEvents.call(handler, regularObject);
		bindObjectEvents.call(handler, elementObject);

		expect(regularObject.on).toHaveBeenCalledWith('mousedown', mousedown);
		expect(regularObject.on).toHaveBeenCalledWith('mousedblclick', mousedblclick);
		expect(elementObject.on).not.toHaveBeenCalledWith('mousedown', mousedown);
		expect(elementObject.on).toHaveBeenCalledWith('mousedblclick', mousedblclick);
	});

	it('refreshes the object index and renders once after nested batch operations', () => {
		const objects = [{ id: 'node-1' }];
		const handler: any = {
			batchDepth: 0,
			canvas: {
				renderOnAddRemove: true,
				requestRenderAll: vi.fn(),
			},
			getObjects: vi.fn(() => objects),
			objects: [],
			startRequestAnimFrame: vi.fn(),
			stopRequestAnimFrame: vi.fn(),
			syncRequestAnimFrame: (Handler.prototype as any).syncRequestAnimFrame,
		};
		const runBatch = (Handler.prototype as any).runBatch;

		expect(typeof runBatch).toBe('function');
		runBatch.call(handler, () => {
			expect(handler.canvas.renderOnAddRemove).toBe(false);
			runBatch.call(handler, () => {
				expect(handler.canvas.renderOnAddRemove).toBe(false);
			});
			expect(handler.getObjects).not.toHaveBeenCalled();
		});

		expect(handler.canvas.renderOnAddRemove).toBe(true);
		expect(handler.getObjects).toHaveBeenCalledOnce();
		expect(handler.objects).toBe(objects);
		expect(handler.canvas.requestRenderAll).toHaveBeenCalledOnce();
	});

	it('starts GIF rendering after a batch restores GIF objects', () => {
		const handler: any = {
			batchDepth: 0,
			canvas: {
				renderOnAddRemove: true,
				requestRenderAll: vi.fn(),
			},
			getObjects: vi.fn(() => [{ id: 'gif-1', type: 'gif' }]),
			objects: [],
			startRequestAnimFrame: vi.fn(),
			stopRequestAnimFrame: vi.fn(),
			syncRequestAnimFrame: (Handler.prototype as any).syncRequestAnimFrame,
		};
		const runBatch = (Handler.prototype as any).runBatch;

		expect(typeof handler.syncRequestAnimFrame).toBe('function');
		runBatch.call(handler, (): void => undefined);

		expect(handler.startRequestAnimFrame).toHaveBeenCalledOnce();
		expect(handler.stopRequestAnimFrame).not.toHaveBeenCalled();
	});

	it('defers object refreshes triggered during a batch', () => {
		const handler: any = {
			getObjects: vi.fn(() => [{ id: 'node-1' }]),
			isBatching: vi.fn(() => true),
			objects: [],
		};
		const refreshAfterMutation = (Handler.prototype as any).refreshAfterMutation;

		expect(typeof refreshAfterMutation).toBe('function');
		refreshAfterMutation.call(handler);

		expect(handler.getObjects).not.toHaveBeenCalled();
		expect(handler.objects).toEqual([]);
	});

	it('indexes selected workflow nodes once while creating their clipboard payload', () => {
		const blocked: any = {
			cloneable: false,
			fromPort: [],
			id: 'blocked-1',
			superType: 'node',
		};
		const destination: any = {
			cloneable: true,
			configuration: {},
			descriptor: { icon: 'delay' },
			fromPort: [],
			id: 'delay-1',
			name: 'Delay',
			nodeClazz: 'DelayNode',
			superType: 'node',
			type: 'LogicNode',
		};
		const source: any = {
			cloneable: true,
			configuration: {},
			descriptor: { icon: 'timer' },
			fromPort: [
				{
					id: 'output-1',
					links: [
						{
							id: 'link-1',
							toNode: destination,
							toObject: vi.fn((propertiesToInclude: string[]) => ({
								id: 'link-1',
								objects: [{ type: 'path' }],
								stroke: '#123456',
								superType: 'link',
								type: 'curvedLink',
								...(propertiesToInclude.includes('onlyLeft') && { onlyLeft: true }),
								...(propertiesToInclude.includes('originStroke') && {
									originStroke: '#654321',
								}),
								...(propertiesToInclude.includes('selectedStroke') && {
									selectedStroke: '#abcdef',
								}),
							})),
						},
					],
				},
			],
			id: 'timer-1',
			name: 'Timer',
			nodeClazz: 'TimerNode',
			superType: 'node',
			type: 'TriggerNode',
		};
		const selectionObjects = [blocked, source, destination];
		const getObjects = vi.fn(() => selectionObjects);
		const activeSelection = {
			cloneable: true,
			getObjects,
			height: 120,
			left: 100,
			top: 100,
			width: 240,
		};
		const createClipboardSelectionPayload = (Handler.prototype as any).createClipboardSelectionPayload;
		const serializeWorkflowLink = (Handler.prototype as any).serializeWorkflowLink;

		expect(typeof createClipboardSelectionPayload).toBe('function');
		const payload = createClipboardSelectionPayload.call(
			{ propertiesToInclude: ['id', 'superType'], serializeWorkflowLink },
			activeSelection,
		);

		expect(getObjects).toHaveBeenCalledOnce();
		expect(payload).toHaveLength(3);
		expect(payload[2]).toMatchObject({
			fromNodeIndex: 0,
			fromPortId: 'output-1',
			onlyLeft: true,
			originStroke: '#654321',
			selectedStroke: '#abcdef',
			stroke: '#123456',
			superType: 'link',
			toNodeIndex: 1,
			type: 'curvedLink',
		});
		expect(payload).not.toContain(null);
		expect(payload[2]).not.toHaveProperty('id');
		expect(payload[2]).not.toHaveProperty('fromNodeId');
		expect(payload[2]).not.toHaveProperty('objects');
		expect(payload[2]).not.toHaveProperty('toNodeId');
	});

	it('duplicates a workflow selection with one object lookup and one mutation batch', () => {
		const destinationClone: any = {
			id: 'delay-clone',
			nodeClazz: 'DelayNode',
			set: vi.fn(),
			toPort: { id: 'delay-input' },
		};
		const sourceClone: any = {
			fromPort: [{ id: 'timer-output' }],
			id: 'timer-clone',
			nodeClazz: 'TimerNode',
			set: vi.fn(),
		};
		const destination: any = {
			cloneable: true,
			duplicate: vi.fn(() => destinationClone),
			fromPort: [],
			id: 'delay',
			left: 200,
			top: 200,
		};
		const source: any = {
			cloneable: true,
			duplicate: vi.fn(() => sourceClone),
			fromPort: [
				{
					id: 'timer-output',
					links: [
						{
							toNode: destination,
							toObject: vi.fn((propertiesToInclude: string[]) => ({
								id: 'link-1',
								objects: [{ type: 'path' }],
								stroke: '#123456',
								superType: 'link',
								type: 'curvedLink',
								...(propertiesToInclude.includes('onlyLeft') && { onlyLeft: true }),
								...(propertiesToInclude.includes('originStroke') && {
									originStroke: '#654321',
								}),
								...(propertiesToInclude.includes('selectedStroke') && {
									selectedStroke: '#abcdef',
								}),
							})),
						},
					],
				},
			],
			id: 'timer',
			left: 100,
			top: 100,
		};
		const getSelectionObjects = vi.fn(() => [source, destination]);
		const canvasObjects = [sourceClone, destinationClone];
		const handler: any = {
			canvas: {
				add: vi.fn(),
			},
			eventHandler: {
				object: {
					mousedblclick: vi.fn(),
				},
			},
			getObjects: vi.fn(() => canvasObjects),
			linkHandler: {
				create: vi.fn(),
			},
			objectMap: {},
			objects: [],
			portHandler: {
				create: vi.fn(),
			},
			propertiesToInclude: ['id', 'superType'],
			runBatch: vi.fn((operation: () => void) => operation()),
			serializeWorkflowLink: (Handler.prototype as any).serializeWorkflowLink,
		};
		const clipboard = {
			getObjects: getSelectionObjects,
		};
		const duplicateWorkflowSelection = (Handler.prototype as any).duplicateWorkflowSelection;

		expect(typeof duplicateWorkflowSelection).toBe('function');
		const duplicated = duplicateWorkflowSelection.call(handler, clipboard, 10);

		expect(handler.runBatch).toHaveBeenCalledOnce();
		expect(getSelectionObjects).toHaveBeenCalledOnce();
		expect(handler.canvas.add).toHaveBeenCalledTimes(2);
		expect(handler.portHandler.create).toHaveBeenCalledTimes(2);
		expect(handler.getObjects).not.toHaveBeenCalled();
		expect(handler.linkHandler.create).toHaveBeenCalledWith({
			fromNodeId: 'timer-clone',
			fromPortId: 'timer-output',
			onlyLeft: true,
			originStroke: '#654321',
			selectedStroke: '#abcdef',
			stroke: '#123456',
			superType: 'link',
			toNodeId: 'delay-clone',
			toPortId: 'delay-input',
			type: 'curvedLink',
		});
		expect(duplicated).toEqual([sourceClone, destinationClone]);
	});
});
