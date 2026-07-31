import * as fabric from 'fabric';
import { sortBy, throttle, union } from 'lodash-es';
import { FabricObject } from '../models';
import { LINK_PROPERTIES_TO_INCLUDE } from '../objects/Link';
import { NodeObject } from '../objects/Node';
import AbstractHandler from './AbstractHandler';
import Handler from './Handler';

export type TransactionType =
	| 'add'
	| 'remove'
	| 'modified'
	| 'moved'
	| 'scaled'
	| 'rotated'
	| 'skewed'
	| 'group'
	| 'ungroup'
	| 'duplicate'
	| 'paste'
	| 'bringForward'
	| 'bringToFront'
	| 'sendBackwards'
	| 'sendToBack'
	| 'redo'
	| 'undo'
	| 'layout'
	| 'configuration';

export interface TransactionTransform {
	scaleX?: number;
	scaleY?: number;
	skewX?: number;
	skewY?: number;
	angle?: number;
	left?: number;
	top?: number;
	flipX?: number;
	flipY?: number;
	originX?: string;
	originY?: string;
}

export interface TransactionEvent {
	json: string;
	type: TransactionType;
}

type StickyNodeFields = Partial<{
	configuration: any;
	name: string;
	description: string;
	errors: any;
}>;

class TransactionHandler extends AbstractHandler {
	private readonly MAX_HISTORY_SIZE = 30;

	private currentObjects: FabricObject[] = [];
	private selectedObjectIds: string[] = [];
	redos: TransactionEvent[];
	undos: TransactionEvent[];
	active: boolean = false;

	// Sticky fields must always remain at the latest value (NOT part of undo/redo)
	// nodeId -> { configuration, name, description }
	private latestNodeSticky = new Map<string, StickyNodeFields>();

	constructor(handler: Handler) {
		super(handler);
		this.initialize();
	}

	/**
	 * Initialize transaction handler
	 */
	protected initialize = () => {
		this.redos = [];
		this.undos = [];
		this.currentObjects = [];
		this.selectedObjectIds = [];
		this.active = false;
		this.latestNodeSticky.clear();
	};

	private sortObjects = (objects: FabricObject[]) => {
		return sortBy(
			objects.filter(obj => obj.id !== 'workarea' && obj.superType !== 'port'),
			obj => (obj.superType === 'link' ? 1 : 0),
		);
	};

	private compactWorkflowRelations = (objects: FabricObject[]) => {
		return (objects || []).map((object: any) => {
			if (!object) {
				return object;
			}
			if (object.superType === 'node') {
				const { fromPort: _fromPort, ports: _ports, toPort: _toPort, ...node } = object;
				return node;
			}
			if (object.superType === 'link') {
				const {
					fromNode,
					fromPort,
					layoutManager: _layoutManager,
					objects: _objects,
					toNode,
					toPort,
					...link
				} = object;
				return {
					...link,
					fromNodeId: link.fromNodeId ?? fromNode?.id,
					fromPortId: link.fromPortId ?? fromPort?.id,
					toNodeId: link.toNodeId ?? toNode?.id,
					toPortId: link.toPortId ?? toPort?.id,
				};
			}
			return object;
		}) as FabricObject[];
	};

	public setDefaultObjects = (objects = this.createSnapshot()) => {
		this.undos = [];
		this.redos = [];
		this.selectedObjectIds = [];

		const normalized = this.sortObjects(this.normalizeObjects(this.compactWorkflowRelations(objects)));

		// Seed sticky fields from initial state
		this.captureLatestStickyFromSnapshot(normalized);

		this.currentObjects = normalized;
	};

	private getSelectionIds = (target?: FabricObject | null) => {
		if (!target) {
			return [];
		}
		if (typeof target.isType === 'function' && target.isType('ActiveSelection')) {
			return (target as fabric.ActiveSelection)
				.getObjects()
				.map(object => (object as FabricObject).id)
				.filter((id): id is string => Boolean(id));
		}
		return target.id ? [target.id] : [];
	};

