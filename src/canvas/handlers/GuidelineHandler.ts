import * as fabric from 'fabric';
import { FabricEvent, FabricObject } from '../models';
import type Handler from './Handler';

class GuidelineHandler {
	handler: Handler;
	verticalLines: { x?: number; y1?: number; y2?: number }[];
	horizontalLines: { y?: number; x1?: number; x2?: number }[];
	ctx: CanvasRenderingContext2D;
	private transformKeys = new WeakMap<FabricObject, number[]>();

	aligningLineOffset = 5;
	aligningLineMargin = 4;
	aligningLineWidth = 1;
	aligningLineColor = 'rgb(255, 0, 0)';

	constructor(handler: Handler) {
		this.handler = handler;
		this.initialize();
	}

	/**
	 * Initialize guideline handler
	 *
	 */
	public initialize() {
		if (this.handler.guidelineOption.enabled) {
			this.handler.canvas.on({
				'before:render': this.beforeRender,
				'after:render': this.afterRender,
			} as any);
		} else {
			this.handler.canvas.off({
				'before:render': this.beforeRender,
				'after:render': this.afterRender,
			} as any);
		}
		this.ctx = this.handler.canvas.getSelectionContext();
		this.aligningLineOffset = 5;
		this.aligningLineMargin = 4;
		this.aligningLineWidth = 1;
		this.aligningLineColor = 'rgb(255, 0, 0)';
		this.verticalLines = [];
		this.horizontalLines = [];
	}

	/**
	 * Destroy guideline handler
	 *
	 * @author salgum1114
	 */
	public destroy() {
		this.handler.canvas.off({
			'before:render': this.beforeRender,
			'after:render': this.afterRender,
		} as any);
	}

	/**
	 * Before the render
	 *
	 * @param {FabricEvent} _opt
	 */
	public beforeRender = (_opt: FabricEvent) => {
		this.handler.canvas.clearContext(this.handler.guidelineHandler.ctx);
	};

	/**
	 * After the render
	 *
	 * @param {FabricEvent} _opt
	 */
	public afterRender = (_opt: FabricEvent) => {
		for (let i = this.handler.guidelineHandler.verticalLines.length; i--; ) {
			this.handler.guidelineHandler.drawVerticalLine(this.handler.guidelineHandler.verticalLines[i]);
		}
		for (let i = this.handler.guidelineHandler.horizontalLines.length; i--; ) {
			this.handler.guidelineHandler.drawHorizontalLine(this.handler.guidelineHandler.horizontalLines[i]);
		}
		this.handler.guidelineHandler.verticalLines.length = 0;
		this.handler.guidelineHandler.horizontalLines.length = 0;
	};

	drawVerticalLine = (coords: { x?: number; y1?: number; y2?: number }) => {
		this.drawLine(
			coords.x,
			coords.y1 > coords.y2 ? coords.y2 : coords.y1,
			coords.x,
			coords.y2 > coords.y1 ? coords.y2 : coords.y1,
		);
	};

	drawHorizontalLine = (coords: { y?: number; x1?: number; x2?: number }) => {
		this.drawLine(
			coords.x1 > coords.x2 ? coords.x2 : coords.x1,
			coords.y,
			coords.x2 > coords.x1 ? coords.x2 : coords.x1,
			coords.y,
		);
	};

	drawLine = (x1: number, y1: number, x2: number, y2: number) => {
		const { ctx, aligningLineWidth, aligningLineColor } = this;
		const { viewportTransform } = this.handler.canvas;
		const zoom = this.handler.canvas.getZoom() || 1;
		ctx.save();
		ctx.transform(...viewportTransform);
		ctx.lineWidth = aligningLineWidth / zoom;
		ctx.strokeStyle = aligningLineColor;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		ctx.restore();
	};

	isInRange = (v1: number, v2: number) => {
		const { aligningLineMargin } = this;
		const zoom = this.handler.canvas.getZoom() || 1;
		return Math.abs(v1 - v2) <= aligningLineMargin / zoom;
	};

