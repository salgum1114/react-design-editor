import anime from 'animejs';
import * as fabric from 'fabric';
import { v4 as uuid } from 'uuid';
import { code } from '../constants';
import { FabricEvent, FabricObject } from '../models';
import { LINK_PROPERTIES_TO_INCLUDE, LinkObject } from '../objects/Link';
import { NodeObject } from '../objects/Node';
import { PortObject } from '../objects/Port';
import { VideoObject } from '../objects/Video';
import AbstractHandler from './AbstractHandler';
import type { SpacingAxis } from './SpacingGuidelineHandler';

type MovementAxis = 'horizontal' | 'vertical';

interface MovementConstraint {
	axis?: MovementAxis;
	left: number;
	target: FabricObject;
	top: number;
}

interface DragDuplicateSession {
	cancelled: boolean;
	copyMode: boolean;
	linkPreviews?: fabric.FabricObject[];
	portPreviews?: fabric.FabricObject[];
	portStartTransforms?: Map<PortObject, ReturnType<typeof fabric.util.saveObjectTransform>>;
	preview?: fabric.FabricObject;
	relatedLinks?: LinkObject[];
	startBounds: ReturnType<FabricObject['getBoundingRect']>;
	startTransform: ReturnType<typeof fabric.util.saveObjectTransform>;
	target: FabricObject;
}

interface DragDuplicateResult {
	activate: () => FabricObject;
	nodeMap: Map<string, NodeObject>;
}

/**
 * Event Handler Class
 * @author salgum1114
 * @class EventHandler
 */
class EventHandler extends AbstractHandler {
	code: string;
	panning: boolean;
	currentTarget: FabricObject | null;
	isSpacePanning: boolean;
	private dragDuplicateSession?: DragDuplicateSession;
	private movementConstraint?: MovementConstraint;

	constructor(handler: any) {
		super(handler);
		this.initialize();
	}

	/**
	 * Attch event on document
	 *
	 */
	protected initialize() {
		if (this.handler.editable) {
			this.canvas.on({
				'object:modified': this.modified,
				'object:scaling': this.scaling,
				'object:moving': this.moving,
				'object:rotating': this.rotating,
				'after:render': this.renderDragDuplicatePreview,
				'mouse:wheel': this.mousewheel,
				'mouse:down': this.mousedown,
				'mouse:move': this.mousemove,
				'mouse:up': this.mouseup,
				'mouse:out': this.mouseout,
				'selection:cleared': this.selection,
				'selection:created': this.selection,
				'selection:updated': this.selection,
			} as any);
		} else {
			this.canvas.on({
				'mouse:down': this.mousedown,
				'mouse:move': this.mousemove,
				'mouse:out': this.mouseout,
				'mouse:up': this.mouseup,
				'mouse:wheel': this.mousewheel,
			} as any);
		}
		this.canvas.wrapperEl.tabIndex = 1000;
		this.canvas.wrapperEl.addEventListener('keydown', this.keydown, false);
		this.canvas.wrapperEl.addEventListener('keyup', this.keyup, false);
		this.canvas.wrapperEl.addEventListener('mousedown', this.onmousedown, false);
		this.canvas.wrapperEl.addEventListener('contextmenu', this.contextmenu, false);
		this.canvas.wrapperEl.addEventListener('blur', this.blur, false);
		if (this.handler.canvasActions.clipboard) {
			document.addEventListener('paste', this.paste, false);
		}
	}

	/**
	 * Detach event on document
	 *
	 */
	public destroy = () => {
		if (this.handler.editable) {
			this.canvas.off({
				'object:modified': this.modified,
				'object:scaling': this.scaling,
				'object:moving': this.moving,
				'object:rotating': this.rotating,
				'after:render': this.renderDragDuplicatePreview,
				'mouse:wheel': this.mousewheel,
				'mouse:down': this.mousedown,
				'mouse:move': this.mousemove,
				'mouse:up': this.mouseup,
				'mouse:out': this.mouseout,
				'selection:cleared': this.selection,
				'selection:created': this.selection,
				'selection:updated': this.selection,
			} as any);
		} else {
			this.canvas.off({
				'mouse:down': this.mousedown,
				'mouse:move': this.mousemove,
				'mouse:out': this.mouseout,
				'mouse:up': this.mouseup,
				'mouse:wheel': this.mousewheel,
			} as any);
			this.handler.getObjects().forEach(object => {
				object.off('mousedown', this.handler.eventHandler.object.mousedown);
				if (object.anime) {
					anime.remove(object);
				}
			});
		}
		this.canvas.wrapperEl.removeEventListener('keydown', this.keydown);
		this.canvas.wrapperEl.removeEventListener('keyup', this.keyup);
		this.canvas.wrapperEl.removeEventListener('mousedown', this.onmousedown);
		this.canvas.wrapperEl.removeEventListener('contextmenu', this.contextmenu);
		this.canvas.wrapperEl.removeEventListener('blur', this.blur, false);
		if (this.handler.canvasActions.clipboard) {
			document.removeEventListener('paste', this.paste, false);
		}
	};

	/**
	 * Individual object event
	 *
	 */
	public object = {
		/**
		 * Mouse down event on object
		 * @param {FabricEvent} opt
		 */
		mousedown: (opt: FabricEvent) => {
			const { target } = opt;
			if (target && target.link && target.link.enabled) {
				this.handler.onClick?.(this.canvas, target);
			}
		},
		/**
		 * Mouse double click event on object
		 * @param {FabricEvent} opt
		 */
		mousedblclick: (opt: FabricEvent) => {
			const { target } = opt;
			if (target) {
				this.handler.onDblClick?.(this.canvas, target);
			}
		},
	};

	/**
	 * Modified event object
	 *
	 * @param {FabricEvent} opt
	 * @returns
	 */
	public modified = (opt: FabricEvent) => {
		const { target } = opt;
		if (!target) {
			return undefined;
		}
		if (target.type === 'circle' && target.parentId) {
			return undefined;
		}
		if (opt.action === 'drag') {
			const dragDuplicate = this.completeDragDuplicate(target, opt.e as MouseEvent);
			if (dragDuplicate) {
				return dragDuplicate;
			}
		}
		switch (opt.action) {
			case 'drag':
				this.moved(opt);
				break;
			case 'scale':
			case 'scaleX':
			case 'scaleY':
			case 'resizing':
				this.scaled(opt);
				break;
			case 'rotate':
				this.rotated(opt);
				break;
			default:
				break;
		}
		this.handler.onModified?.(target);
		return undefined;
	};