	public rememberSelection = (target?: FabricObject | null) => {
		if (!this.active) {
			this.selectedObjectIds = this.getSelectionIds(target);
		}
	};

	private normalizeObjects = (objects: FabricObject[]) => {
		return (objects || []).map((obj: any) => {
			if (!obj) return obj;
			if (obj.superType !== 'node' && obj.superType !== 'link') {
				return obj;
			}
			const shadow = obj.shadow ?? {};
			return {
				...obj,
				opacity: 1,
				animating: false,
				animation: undefined,
				shadow: {
					...shadow,
					blur: 0,
				},
				stroke: obj.originStroke ?? obj.stroke,
			};
		});
	};

	private serializeObjectInCanvasPlane = (object: fabric.FabricObject) => {
		const originalTransform = fabric.util.saveObjectTransform(object);
		const canvasTransform = object.calcTransformMatrix();

		try {
			fabric.util.applyTransformToObject(object, canvasTransform);
			return object.toObject(this.handler.propertiesToInclude) as FabricObject;
		} finally {
			object.set(originalTransform);
			object.setCoords();
		}
	};

	private createSnapshot = () => {
		const propertiesToInclude = union(
			this.handler.propertiesToInclude ?? [],
			Array.from(LINK_PROPERTIES_TO_INCLUDE),
		);
		const objects = this.handler.canvas.toObject(propertiesToInclude).objects as FabricObject[];
		const activeObject = this.handler.canvas.getActiveObject();
		if (!activeObject || typeof activeObject.isType !== 'function' || !activeObject.isType('ActiveSelection')) {
			return this.compactWorkflowRelations(objects);
		}

		const activeSelectionObjects = new Set((activeObject as fabric.ActiveSelection).getObjects());
		const exportedObjects = this.handler.canvas
			.getObjects()
			.filter((object: fabric.FabricObject) => !object.excludeFromExport);

		return this.compactWorkflowRelations(
			objects.map((object, index) => {
				const canvasObject = exportedObjects[index];
				return canvasObject && activeSelectionObjects.has(canvasObject)
					? this.serializeObjectInCanvasPlane(canvasObject)
					: object;
			}),
		);
	};

	/** Deep clone helper (avoid reference sharing across snapshots). */
	private cloneDeep<T>(v: T): T {
		// eslint-disable-next-line no-undef
		if (typeof structuredClone === 'function') return structuredClone(v);
		return JSON.parse(JSON.stringify(v));
	}

	/**
	 * Capture sticky fields from a snapshot.
	 * If nodeId is provided, capture only that node.
	 *
	 * NOTE: We use `"field" in obj` to allow clearing values (setting undefined/null)
	 * while still being captured/applied consistently.
	 */
	private captureLatestStickyFromSnapshot = (objects: FabricObject[], nodeId?: string) => {
		for (const obj of objects || []) {
			if (!obj) continue;
			if (obj.superType !== 'node') continue;

			const anyObj = obj as any;
			const id = anyObj.id as string | undefined;
			if (!id) continue;

			if (nodeId && id !== nodeId) continue;

			const prev = this.latestNodeSticky.get(id) ?? {};
			const next: StickyNodeFields = { ...prev };

			// configuration
			if ('configuration' in anyObj) next.configuration = this.cloneDeep(anyObj.configuration);

			// name
			if ('name' in anyObj) next.name = anyObj.name;

			// description
			if ('description' in anyObj) next.description = anyObj.description;

			// errors
			if ('errors' in anyObj) next.errors = this.cloneDeep(anyObj.errors);

			this.latestNodeSticky.set(id, next);
		}
	};

