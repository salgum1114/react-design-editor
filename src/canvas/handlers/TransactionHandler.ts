import { fabric } from 'fabric';
import sortBy from 'lodash/sortBy';
import throttle from 'lodash/throttle';
import { NodeObject } from '../objects/Node';
import { FabricObject } from '../utils';
import AbstractHandler from './AbstractHandler';

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
	| 'layout';

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

class TransactionHandler extends AbstractHandler {
	private readonly MAX_HISTORY_SIZE = 20;
	private currentObjects: FabricObject[] = [];
	redos: TransactionEvent[];
	undos: TransactionEvent[];
	active: boolean = false;

	constructor(handler: any) {
		super(handler);
		this.initialize();
	}

	/**
	 * Initialize transaction handler
	 *
	 */
	protected initialize = () => {
		this.redos = [];
		this.undos = [];
		this.currentObjects = [];
		this.active = false;
	};

	/**
	 * Save transaction
	 *
	 * @param {TransactionType} type
	 */
	public save = (type: TransactionType) => {
		if (!this.handler.keyEvent.transaction) {
			return;
		}
		try {
			const json = JSON.stringify(this.currentObjects);
			this.redos = [];
			this.undos.push({ type, json });
			if (this.undos.length > this.MAX_HISTORY_SIZE) {
				this.undos.shift();
			}
			const objects = this.handler.canvas.toJSON(this.handler.propertiesToInclude).objects.map(obj => {
				const target = obj as FabricObject;
				if (target.superType === 'node' || target.superType === 'link') {
					return {
						...target,
						shadow: { ...(target.shadow as fabric.Shadow), blur: 0 },
						fill: target.originFill,
						stroke: target.originStroke,
					};
				}
				return obj;
			}) as FabricObject[];
			this.currentObjects = sortBy(
				objects.filter(obj => obj.id !== 'workarea' && obj.superType !== 'port'),
				obj => (obj.superType === 'link' ? 1 : 0),
			);
		} catch (error) {
			console.error(error);
		}
	};

	/**
	 * Undo transaction
	 *
	 */
	public undo = throttle(() => {
		const undo = this.undos.pop();
		if (!undo) {
			return;
		}
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
	 *
	 */
	public redo = throttle(() => {
		const redo = this.redos.pop();
		if (!redo) {
			return;
		}
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
			this.currentObjects = JSON.parse(transaction.json) as FabricObject[];
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
								fromNodeId: obj.fromNode?.id,
								fromPortId: obj.fromPort?.id,
								toNodeId: obj.toNode?.id,
								toPortId: obj.toPort?.id,
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