	/**
	 * Moving event object
	 *
	 * @param {FabricEvent} opt
	 * @returns
	 */
	public moving = (opt: FabricEvent) => {
		const { target } = opt as any;
		if (this.handler.interactionMode === 'crop') {
			this.handler.cropHandler.moving(opt);
		} else {
			if (this.restoreCancelledDrag(target)) {
				return;
			}
			this.updateDragDuplicateMode(opt.e as MouseEvent);
			this.constrainMovement(opt as FabricEvent<MouseEvent>);
			if (this.handler.editable && this.handler.guidelineOption.enabled) {
				this.handler.guidelineHandler.movingGuidelines(target);
				this.restoreLockedCoordinate(target);
				this.handler.spacingGuidelineHandler.movingGuidelines(target, opt.e as MouseEvent, {
					disabledSnapAxes: this.getDisabledSpacingSnapAxes(target),
				});
				this.restoreLockedCoordinate(target);
			}
			if (this.dragDuplicateSession?.copyMode && this.dragDuplicateSession.target === target) {
				this.canvas.requestRenderAll();
				return;
			}
			if (this.syncMovingTarget(target)) {
				return;
			}
			this.handler.onMoving?.(target);
		}
	};

	private syncMovingTarget = (target: FabricObject) => {
		if (this.handler.isActiveSelection(target)) {
			const activeSelection = target as fabric.ActiveSelection;
			activeSelection.getObjects().forEach((obj: any) => {
				const left = obj.left + target.left + target.width / 2;
				const top = obj.top + target.top + target.height / 2;
				if (obj.superType === 'node') {
					this.handler.portHandler.setCoords({ ...obj, left, top });
				} else if (obj.superType === 'element') {
					const { id } = obj;
					const el = this.handler.elementHandler.findById(id);
					this.handler.elementHandler.setPositionByOrigin(el, obj, left, top);
				}
			});
			return true;
		}
		if (target.superType === 'node') {
			this.handler.portHandler.setCoords(target as NodeObject);
		} else if (target.superType === 'element') {
			const { id } = target;
			const el = this.handler.elementHandler.findById(id);
			this.handler.elementHandler.setPosition(el, target);
		}
		return false;
	};

	private beginMovement = (target?: FabricObject) => {
		if (!target) {
			this.movementConstraint = undefined;
			return;
		}
		this.movementConstraint = {
			left: target.left,
			target,
			top: target.top,
		};
	};

	private canDragDuplicate = (target: FabricObject) => {
		const isCloneable = (object: FabricObject) =>
			object.id !== 'workarea' &&
			object.superType !== 'link' &&
			object.superType !== 'port' &&
			object.cloneable !== false;

		if (!isCloneable(target)) {
			return false;
		}
		if (!this.handler.isActiveSelection(target)) {
			return true;
		}
		const objects = (target as fabric.ActiveSelection).getObjects() as FabricObject[];
		return objects.length > 0 && objects.every(isCloneable);
	};

	private createDragPreview = (
		object: FabricObject,
		bounds: ReturnType<FabricObject['getBoundingRect']> = object.getBoundingRect(),
	) => {
		const preview = object.cloneAsImage({
			enableRetinaScaling: false,
			withoutShadow: false,
		});
		preview.set({
			evented: false,
			excludeFromExport: true,
			left: bounds.left,
			originX: 'left',
			originY: 'top',
			selectable: false,
			top: bounds.top,
		});
		preview.setCoords();
		return preview;
	};

	private getDraggedNodes = (target: FabricObject) => {
		const objects = this.handler.isActiveSelection(target)
			? ((target as fabric.ActiveSelection).getObjects() as FabricObject[])
			: [target];
		return objects.filter((object): object is NodeObject => object.superType === 'node');
	};

	private getNodePorts = (nodes: NodeObject[]) => {
		const ports = nodes.flatMap(node => [...(node.toPort ? [node.toPort] : []), ...(node.fromPort ?? [])]);
		return [...new Set(ports)] as PortObject[];
	};

	private createPortPreview = (port: PortObject, connected: boolean) => {
		const originalConnected = !!port.connected;
		if (originalConnected === connected || !port.setConnected) {
			return this.createDragPreview(port);
		}

		const originalTransform = fabric.util.saveObjectTransform(port);
		const normalizedType = String(port.type).toLowerCase();
		const strokeWidth = port.strokeWidth ?? 0;
		let anchorTop = originalTransform.top;
		if (!originalConnected && normalizedType === 'fromport') {
			anchorTop -= port.height + strokeWidth;
		} else if (!originalConnected && normalizedType === 'toport') {
			anchorTop += port.height + strokeWidth;
		}

		port.setConnected(connected);
		port.setPosition?.(originalTransform.left, anchorTop);
		const preview = this.createDragPreview(port);
		port.setConnected(originalConnected);
		port.set(originalTransform);
		port.setCoords();
		return preview;
	};

	private captureDragRelations = (session: DragDuplicateSession) => {
		const nodes = this.getDraggedNodes(session.target);
		if (!nodes.length) {
			return;
		}
		const ports = this.getNodePorts(nodes);
		const links = new Set<LinkObject>();
		ports.forEach(port => port.links?.forEach(link => links.add(link)));
		session.relatedLinks = [...links];
		const nodeIds = new Set(nodes.map(node => node.id));
		const internalLinks = session.relatedLinks.filter(
			link =>
				!!link.fromNode?.id &&
				!!link.toNode?.id &&
				nodeIds.has(link.fromNode.id) &&
				nodeIds.has(link.toNode.id),
		);
		const connectedPorts = new Set(internalLinks.flatMap(link => [link.fromPort, link.toPort]).filter(Boolean));
		session.linkPreviews = internalLinks.map(link => this.createDragPreview(link));
		session.portPreviews = ports.map(port => this.createPortPreview(port, connectedPorts.has(port)));
		session.portStartTransforms = new Map(ports.map(port => [port, fabric.util.saveObjectTransform(port)]));
	};