	/**
	 * Apply sticky fields into a snapshot before enlivening.
	 * This guarantees node.configuration/name/description always stay at newest values even after undo/redo.
	 */
	private applyLatestStickyToSnapshot = (objects: FabricObject[]) => {
		for (const obj of objects || []) {
			if (!obj) continue;
			if (obj.superType !== 'node') continue;

			const anyObj = obj as any;
			const id = anyObj.id as string | undefined;
			if (!id) continue;

			const sticky = this.latestNodeSticky.get(id);
			if (!sticky) continue;

			// Apply only keys that exist in the cache object.
			if (Object.prototype.hasOwnProperty.call(sticky, 'configuration')) {
				anyObj.configuration = this.cloneDeep(sticky.configuration);
			}
			if (Object.prototype.hasOwnProperty.call(sticky, 'name')) {
				anyObj.name = sticky.name;
			}
			if (Object.prototype.hasOwnProperty.call(sticky, 'description')) {
				anyObj.description = sticky.description;
			}
			if (Object.prototype.hasOwnProperty.call(sticky, 'errors')) {
				anyObj.errors = this.cloneDeep(sticky.errors);
			}
		}
	};

	/**
	 * Save transaction
	 *
	 * Rules:
	 * - type === 'configuration': update sticky cache (configuration/name/description)
	 *   and DO NOT push to undos/redos (NOT part of undo/redo),
	 *   and DO NOT clear redo stack (redo remains possible).
	 * - other types: normal history behavior (push to undos, clear redos).
	 */
	public save = (type: TransactionType, nodeId?: string) => {
		if (!this.handler.canvasActions.transaction) return;

		try {
			// Always read fresh canvas state first.
			const objects = this.createSnapshot();
			const normalized = this.sortObjects(this.normalizeObjects(objects));

			if (type === 'configuration') {
				// Update sticky cache (optionally for a single node)
				this.captureLatestStickyFromSnapshot(normalized, nodeId);

				// Keep internal snapshot in sync, but do NOT touch undos/redos (redo stays valid)
				this.currentObjects = normalized;
				return;
			}

			// Normal transactions go into history and invalidate redo.
			const prevJson = JSON.stringify(this.currentObjects);
			this.redos = [];

			this.undos.push({ type, json: prevJson });
			if (this.undos.length > this.MAX_HISTORY_SIZE) {
				this.undos.shift();
			}

			// Update current snapshot
			this.currentObjects = normalized;
		} catch (error) {
			console.error(error);
		}
	};

	/**
	 * Undo transaction
	 */
	public undo = throttle(async () => {
		if (this.active) return;
		const undo = this.undos.pop();
		if (!undo) return;
		const redo = {
			type: 'redo',
			json: JSON.stringify(this.currentObjects),
		} as TransactionEvent;
		this.redos.push(redo);

		try {
			await this.replay(undo);
		} catch (error) {
			if (this.redos[this.redos.length - 1] === redo) {
				this.redos.pop();
			}
			this.undos.push(undo);
			console.error('[TransactionHandler] Undo failed:', error);
		}
	}, 100);

	/**
	 * Redo transaction
	 */
	public redo = throttle(async () => {
		if (this.active) return;
		const redo = this.redos.pop();
		if (!redo) return;
		const undo = {
			type: 'undo',
			json: JSON.stringify(this.currentObjects),
		} as TransactionEvent;
		this.undos.push(undo);

		try {
			await this.replay(redo);
		} catch (error) {
			if (this.undos[this.undos.length - 1] === undo) {
				this.undos.pop();
			}
			this.redos.push(redo);
			console.error('[TransactionHandler] Redo failed:', error);
		}
	}, 100);

