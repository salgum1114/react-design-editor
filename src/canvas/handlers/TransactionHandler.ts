import { fabric } from 'fabric';
import { sortBy, throttle } from 'lodash-es';
import { FabricObject } from '../models';
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
		this.active = false;
		this.latestNodeSticky.clear();
	};

	private sortObjects = (objects: FabricObject[]) => {
		return sortBy(
			objects.filter(obj => obj.id !== 'workarea' && obj.superType !== 'port'),
			obj => (obj.superType === 'link' ? 1 : 0),
		);
	};

	public setDefaultObjects = (objects: FabricObject[]) => {
		this.undos = [];
		this.redos = [];

		const normalized = this.sortObjects(this.normalizeObjects(objects));

		// Seed sticky fields from initial state
		this.captureLatestStickyFromSnapshot(normalized);

		this.currentObjects = normalized;
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
			const objects = this.handler.canvas.toJSON(this.handler.propertiesToInclude).objects as FabricObject[];
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
	public undo = throttle(() => {
		const undo = this.undos.pop();
		if (!undo) return;

		try {
			this.redos.push({
				type: 'redo',
				json: JSON.stringify(this.currentObjects),
			});
			this.replay(undo);
		} catch (error) {
			console.error('[TransactionHandler] Undo failed:', error);
		}
	}, 100);

	/**
	 * Redo transaction
	 */
	public redo = throttle(() => {
		const redo = this.redos.pop();
		if (!redo) return;

		try {
			this.undos.push({
				type: 'undo',
				json: JSON.stringify(this.currentObjects),
			});
			this.replay(redo);
		} catch (error) {
			console.error('[TransactionHandler] Redo failed:', error);
		}
	}, 100);

	/**
	 * Replay transaction
	 *
	 * @param {TransactionEvent} transaction
	 */
	public replay = (transaction: TransactionEvent) => {
		try {
			const parsed = JSON.parse(transaction.json) as FabricObject[];
			const normalized = this.normalizeObjects(parsed);

			// Enforce sticky fields (configuration/name/description) before enlivening
			this.applyLatestStickyToSnapshot(normalized);

			this.currentObjects = normalized;

			this.active = true;
			this.handler.canvas.renderOnAddRemove = false;
			this.handler.clear();
			this.handler.canvas.discardActiveObject();

			fabric.util.enlivenObjects(
				this.currentObjects,
				(enlivenObjects: FabricObject[]) => {
					enlivenObjects.forEach(obj => {
						const targetIndex = this.handler.canvas._objects.length;

						if (obj.superType === 'node') {
							const node = obj as NodeObject;
							this.handler.canvas.insertAt(node, targetIndex, false);
							this.handler.portHandler.create(node);
						} else if (obj.superType === 'link') {
							this.handler.objects = this.handler.getObjects();
							this.handler.linkHandler.create({
								type: 'link',
								fromNodeId: (obj as any).fromNode?.id,
								fromPortId: (obj as any).fromPort?.id,
								toNodeId: (obj as any).toNode?.id,
								toPortId: (obj as any).toPort?.id,
							});
						} else {
							this.handler.canvas.insertAt(obj, targetIndex, false);
						}
					});

					this.active = false;
					this.handler.canvas.renderOnAddRemove = true;
					this.handler.canvas.renderAll();
					this.handler.objects = this.handler.getObjects();
					this.handler.onTransaction?.(transaction);
				},
				null,
			);
		} catch (error) {
			console.error(error);
		}
	};

	public canUndo = () => this.undos.length > 0;
	public canRedo = () => this.redos.length > 0;
}

export default TransactionHandler;