	private restoreDragRelations = (session: DragDuplicateSession) => {
		session.portStartTransforms?.forEach((transform, port) => {
			port.set(transform);
			port.setCoords();
		});
		session.relatedLinks?.forEach(link => {
			if (link.fromPort && link.toPort) {
				link.update(link.fromPort, link.toPort);
			}
		});
	};

	private beginDragDuplicate = (target: FabricObject | undefined, event: MouseEvent) => {
		this.dragDuplicateSession = undefined;
		if (!target || !this.handler.canvasActions.dragDuplicate || !this.canDragDuplicate(target)) {
			return;
		}
		this.dragDuplicateSession = {
			cancelled: false,
			copyMode: false,
			startBounds: target.getBoundingRect(),
			startTransform: fabric.util.saveObjectTransform(target),
			target,
		};
		this.captureDragRelations(this.dragDuplicateSession);
		this.updateDragDuplicateMode(event);
	};

	private updateDragDuplicateMode = (event: Pick<MouseEvent | KeyboardEvent, 'ctrlKey' | 'metaKey'>) => {
		const session = this.dragDuplicateSession;
		if (!session || session.cancelled) {
			return;
		}
		const copyMode = !!(event.ctrlKey || event.metaKey);
		if (session.copyMode === copyMode && (!copyMode || session.preview)) {
			return;
		}
		session.copyMode = copyMode;
		if (copyMode && !session.preview) {
			session.preview = this.createDragPreview(session.target, session.startBounds);
		}
		if (copyMode) {
			this.restoreDragRelations(session);
		} else {
			this.syncMovingTarget(session.target);
		}
		this.canvas.requestRenderAll();
	};

	private renderDragDuplicatePreview = ({ ctx }: { ctx: CanvasRenderingContext2D }) => {
		const session = this.dragDuplicateSession;
		if (!session?.copyMode || session.cancelled || !session.preview) {
			return;
		}
		const viewportTransform = this.canvas.viewportTransform || fabric.iMatrix;
		ctx.save();
		ctx.transform(...viewportTransform);
		session.preview.render(ctx);
		ctx.save();
		ctx.translate(
			session.target.left - session.startTransform.left,
			session.target.top - session.startTransform.top,
		);
		session.linkPreviews?.forEach(preview => preview.render(ctx));
		session.portPreviews?.forEach(preview => preview.render(ctx));
		ctx.restore();
		ctx.restore();
	};

	private restoreDragStart = (session: DragDuplicateSession) => {
		session.target.set(session.startTransform);
		session.target.setCoords();
		this.syncMovingTarget(session.target);
	};

	private restoreCancelledDrag = (target: FabricObject) => {
		const session = this.dragDuplicateSession;
		if (!session?.cancelled || session.target !== target) {
			return false;
		}
		this.restoreDragStart(session);
		this.canvas.requestRenderAll();
		return true;
	};

	private cancelDrag = () => {
		const session = this.dragDuplicateSession;
		if (!session) {
			return false;
		}
		session.cancelled = true;
		session.copyMode = false;
		session.preview = undefined;
		this.restoreDragStart(session);
		this.canvas.requestRenderAll();
		return true;
	};

	private bindDuplicateObjectEvents = (object: FabricObject) => {
		if (object.dblclick) {
			object.on('mousedblclick', this.object.mousedblclick);
		}
	};

	private resetDuplicatedNodeRelations = (node: NodeObject) => {
		node.fromPort = undefined;
		node.toPort = undefined;
		node.ports = undefined;
	};

	private addDragDuplicate = (
		sourceObject: FabricObject,
		clonedObject: FabricObject,
		destinationTransform: ReturnType<typeof fabric.util.saveObjectTransform>,
	): DragDuplicateResult => {
		const nodeMap = new Map<string, NodeObject>();
		clonedObject.set(destinationTransform);
		clonedObject.setCoords();

		if (this.handler.isActiveSelection(clonedObject)) {
			const sourceObjects = (sourceObject as fabric.ActiveSelection).getObjects() as FabricObject[];
			const clonedSelection = clonedObject as fabric.ActiveSelection;
			const clonedObjects = clonedSelection.removeAll() as FabricObject[];

			clonedObjects.forEach((object, index) => {
				const source = sourceObjects[index];
				object.set({ evented: true, id: uuid() });
				object.setCoords();
				this.handler.canvas.add(object);
				this.bindDuplicateObjectEvents(object);
				if (object.superType === 'node') {
					const node = object as NodeObject;
					this.resetDuplicatedNodeRelations(node);
					this.handler.portHandler.create(node);
					if (source?.superType === 'node' && source.id) {
						nodeMap.set(source.id, node);
					}
				}
			});

			this.handler.objects = this.handler.getObjects();
			return {
				activate: () => {
					const activeSelection = new fabric.ActiveSelection(clonedObjects, {
						canvas: this.canvas,
						...this.handler.activeSelectionOption,
					}) as FabricObject;
					activeSelection.setCoords();
					(activeSelection as fabric.ActiveSelection).getObjects().forEach(object => object.setCoords());
					this.canvas.setActiveObject(activeSelection);
					this.handler.onAdd?.(activeSelection);
					return activeSelection;
				},
				nodeMap,
			};
		}

		clonedObject.set({ evented: true, id: uuid() });
		this.canvas.add(clonedObject);
		this.bindDuplicateObjectEvents(clonedObject);
		if (clonedObject.superType === 'node') {
			const node = clonedObject as NodeObject;
			this.resetDuplicatedNodeRelations(node);
			this.handler.portHandler.create(node);
			if (sourceObject.superType === 'node' && sourceObject.id) {
				nodeMap.set(sourceObject.id, node);
			}
		}
		clonedObject.setCoords();
		this.handler.objects = this.handler.getObjects();
		return {
			activate: () => {
				this.canvas.setActiveObject(clonedObject);
				this.handler.onAdd?.(clonedObject);
				return clonedObject;
			},
			nodeMap,
		};
	};