	private restoreSnapshot = async (
		objects: FabricObject[],
		activeObjectIds: string[] = [],
		beforeMutation?: () => void,
	) => {
		const fabricObjectSnapshots = objects.filter(object => object.superType !== 'link');
		const workflowLinkSnapshots = objects.filter(object => object.superType === 'link');
		const restoredFabricObjects = (await fabric.util.enlivenObjects(fabricObjectSnapshots)) as FabricObject[];

		beforeMutation?.();
		this.handler.runBatch(() => {
			this.handler.clear();
			this.handler.canvas.discardActiveObject();
			const restoredNodes: NodeObject[] = [];

			if (restoredFabricObjects.length) {
				this.handler.canvas.add(...restoredFabricObjects);
			}
			restoredFabricObjects.forEach(object => {
				this.handler.bindObjectEvents(object);
				if (object.superType === 'node') {
					const node = object as NodeObject;
					restoredNodes.push(node);
					this.handler.portHandler.create(node);
				}
			});

			this.handler.objects = restoredFabricObjects.filter(object => object.id && object.superType !== 'port');
			this.handler.objectMap = this.handler.objects.reduce(
				(map, object) => Object.assign(map, { [object.id]: object }),
				{},
			);
			const restoredLinks = workflowLinkSnapshots.map(link =>
				this.handler.linkHandler.create(link as any, true),
			);
			if (restoredLinks.length) {
				this.handler.canvas.remove(...restoredLinks);
				const workareaIndex = this.handler.canvas
					.getObjects()
					.findIndex((object: FabricObject) => object.id === 'workarea');
				this.handler.canvas.insertAt(workareaIndex >= 0 ? workareaIndex + 1 : 0, ...restoredLinks);
			}
			restoredNodes.forEach(node => this.handler.portHandler.setCoords(node));
		});

		const selectedObjects = activeObjectIds
			.map(id => this.handler.objects.find(object => object.id === id))
			.filter((object): object is FabricObject => Boolean(object));
		if (selectedObjects.length === 1) {
			this.handler.canvas.setActiveObject(selectedObjects[0]);
		} else if (selectedObjects.length > 1) {
			this.handler.canvas.setActiveObject(
				new fabric.ActiveSelection(selectedObjects, {
					canvas: this.handler.canvas,
					...this.handler.activeSelectionOption,
				}),
			);
		}
	};

	/**
	 * Replay transaction
	 *
	 * @param {TransactionEvent} transaction
	 */
	public replay = async (transaction: TransactionEvent) => {
		const fallbackObjects = this.cloneDeep(this.currentObjects);
		const activeObjectIds = this.getSelectionIds(
			this.handler.canvas.getActiveObject() as FabricObject | undefined,
		);
		const selectedObjectIds = activeObjectIds.length ? activeObjectIds : this.selectedObjectIds;
		const interactionState = {
			selection: this.handler.canvas.selection,
			skipTargetFind: this.handler.canvas.skipTargetFind,
		};
		let canvasMutated = false;
		this.active = true;
		this.handler.canvas.selection = false;
		this.handler.canvas.skipTargetFind = true;

		try {
			const parsed = JSON.parse(transaction.json) as FabricObject[];
			const normalized = this.normalizeObjects(this.compactWorkflowRelations(parsed));
			if (selectedObjectIds.length) {
				this.selectedObjectIds = selectedObjectIds;
			}

			// Enforce sticky fields (configuration/name/description) before enlivening
			this.applyLatestStickyToSnapshot(normalized);

			await this.restoreSnapshot(normalized, selectedObjectIds, () => {
				canvasMutated = true;
			});

			this.currentObjects = normalized;
			this.handler.onTransaction?.(transaction);
		} catch (error) {
			let rollbackSucceeded = !canvasMutated;
			if (canvasMutated) {
				try {
					const rollbackObjects = this.cloneDeep(fallbackObjects);
					this.applyLatestStickyToSnapshot(rollbackObjects);
					await this.restoreSnapshot(rollbackObjects, selectedObjectIds);
					rollbackSucceeded = true;
				} catch (rollbackError) {
					console.error('[TransactionHandler] Rollback failed:', rollbackError);
				}
			}
			this.currentObjects = rollbackSucceeded
				? fallbackObjects
				: this.sortObjects(this.normalizeObjects(this.createSnapshot()));
			throw error;
		} finally {
			this.handler.canvas.selection = interactionState.selection;
			this.handler.canvas.skipTargetFind = interactionState.skipTargetFind;
			this.active = false;
		}
	};

	public canUndo = () => this.undos.length > 0;
	public canRedo = () => this.redos.length > 0;
}

export default TransactionHandler;