	private getBoundingRect = (object: FabricObject) => {
		const transformKey = [...object.transformMatrixKey(), Number(object.strokeUniform)];
		const previousKey = this.transformKeys.get(object);
		if (
			!previousKey ||
			previousKey.length !== transformKey.length ||
			transformKey.some((value, index) => value !== previousKey[index])
		) {
			object.setCoords();
			this.transformKeys.set(object, transformKey);
		}
		return object.getBoundingRect();
	};

	private setCenterX = (target: FabricObject, x: number) => {
		const center = target.getCenterPoint();
		target.setPositionByOrigin(new fabric.Point(x, center.y), 'center', 'center');
	};

	private setCenterY = (target: FabricObject, y: number) => {
		const center = target.getCenterPoint();
		target.setPositionByOrigin(new fabric.Point(center.x, y), 'center', 'center');
	};

	movingGuidelines = (target: FabricObject) => {
		const canvasObjects = this.handler.canvas.getObjects() as FabricObject[];
		const selectionObjects = target.isType('ActiveSelection')
			? new Set((target as fabric.ActiveSelection).getObjects())
			: undefined;
		target.setCoords();
		const activeObjectBoundingRect = target.getBoundingRect();
		const activeObjectHeight = activeObjectBoundingRect.height;
		const activeObjectWidth = activeObjectBoundingRect.width;
		const activeObjectLeft = activeObjectBoundingRect.left + activeObjectWidth / 2;
		const activeObjectTop = activeObjectBoundingRect.top + activeObjectHeight / 2;
		let horizontalInTheRange = false;
		let verticalInTheRange = false;
		const { _currentTransform: transform } = this.handler.canvas as any;
		if (!transform) {
			return;
		}

		// It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
		// but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move

		for (let i = canvasObjects.length; i--; ) {
			if (
				canvasObjects[i] === target ||
				selectionObjects?.has(canvasObjects[i]) ||
				canvasObjects[i].superType === 'port' ||
				canvasObjects[i].superType === 'link' ||
				!canvasObjects[i].evented
			) {
				continue;
			}

			const objectBoundingRect = this.getBoundingRect(canvasObjects[i]);
			const objectHeight = objectBoundingRect.height;
			const objectWidth = objectBoundingRect.width;
			const objectLeft = objectBoundingRect.left + objectWidth / 2;
			const objectTop = objectBoundingRect.top + objectHeight / 2;

			// snap by the horizontal center line
			if (this.isInRange(objectLeft, activeObjectLeft)) {
				verticalInTheRange = true;
				if (canvasObjects[i].id === 'workarea') {
					const y1 = -5000;
					const y2 = 5000;
					this.verticalLines.push({
						x: objectLeft,
						y1,
						y2,
					});
				} else {
					this.verticalLines.push({
						x: objectLeft,
						y1:
							objectTop < activeObjectTop
								? objectTop - objectHeight / 2 - this.aligningLineOffset
								: objectTop + objectHeight / 2 + this.aligningLineOffset,
						y2:
							activeObjectTop > objectTop
								? activeObjectTop + activeObjectHeight / 2 + this.aligningLineOffset
								: activeObjectTop - activeObjectHeight / 2 - this.aligningLineOffset,
					});
				}
				this.setCenterX(target, objectLeft);
			}

			// snap by the left edge
			if (this.isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
				verticalInTheRange = true;
				if (canvasObjects[i].id === 'workarea') {
					const y1 = -5000;
					const y2 = 5000;
					this.verticalLines.push({
						x: objectLeft - objectWidth / 2,
						y1,
						y2,
					});
				} else {
					this.verticalLines.push({
						x: objectLeft - objectWidth / 2,
						y1:
							objectTop < activeObjectTop
								? objectTop - objectHeight / 2 - this.aligningLineOffset
								: objectTop + objectHeight / 2 + this.aligningLineOffset,
						y2:
							activeObjectTop > objectTop
								? activeObjectTop + activeObjectHeight / 2 + this.aligningLineOffset
								: activeObjectTop - activeObjectHeight / 2 - this.aligningLineOffset,
					});
				}
				this.setCenterX(target, objectLeft - objectWidth / 2 + activeObjectWidth / 2);
			}

			// snap by the right edge
			if (this.isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
				verticalInTheRange = true;
				if (canvasObjects[i].id === 'workarea') {
					const y1 = -5000;
					const y2 = 5000;
					this.verticalLines.push({
						x: objectLeft + objectWidth / 2,
						y1,
						y2,
					});
				} else {
					this.verticalLines.push({
						x: objectLeft + objectWidth / 2,
						y1:
							objectTop < activeObjectTop
								? objectTop - objectHeight / 2 - this.aligningLineOffset
								: objectTop + objectHeight / 2 + this.aligningLineOffset,
						y2:
							activeObjectTop > objectTop
								? activeObjectTop + activeObjectHeight / 2 + this.aligningLineOffset
								: activeObjectTop - activeObjectHeight / 2 - this.aligningLineOffset,
					});
				}
				this.setCenterX(target, objectLeft + objectWidth / 2 - activeObjectWidth / 2);
			}

			// snap by the vertical center line
			if (this.isInRange(objectTop, activeObjectTop)) {
				horizontalInTheRange = true;
				if (canvasObjects[i].id === 'workarea') {
					const x1 = -5000;
					const x2 = 5000;
					this.horizontalLines.push({
						y: objectTop,
						x1,
						x2,
					});
				} else {
					this.horizontalLines.push({
						y: objectTop,
						x1:
							objectLeft < activeObjectLeft
								? objectLeft - objectWidth / 2 - this.aligningLineOffset
								: objectLeft + objectWidth / 2 + this.aligningLineOffset,
						x2:
							activeObjectLeft > objectLeft
								? activeObjectLeft + activeObjectWidth / 2 + this.aligningLineOffset
								: activeObjectLeft - activeObjectWidth / 2 - this.aligningLineOffset,
					});
				}
				this.setCenterY(target, objectTop);
			}

			// snap by the top edge
			if (this.isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
				horizontalInTheRange = true;
				if (canvasObjects[i].id === 'workarea') {
					const x1 = -5000;
					const x2 = 5000;
					this.horizontalLines.push({
						y: objectTop - objectHeight / 2,
						x1,
						x2,
					});
				} else {
					this.horizontalLines.push({
						y: objectTop - objectHeight / 2,
						x1:
							objectLeft < activeObjectLeft
								? objectLeft - objectWidth / 2 - this.aligningLineOffset
								: objectLeft + objectWidth / 2 + this.aligningLineOffset,
						x2:
							activeObjectLeft > objectLeft
								? activeObjectLeft + activeObjectWidth / 2 + this.aligningLineOffset
								: activeObjectLeft - activeObjectWidth / 2 - this.aligningLineOffset,
					});
				}
				this.setCenterY(target, objectTop - objectHeight / 2 + activeObjectHeight / 2);
			}

			// snap by the bottom edge
			if (this.isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
				horizontalInTheRange = true;
				if (canvasObjects[i].id === 'workarea') {
					const x1 = -5000;
					const x2 = 5000;
					this.horizontalLines.push({
						y: objectTop + objectHeight / 2,
						x1,
						x2,
					});
				} else {
					this.horizontalLines.push({
						y: objectTop + objectHeight / 2,
						x1:
							objectLeft < activeObjectLeft
								? objectLeft - objectWidth / 2 - this.aligningLineOffset
								: objectLeft + objectWidth / 2 + this.aligningLineOffset,
						x2:
							activeObjectLeft > objectLeft
								? activeObjectLeft + activeObjectWidth / 2 + this.aligningLineOffset
								: activeObjectLeft - activeObjectWidth / 2 - this.aligningLineOffset,
					});
				}
				this.setCenterY(target, objectTop + objectHeight / 2 - activeObjectHeight / 2);
			}
		}

		if (!horizontalInTheRange) {
			this.horizontalLines.length = 0;
		}

		if (!verticalInTheRange) {
			this.verticalLines.length = 0;
		}
	};

	scalingGuidelines = (_target: FabricObject) => {
		// TODO... object scaling guideline
	};
}

export default GuidelineHandler;