	private duplicateDragLinks = (links: LinkObject[], nodeMap: Map<string, NodeObject>) => {
		links.forEach(link => {
			const sourceFromNode = link.fromNode as NodeObject | undefined;
			const sourceToNode = link.toNode as NodeObject | undefined;
			if (!sourceFromNode?.id || !sourceToNode?.id) {
				return;
			}
			const fromNode = nodeMap.get(sourceFromNode.id);
			const toNode = nodeMap.get(sourceToNode.id);
			if (!fromNode?.id || !toNode?.id || !link.fromPort?.id || !link.toPort?.id) {
				return;
			}
			const serialized = link.toObject([
				...(this.handler.propertiesToInclude ?? []),
				...LINK_PROPERTIES_TO_INCLUDE,
			]) as Record<string, any>;
			const {
				fromNode: _fromNode,
				fromNodeId: _fromNodeId,
				fromPort: _fromPort,
				id: _id,
				toNode: _toNode,
				toNodeId: _toNodeId,
				toPort: _toPort,
				type,
				...linkProperties
			} = serialized;
			const linkOption = {
				...linkProperties,
				fromNodeId: fromNode.id,
				fromPortId: link.fromPort.id,
				id: uuid(),
				toNodeId: toNode.id,
				toPortId: link.toPort.id,
				type: type || link.type,
			};
			this.handler.linkHandler.create(linkOption);
		});
	};

	private rollbackDragDuplicate = (existingObjects: Set<FabricObject>, target: FabricObject) => {
		const addedObjects = (this.canvas.getObjects() as FabricObject[]).filter(
			object => !existingObjects.has(object),
		);
		addedObjects
			.filter(object => object.superType === 'link')
			.forEach(link => this.handler.linkHandler.remove(link as LinkObject));
		addedObjects.filter(object => object.superType !== 'link').forEach(object => this.canvas.remove(object));
		this.handler.objects = this.handler.getObjects();
		this.canvas.setActiveObject(target);
		this.canvas.requestRenderAll();
	};

	private createDragDuplicate = async (
		session: DragDuplicateSession,
		target: FabricObject,
		destinationTransform: ReturnType<typeof fabric.util.saveObjectTransform>,
		existingObjects: Set<FabricObject>,
	) => {
		try {
			const clonedObject = (await (target as any).clone(this.handler.propertiesToInclude)) as FabricObject;
			const { activate, nodeMap } = this.addDragDuplicate(session.target, clonedObject, destinationTransform);
			this.duplicateDragLinks(session.relatedLinks ?? [], nodeMap);
			const duplicate = activate();
			if (!this.handler.transactionHandler.active) {
				this.handler.transactionHandler.save('duplicate');
			}
			this.handler.onModified?.(duplicate);
			this.canvas.requestRenderAll();
			return true;
		} catch (error) {
			this.rollbackDragDuplicate(existingObjects, session.target);
			console.error('[EventHandler] Drag duplication failed:', error);
			return true;
		}
	};

	private completeDragDuplicate = (target: FabricObject, event: MouseEvent) => {
		const session = this.dragDuplicateSession;
		if (!session || session.target !== target) {
			return false;
		}
		this.updateDragDuplicateMode(event);
		if (session.cancelled) {
			this.dragDuplicateSession = undefined;
			this.restoreDragStart(session);
			this.canvas.requestRenderAll();
			return true;
		}
		if (!session.copyMode) {
			this.dragDuplicateSession = undefined;
			this.canvas.requestRenderAll();
			return false;
		}
		this.dragDuplicateSession = undefined;

		const destinationTransform = fabric.util.saveObjectTransform(target);
		const snappedPosition = this.handler.gridHandler.getSnappedPosition(target);
		destinationTransform.left = snappedPosition.left;
		destinationTransform.top = snappedPosition.top;
		const constraint = this.movementConstraint;
		if (event.shiftKey && constraint?.target === target) {
			if (constraint.axis === 'horizontal') {
				destinationTransform.top = constraint.top;
			} else if (constraint.axis === 'vertical') {
				destinationTransform.left = constraint.left;
			}
		}
		this.restoreDragStart(session);
		this.canvas.requestRenderAll();
		const existingObjects = new Set(this.canvas.getObjects() as FabricObject[]);
		return this.createDragDuplicate(session, target, destinationTransform, existingObjects);
	};

	private restoreLockedCoordinate = (target?: FabricObject) => {
		const constraint = this.movementConstraint;
		if (!target || !constraint?.axis || constraint.target !== target) {
			return;
		}
		if (constraint.axis === 'horizontal') {
			target.set({ top: constraint.top });
		} else {
			target.set({ left: constraint.left });
		}
		target.setCoords();
	};

	private getDisabledSpacingSnapAxes = (target: FabricObject): SpacingAxis[] => {
		const disabledAxes = new Set<SpacingAxis>();
		if (this.handler.guidelineHandler.verticalLines.length) {
			disabledAxes.add('horizontal');
		}
		if (this.handler.guidelineHandler.horizontalLines.length) {
			disabledAxes.add('vertical');
		}
		const constraint = this.movementConstraint;
		if (constraint?.target === target && constraint.axis === 'horizontal') {
			disabledAxes.add('vertical');
		} else if (constraint?.target === target && constraint.axis === 'vertical') {
			disabledAxes.add('horizontal');
		}
		return (['horizontal', 'vertical'] as SpacingAxis[]).filter(axis => disabledAxes.has(axis));
	};

	public constrainMovement = (opt: FabricEvent<MouseEvent>) => {
		const { e, target } = opt;
		if (!this.handler.canvasActions.axisLock || !target) {
			return;
		}
		if (!e.shiftKey) {
			if (this.movementConstraint?.target === target) {
				this.movementConstraint.axis = undefined;
			}
			return;
		}

		if (!this.movementConstraint || this.movementConstraint.target !== target) {
			const original = (opt as any).transform?.original;
			this.movementConstraint = {
				left: original?.left ?? target.left,
				target,
				top: original?.top ?? target.top,
			};
		}

		const constraint = this.movementConstraint;
		if (!constraint.axis) {
			const deltaX = target.left - constraint.left;
			const deltaY = target.top - constraint.top;
			if (deltaX === 0 && deltaY === 0) {
				return;
			}
			constraint.axis = Math.abs(deltaX) >= Math.abs(deltaY) ? 'horizontal' : 'vertical';
		}
		this.restoreLockedCoordinate(target);
	};

	/**
	 * Moved event object
	 *
	 * @param {FabricEvent} opt
	 */
	public moved = (opt: FabricEvent) => {
		const { target } = opt;
		this.handler.gridHandler.setCoords(target);
		if ((opt.e as MouseEvent).shiftKey) {
			this.restoreLockedCoordinate(target);
			this.syncMovingTarget(target);
		}
		if (!this.handler.transactionHandler.active) {
			this.handler.transactionHandler.save('moved');
		}
		if (target.superType === 'element') {
			const { id } = target;
			const el = this.handler.elementHandler.findById(id);
			this.handler.elementHandler.setPosition(el, target);
		}
	};

	/**
	 * Scaling event object
	 *
	 * @param {FabricEvent} opt
	 */
	public scaling = (opt: FabricEvent) => {
		const { target } = opt as any;
		if (this.handler.interactionMode === 'crop') {
			this.handler.cropHandler.resize(opt);
		}
		// TODO...this.handler.guidelineHandler.scalingGuidelines(target);
		if (target.superType === 'element') {
			const { id, width, height } = target;
			const el = this.handler.elementHandler.findById(id);
			// update the element
			this.handler.elementHandler.setScaleOrAngle(el, target);
			this.handler.elementHandler.setSize(el, target);
			this.handler.elementHandler.setPosition(el, target);
			const video = target as VideoObject;
			if (video.type === 'video' && video.player) {
				video.player.setPlayerSize(width, height);
			}
		}
	};

	/**
	 * Scaled event object
	 *
	 * @param {FabricEvent} opt
	 */
	public scaled = (_opt: FabricEvent) => {
		if (!this.handler.transactionHandler.active) {
			this.handler.transactionHandler.save('scaled');
		}
	};

	/**
	 * Rotating event object
	 *
	 * @param {FabricEvent} opt
	 */
	public rotating = (opt: FabricEvent) => {
		const { target } = opt as any;
		if (target.superType === 'element') {
			const { id } = target;
			const el = this.handler.elementHandler.findById(id);
			// update the element
			this.handler.elementHandler.setScaleOrAngle(el, target);
		}
	};

	/**
	 * Rotated event object
	 *
	 * @param {FabricEvent} opt
	 */
	public rotated = (_opt: FabricEvent) => {
		if (!this.handler.transactionHandler.active) {
			this.handler.transactionHandler.save('rotated');
		}
	};

	/**
	 * Moing object at keyboard arrow key down event
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public arrowmoving = (e: KeyboardEvent) => {
		const activeObject = this.canvas.getActiveObject() as FabricObject;
		if (!activeObject) {
			return false;
		}
		if (activeObject.id === 'workarea') {
			return false;
		}
		if (e.code === code.ARROW_UP) {
			activeObject.set('top', activeObject.top - 2);
			activeObject.setCoords();
			this.canvas.renderAll();
			return true;
		} else if (e.code === code.ARROW_DOWN) {
			activeObject.set('top', activeObject.top + 2);
			activeObject.setCoords();
			this.canvas.renderAll();
			return true;
		} else if (e.code === code.ARROW_LEFT) {
			activeObject.set('left', activeObject.left - 2);
			activeObject.setCoords();
			this.canvas.renderAll();
			return true;
		} else if (e.code === code.ARROW_RIGHT) {
			activeObject.set('left', activeObject.left + 2);
			activeObject.setCoords();
			this.canvas.renderAll();
			return true;
		}
		if (this.handler.onModified) {
			this.handler.onModified(activeObject);
		}
		return true;
	};

	/**
	 * Zoom at mouse wheel event
	 *
	 * @param {FabricEvent<WheelEvent>} opt
	 * @returns
	 */
	public mousewheel = (opt: FabricEvent) => {
		const event = opt.e as WheelEvent;
		event.preventDefault();
		event.stopPropagation();
		const { canvasActions } = this.handler;
		if (event.ctrlKey) {
			if (!canvasActions.zoom) {
				return;
			}
			const delta = event.deltaY;
			let zoomRatio = this.canvas.getZoom();
			if (delta > 0) {
				zoomRatio -= this.handler.zoomStep;
			} else {
				zoomRatio += this.handler.zoomStep;
			}
			this.handler.zoomHandler.zoomToPoint(
				new fabric.Point(this.canvas.getWidth() / 2, this.canvas.getHeight() / 2),
				zoomRatio,
			);
		} else {
			if (!canvasActions.scroll) {
				return;
			}
			const deltaY = event.deltaY / 2;
			const [scaleX, skewY, skewX, scaleY, panX, panY] = this.canvas.viewportTransform;
			this.canvas.setViewportTransform([
				scaleX,
				skewY,
				skewX,
				scaleY,
				event.shiftKey ? panX - deltaY : panX,
				event.shiftKey ? panY : panY - deltaY,
			]);
		}
		this.canvas.requestRenderAll();
	};

	/**
	 * Mouse down event on object
	 *
	 * @param {FabricEvent<MouseEvent>} opt
	 * @returns
	 */
	public mousedown = (opt: FabricEvent) => {
		const { target, subTargets = [] } = opt as FabricEvent<MouseEvent>;
		const actionTarget = subTargets[0];
		this.beginMovement(target);
		this.beginDragDuplicate(target, opt.e as MouseEvent);
		if (target) {
			this.handler.onClick?.(this.canvas, target, actionTarget);
		}
		const { editable, canvasActions } = this.handler;
		if (canvasActions.grab && this.handler.interactionMode === 'grab') {
			this.panning = true;
			this.handler.interactionHandler.setCursor('grabbing');
			return;
		}
		if (editable) {
			if (this.handler.prevTarget && this.handler.prevTarget.superType === 'link') {
				this.handler.prevTarget.setColor(
					this.handler.prevTarget.originStroke || this.handler.prevTarget.stroke,
				);
			}
			if (
				this.handler.interactionMode !== 'link' &&
				target?.superType === 'node' &&
				subTargets.length &&
				actionTarget === (target as fabric.Group).getObjects()[(target as fabric.Group).getObjects().length - 1]
			) {
				this.canvas.discardActiveObject();
				this.canvas.requestRenderAll();
				return;
			}
			if (target?.isType('fromPort')) {
				this.handler.linkHandler.init(target as any);
				return;
			}
			if (
				target &&
				this.handler.interactionMode === 'link' &&
				(target.isType('toPort') || target.superType === 'node')
			) {
				let toPort;
				if (target.superType === 'node') {
					toPort = target.toPort;
				} else {
					toPort = target;
				}
				this.handler.linkHandler.generate(toPort);
				return;
			}
			if (this.handler.interactionMode === 'selection') {
				if (target && target.superType === 'link') {
					target.line.set({ stroke: target.selectedStroke || 'green' });
					target.arrow.set({ fill: target.selectedStroke || 'green' });
				}
				this.handler.prevTarget = target;
				return;
			}
			if (this.handler.interactionMode === 'polygon') {
				if (target && this.handler.pointArray.length && target.id === this.handler.pointArray[0].id) {
					this.handler.drawingHandler.polygon.generate(this.handler.pointArray);
				} else {
					this.handler.drawingHandler.polygon.addPoint(opt);
				}
			} else if (this.handler.interactionMode === 'line') {
				if (this.handler.pointArray.length && this.handler.activeLine) {
					this.handler.drawingHandler.line.generate(opt);
				} else {
					this.handler.drawingHandler.line.addPoint(opt);
				}
			} else if (this.handler.interactionMode === 'arrow') {
				if (this.handler.pointArray.length && this.handler.activeLine) {
					this.handler.drawingHandler.arrow.generate(opt);
				} else {
					this.handler.drawingHandler.arrow.addPoint(opt);
				}
			}
		}
	};

	/**
	 * Mouse move event on canvas
	 *
	 * @param {FabricEvent<MouseEvent>} opt
	 * @returns
	 */
	public mousemove = (opt: FabricEvent) => {
		const event = opt as FabricEvent<MouseEvent>;
		if (this.handler.interactionMode === 'grab' && this.panning) {
			this.handler.interactionHandler.moving(event.e);
			this.canvas.requestRenderAll();
		}
		if (!this.handler.editable && event.target) {
			if (event.target.superType === 'element') {
				return;
			}
			if (event.target.id !== 'workarea') {
				if (event.target !== this.handler.target) {
					this.handler.tooltipHandler.show(event.target);
				}
			} else {
				this.handler.tooltipHandler.hide();
			}
		}
		if (this.handler.interactionMode === 'polygon') {
			if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
				const pointer = this.canvas.getPointer(event.e);
				this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
				const points = this.handler.activeShape.get('points');
				points[this.handler.pointArray.length] = {
					x: pointer.x,
					y: pointer.y,
				};
				this.handler.activeShape.set({ points });
				this.canvas.requestRenderAll();
			}
		} else if (this.handler.interactionMode === 'line') {
			if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
				const pointer = this.canvas.getPointer(event.e);
				this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
			}
			this.canvas.requestRenderAll();
		} else if (this.handler.interactionMode === 'arrow') {
			if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
				const pointer = this.canvas.getPointer(event.e);
				this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
			}
			this.canvas.requestRenderAll();
		} else if (this.handler.interactionMode === 'link') {
			if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
				const pointer = this.canvas.getPointer(event.e);
				this.handler.activeLine.update(this.handler.activeLine.fromPort, { left: pointer.x, top: pointer.y });
			}
			this.canvas.requestRenderAll();
		}
		return;
	};

	/**
	 * Mouse up event on canvas
	 *
	 * @param {FabricEvent<MouseEvent>} opt
	 * @returns
	 */
	public mouseup = (opt: FabricEvent) => {
		const event = opt as FabricEvent<MouseEvent>;
		if (this.handler.interactionMode === 'grab') {
			this.panning = false;
			this.handler.interactionHandler.setCursor('grab');
			this.movementConstraint = undefined;
			return;
		}
		const { target, e } = event;
		if (this.handler.interactionMode === 'selection') {
			if (target && e.shiftKey && event.isClick !== false && target.superType === 'node') {
				const node = target as NodeObject;
				this.canvas.discardActiveObject();
				const nodes = [] as NodeObject[];
				this.handler.nodeHandler.getNodePath(node, nodes);
				const activeSelection = new fabric.ActiveSelection(nodes, {
					canvas: this.canvas,
					...this.handler.activeSelectionOption,
				});
				this.canvas.setActiveObject(activeSelection);
				if (this.handler.shouldHighlightPathOnSelect) {
					this.handler.nodeHandler.selectByPath(nodes.map(node => node.id));
				}
				this.canvas.requestRenderAll();
			}
		}
		this.movementConstraint = undefined;
		this.dragDuplicateSession = undefined;
		if (this.handler.editable && this.handler.guidelineOption.enabled) {
			this.handler.guidelineHandler.verticalLines.length = 0;
			this.handler.guidelineHandler.horizontalLines.length = 0;
			this.handler.spacingGuidelineHandler.clear();
		}
		this.canvas.renderAll();
	};

	/**
	 * Mouse out event on canvas
	 *
	 * @param {FabricEvent<MouseEvent>} opt
	 */
	public mouseout = (opt: FabricEvent) => {
		const { target } = opt as FabricEvent<MouseEvent>;
		if (!target) {
			this.handler.tooltipHandler.hide();
		}
	};

	/**
	 * Selection event event on canvas
	 *
	 * @param {FabricEvent} opt
	 */
	public selection = (_opt: FabricEvent) => {
		const { activeSelectionOption } = this.handler;
		const target = (this.canvas.getActiveObject() as FabricObject) ?? null;
		if (target && target.isType('ActiveSelection')) {
			target.set({ ...activeSelectionOption });
		}
		this.currentTarget = target;
		this.handler.transactionHandler.rememberSelection(target);
		this.handler.onSelect?.(target);
	};

	/**
	 * Called resize event on canvas
	 *
	 * @param {number} nextWidth
	 * @param {number} nextHeight
	 * @returns
	 */
	public resize = (nextWidth: number, nextHeight: number) => {
		const rulerInset = this.handler.rulerHandler?.getViewportInset?.() || 0;
		const viewportWidth = Math.max(nextWidth - rulerInset, 0);
		const viewportHeight = Math.max(nextHeight - rulerInset, 0);
		this.canvas.setWidth(viewportWidth);
		this.canvas.setHeight(viewportHeight);
		this.canvas.backgroundColor = this.handler.canvasOption.backgroundColor;
		this.canvas.renderAll();
		const previousWidth = this.handler.width || viewportWidth;
		const previousHeight = this.handler.height || viewportHeight;
		this.handler.width = viewportWidth;
		this.handler.height = viewportHeight;
		if (!this.handler.workarea) {
			return;
		}
		const diffWidth = viewportWidth / 2 - previousWidth / 2;
		const diffHeight = viewportHeight / 2 - previousHeight / 2;
		if (this.handler.workarea.layout === 'fixed') {
			this.canvas.centerObject(this.handler.workarea);
			this.handler.workarea.setCoords();
			if (this.handler.gridOption.enabled) {
				return;
			}
			this.canvas.getObjects().forEach((obj: FabricObject) => {
				if (obj.id !== 'workarea') {
					const left = obj.left + diffWidth;
					const top = obj.top + diffHeight;
					obj.set({
						left,
						top,
					});
					obj.setCoords();
					if (obj.superType === 'element') {
						const { id } = obj;
						const el = this.handler.elementHandler.findById(id);
						// update the element
						this.handler.elementHandler.setPosition(el, obj);
					}
				}
			});
			this.canvas.requestRenderAll();
			return;
		}
		if (this.handler.workarea.layout === 'responsive') {
			const { scaleX } = this.handler.workareaHandler.calculateScale();
			const center = this.canvas.getCenter();
			const deltaPoint = new fabric.Point(diffWidth, diffHeight);
			this.canvas.relativePan(deltaPoint);
			this.handler.zoomHandler.zoomToPoint(new fabric.Point(center.left, center.top), scaleX);
			return;
		}
		const scaleX = viewportWidth / this.handler.workarea.width;
		const scaleY = viewportHeight / this.handler.workarea.height;
		const diffScaleX = viewportWidth / (this.handler.workarea.width * this.handler.workarea.scaleX);
		const diffScaleY = viewportHeight / (this.handler.workarea.height * this.handler.workarea.scaleY);
		this.handler.workarea.set({
			scaleX,
			scaleY,
		});
		this.canvas.getObjects().forEach((obj: any) => {
			const { id } = obj;
			if (obj.id !== 'workarea') {
				const left = obj.left * diffScaleX;
				const top = obj.top * diffScaleY;
				const newScaleX = obj.scaleX * diffScaleX;
				const newScaleY = obj.scaleY * diffScaleY;
				obj.set({
					scaleX: newScaleX,
					scaleY: newScaleY,
					left,
					top,
				});
				obj.setCoords();
				if (obj.superType === 'element') {
					const video = obj as VideoObject;
					const { width, height } = obj;
					const el = this.handler.elementHandler.findById(id);
					this.handler.elementHandler.setSize(el, obj);
					if (video.player) {
						video.player.setPlayerSize(width, height);
					}
					this.handler.elementHandler.setPosition(el, obj);
				}
			}
		});
		this.canvas.renderAll();
	};

	/**
	 * Paste event on canvas
	 *
	 * @param {ClipboardEvent} e
	 * @returns
	 */
	public paste = async (e: ClipboardEvent) => {
		if (this.canvas.wrapperEl !== document.activeElement) {
			return false;
		}
		if (e.preventDefault) {
			e.preventDefault();
		}
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		const clipboardData = e.clipboardData;
		if (clipboardData.types.length) {
			clipboardData.types.forEach((clipboardType: string) => {
				if (clipboardType === 'text/plain') {
					const textPlain = clipboardData.getData('text/plain');
					try {
						const objects = JSON.parse(textPlain);
						const {
							gridOption: { grid = 10 },
							isCut,
						} = this.handler;
						const padding = isCut ? 0 : grid;
						if (objects && Array.isArray(objects)) {
							const filteredObjects = objects.filter(obj => obj !== null);
							if (!filteredObjects.length) {
								return;
							}
							const objectPayloads = filteredObjects.filter(obj => obj.superType !== 'link');
							const linkPayloads = filteredObjects.filter(obj => obj.superType === 'link');
							const nodes = [] as FabricObject[];
							const targets = [] as FabricObject[];
							let activeObject: FabricObject | undefined;

							this.handler.runBatch(() => {
								objectPayloads.forEach(source => {
									if (typeof source.cloneable !== 'undefined' && !source.cloneable) {
										return;
									}
									const obj = {
										...source,
										left: source.properties?.left + padding,
										top: source.properties?.top + padding,
									};
									const createdObject = this.handler.add(obj, false, true) as FabricObject;
									if (obj.superType === 'node') {
										nodes.push(createdObject);
									} else {
										targets.push(createdObject);
									}
								});

								this.handler.objects = this.handler.getObjects();
								linkPayloads.forEach(source => {
									const fromNode = nodes[source.fromNodeIndex] as NodeObject | undefined;
									const toNode = nodes[source.toNodeIndex] as NodeObject | undefined;
									if (!fromNode?.id || !toNode?.id) {
										return;
									}
									this.handler.add(
										{
											...source,
											fromNodeId: fromNode.id,
											toNodeId: toNode.id,
											toPortId: source.toPortId ?? toNode.toPort?.id,
										},
										false,
										true,
									);
								});

								const selectionObjects = nodes.length ? nodes : targets;
								if (selectionObjects.length === 1) {
									activeObject = selectionObjects[0];
								} else if (selectionObjects.length > 1) {
									activeObject = new fabric.ActiveSelection(selectionObjects, {
										canvas: this.canvas,
										...this.handler.activeSelectionOption,
									}) as FabricObject;
								}
								if (activeObject) {
									this.canvas.setActiveObject(activeObject);
								}
							});
							this.handler.onAdd?.(activeObject);
							if (!this.handler.transactionHandler.active) {
								this.handler.transactionHandler.save('paste');
							}
							this.handler.isCut = false;
							this.handler.copy();
						}
					} catch (error) {
						console.error(error);
						// const item = {
						//     id: uuv4id(),
						//     type: 'textbox',
						//     text: textPlain,
						// };
						// this.handler.add(item, true);
					}
				} else if (clipboardType === 'text/html') {
					// Todo ...
					// const textHtml = clipboardData.getData('text/html');
					// console.log(textHtml);
				} else if (clipboardType === 'Files') {
					// Array.from(clipboardData.files).forEach((file) => {
					//     const { type } = file;
					//     if (type === 'image/png' || type === 'image/jpeg' || type === 'image/jpg') {
					//         const item = {
					//             id: uuid(),
					//             type: 'image',
					//             file,
					//             superType: 'image',
					//         };
					//         this.handler.add(item, true);
					//     } else {
					//         console.error('Not supported file type');
					//     }
					// });
				}
			});
		}
		return true;
	};

	/**
	 * Keydown event on document
	 *
	 * @param {KeyboardEvent} e
	 */
	public keydown = (e: KeyboardEvent) => {
		const { canvasActions, editable } = this.handler;
		if (!Object.keys(canvasActions).length) {
			return;
		}
		if (this.dragDuplicateSession) {
			if (this.handler.shortcutHandler.isEscape(e)) {
				e.preventDefault();
				this.cancelDrag();
				return;
			}
			this.updateDragDuplicateMode(e);
		}
		const { clipboard, grab } = canvasActions;
		if (this.handler.interactionHandler.isDrawingMode()) {
			if (this.handler.shortcutHandler.isEscape(e)) {
				if (this.handler.interactionMode === 'polygon') {
					this.handler.drawingHandler.polygon.finish();
				} else if (this.handler.interactionMode === 'line') {
					this.handler.drawingHandler.line.finish();
				} else if (this.handler.interactionMode === 'arrow') {
					this.handler.drawingHandler.arrow.finish();
				} else if (this.handler.interactionMode === 'link') {
					this.handler.linkHandler.finish();
				}
			}
			return;
		}
		if (this.handler.shortcutHandler.isW(e) && grab) {
			this.code = e.code;
			this.handler.interactionHandler.grab();
			return;
		}
		if (this.handler.interactionMode !== 'grab' && this.handler.shortcutHandler.isSpace(e) && grab) {
			this.isSpacePanning = true;
			this.handler.interactionHandler.grab();
			return;
		}
		if (this.handler.shortcutHandler.isEscape(e)) {
			if (this.handler.interactionMode === 'selection') {
				this.canvas.discardActiveObject();
				this.canvas.renderAll();
			}
			this.handler.tooltipHandler.hide();
		}
		if (this.canvas.wrapperEl !== document.activeElement) {
			return;
		}
		if (editable) {
			if (this.handler.shortcutHandler.isQ(e)) {
				this.code = e.code;
			} else if (this.handler.shortcutHandler.isDelete(e)) {
				this.handler.remove();
			} else if (this.handler.shortcutHandler.isArrow(e)) {
				this.arrowmoving(e);
			} else if (this.handler.shortcutHandler.isCtrlA(e)) {
				e.preventDefault();
				this.handler.selectAll();
			} else if (this.handler.shortcutHandler.isCtrlC(e)) {
				e.preventDefault();
				this.handler.copy();
			} else if (this.handler.shortcutHandler.isCtrlV(e) && !clipboard) {
				e.preventDefault();
				this.handler.paste();
			} else if (this.handler.shortcutHandler.isCtrlX(e)) {
				e.preventDefault();
				this.handler.cut();
			} else if (this.handler.shortcutHandler.isCtrlZ(e)) {
				e.preventDefault();
				this.handler.transactionHandler.undo();
			} else if (this.handler.shortcutHandler.isCtrlY(e)) {
				e.preventDefault();
				this.handler.transactionHandler.redo();
			} else if (this.handler.shortcutHandler.isPlus(e)) {
				e.preventDefault();
				this.handler.zoomHandler.zoomIn();
			} else if (this.handler.shortcutHandler.isMinus(e)) {
				e.preventDefault();
				this.handler.zoomHandler.zoomOut();
			} else if (this.handler.shortcutHandler.isO(e)) {
				e.preventDefault();
				this.handler.zoomHandler.zoomOneToOne();
			} else if (this.handler.shortcutHandler.isP(e)) {
				e.preventDefault();
				this.handler.zoomHandler.zoomToFit();
			}
			return;
		}
		return;
	};

	/**
	 * Key up event on canvas
	 *
	 * @param {KeyboardEvent} _e
	 */
	public keyup = (e: KeyboardEvent) => {
		if (this.handler.interactionHandler.isDrawingMode()) {
			return;
		}
		this.updateDragDuplicateMode(e);
		if (this.handler.shortcutHandler.isW({ code: this.code } as any) && this.handler.shortcutHandler.isSpace(e)) {
			this.isSpacePanning = false;
			return;
		}
		if (!this.handler.shortcutHandler.isW({ code: this.code } as any) && !this.handler.shortcutHandler.isW(e)) {
			this.handler.interactionHandler.selection();
			this.code = e.code;
		}
	};

	/**
	 * Context menu event on canvas
	 *
	 * @param {MouseEvent} e
	 */
	public contextmenu = (e: MouseEvent) => {
		e.preventDefault();
		const { editable, onContext } = this.handler;
		if (editable && onContext) {
			const target = this.canvas.findTarget(e as any) as FabricObject;
			if (target && !this.handler.isActiveSelection(target)) {
				this.handler.select(target);
			}
			this.handler.contextmenuHandler.show(e, target);
		}
	};

	public blur = (_e: FocusEvent) => {
		this.movementConstraint = undefined;
		this.dragDuplicateSession = undefined;
		if (this.handler.shortcutHandler.isW({ code: this.code } as any)) {
			return;
		}
		if (this.isSpacePanning) {
			this.handler.interactionHandler.selection();
		}
	};

	/**
	 * Mouse down event on canvas
	 *
	 * @param {MouseEvent} _e
	 */
	public onmousedown = (_e: MouseEvent) => {
		this.handler.contextmenuHandler.hide();
	};
}

export default EventHandler;
