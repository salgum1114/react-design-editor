import * as fabric from 'fabric';
import { FabricEvent, FabricObject } from '../models';
import type Handler from './Handler';

export type SpacingAxis = 'horizontal' | 'vertical';
export type SpacingGuideKind = 'distance' | 'equal';

export interface SpacingGuide {
	axis: SpacingAxis;
	cross: number;
	distance: number;
	end: number;
	kind: SpacingGuideKind;
	start: number;
}

export interface SpacingGuidelineConstraints {
	disabledSnapAxes?: SpacingAxis[];
}

interface ObjectBounds {
	bottom: number;
	centerX: number;
	centerY: number;
	height: number;
	left: number;
	right: number;
	top: number;
	width: number;
}

type CandidateDirection = 'left' | 'right' | 'top' | 'bottom';

interface SpacingCandidate {
	direction: CandidateDirection;
	guide: SpacingGuide;
}

interface EqualSpacingSnap {
	axis: SpacingAxis;
	correction: number;
	guides: SpacingGuide[];
}

class SpacingGuidelineHandler {
	public guides: SpacingGuide[] = [];
	public ctx: CanvasRenderingContext2D;
	public handler: Handler;

	private transformKeys = new WeakMap<FabricObject, number[]>();

	constructor(handler: Handler) {
		this.handler = handler;
		this.initialize();
	}

	public initialize = () => {
		this.ctx = this.handler.canvas.getSelectionContext();
		this.handler.canvas.off({
			'after:render': this.afterRender,
			'before:render': this.beforeRender,
		} as any);
		if (this.isEnabled()) {
			this.handler.canvas.on({
				'after:render': this.afterRender,
				'before:render': this.beforeRender,
			} as any);
		}
		this.clear();
	};

	public destroy = () => {
		this.handler.canvas.off({
			'after:render': this.afterRender,
			'before:render': this.beforeRender,
		} as any);
		this.clear();
	};

	public clear = () => {
		this.guides.length = 0;
	};

	public beforeRender = (_opt: FabricEvent) => {
		this.handler.canvas.clearContext(this.ctx);
	};

	public afterRender = (_opt: FabricEvent) => {
		this.guides.forEach(this.drawGuide);
		this.clear();
	};

	public movingGuidelines = (
		target: FabricObject,
		event?: Pick<MouseEvent, 'altKey'>,
		constraints?: SpacingGuidelineConstraints,
	) => {
		if (!this.isEnabled()) {
			this.clear();
			return;
		}
		const selectionObjects = target.isType('ActiveSelection')
			? new Set((target as fabric.ActiveSelection).getObjects())
			: undefined;
		const referenceBounds = this.handler.canvas
			.getObjects()
			.filter((object: FabricObject) => this.isEligibleObject(object, target, selectionObjects))
			.map((object: FabricObject) => this.getBounds(object));
		let targetBounds = this.getBounds(target, true);
		const equalSnaps = this.getEqualSpacingSnaps(
			targetBounds,
			referenceBounds,
			constraints?.disabledSnapAxes,
		);
		if (equalSnaps.length) {
			const center = target.getCenterPoint();
			const horizontal = equalSnaps.find(snap => snap.axis === 'horizontal');
			const vertical = equalSnaps.find(snap => snap.axis === 'vertical');
			target.setPositionByOrigin(
				new fabric.Point(
					center.x + (horizontal?.correction ?? 0),
					center.y + (vertical?.correction ?? 0),
				),
				'center',
				'center',
			);
			targetBounds = this.getBounds(target, true);
		}
		const snappedAxes = new Set(equalSnaps.map(snap => snap.axis));
		const equalGuides = equalSnaps.flatMap(snap =>
			snap.guides.map(guide => ({
				...guide,
				cross: guide.axis === 'horizontal' ? targetBounds.centerY : targetBounds.centerX,
			})),
		);

		if (event?.altKey) {
			const candidates = referenceBounds.flatMap(bounds =>
				this.getCandidates(targetBounds, bounds, true),
			);
			this.guides = [
				...equalGuides,
				...candidates
					.filter(candidate => !snappedAxes.has(candidate.guide.axis))
					.map(candidate => candidate.guide),
			];
			return;
		}

		const threshold = this.getOption('threshold', 80) / this.getZoom();
		const measurementBounds = selectionObjects
			? [...selectionObjects].map(object => this.getBounds(object as FabricObject, true))
			: [targetBounds];
		const distanceGuides = measurementBounds.flatMap(bounds => {
			const nearest = new Map<CandidateDirection, SpacingCandidate>();
			referenceBounds
				.flatMap(reference => this.getCandidates(bounds, reference, false))
				.forEach(candidate => {
					if (candidate.guide.distance > threshold) {
						return;
					}
					const current = nearest.get(candidate.direction);
					if (!current || candidate.guide.distance < current.guide.distance) {
						nearest.set(candidate.direction, candidate);
					}
				});
			return (['left', 'right', 'top', 'bottom'] as CandidateDirection[])
				.map(direction => nearest.get(direction)?.guide)
				.filter(
					(guide): guide is SpacingGuide =>
						Boolean(guide) && !snappedAxes.has(guide?.axis as SpacingAxis),
				);
		});
		this.guides = [
			...equalGuides,
			...this.deduplicateGuides(distanceGuides),
		];
	};

	private getOption = <K extends 'snapMargin' | 'threshold'>(key: K, fallback: number) =>
		(this.handler.guidelineOption.spacing?.[key] as number | undefined) ?? fallback;

	private isEnabled = () =>
		Boolean(this.handler.guidelineOption.enabled) &&
		this.handler.guidelineOption.spacing?.enabled !== false;

	private getZoom = () => this.handler.canvas.getZoom() || 1;

	private isEligibleObject = (
		object: FabricObject,
		target: FabricObject,
		selectionObjects?: Set<fabric.FabricObject>,
	) =>
		object !== target &&
		!selectionObjects?.has(object) &&
		object.id !== 'workarea' &&
		object.superType !== 'port' &&
		object.superType !== 'link' &&
		object.evented &&
		object.visible;

	private getBounds = (object: FabricObject, force = false): ObjectBounds => {
		const transformKey = [...object.transformMatrixKey(), Number(object.strokeUniform)];
		const previousKey = this.transformKeys.get(object);
		if (
			force ||
			!previousKey ||
			previousKey.length !== transformKey.length ||
			transformKey.some((value, index) => value !== previousKey[index])
		) {
			object.setCoords();
			this.transformKeys.set(object, transformKey);
		}
		const rect = object.getBoundingRect();
		return {
			bottom: rect.top + rect.height,
			centerX: rect.left + rect.width / 2,
			centerY: rect.top + rect.height / 2,
			height: rect.height,
			left: rect.left,
			right: rect.left + rect.width,
			top: rect.top,
			width: rect.width,
		};
	};

	private getCandidates = (target: ObjectBounds, reference: ObjectBounds, expanded: boolean) => {
		const candidates: SpacingCandidate[] = [];
		const verticalOverlap = Math.min(target.bottom, reference.bottom) - Math.max(target.top, reference.top);
		const horizontalOverlap = Math.min(target.right, reference.right) - Math.max(target.left, reference.left);
		const horizontalCross =
			verticalOverlap >= 0
				? (Math.max(target.top, reference.top) + Math.min(target.bottom, reference.bottom)) / 2
				: (target.centerY + reference.centerY) / 2;
		const verticalCross =
			horizontalOverlap >= 0
				? (Math.max(target.left, reference.left) + Math.min(target.right, reference.right)) / 2
				: (target.centerX + reference.centerX) / 2;

		if (reference.right <= target.left && (expanded || verticalOverlap >= 0)) {
			candidates.push(
				this.createCandidate('left', 'horizontal', reference.right, target.left, horizontalCross),
			);
		}
		if (reference.left >= target.right && (expanded || verticalOverlap >= 0)) {
			candidates.push(
				this.createCandidate('right', 'horizontal', target.right, reference.left, horizontalCross),
			);
		}
		if (reference.bottom <= target.top && (expanded || horizontalOverlap >= 0)) {
			candidates.push(
				this.createCandidate('top', 'vertical', reference.bottom, target.top, verticalCross),
			);
		}
		if (reference.top >= target.bottom && (expanded || horizontalOverlap >= 0)) {
			candidates.push(
				this.createCandidate('bottom', 'vertical', target.bottom, reference.top, verticalCross),
			);
		}

		if (expanded && candidates.length > 1) {
			return [
				candidates.reduce((nearest, candidate) =>
					candidate.guide.distance < nearest.guide.distance ? candidate : nearest,
				),
			];
		}
		return candidates;
	};

	private createCandidate = (
		direction: CandidateDirection,
		axis: SpacingAxis,
		start: number,
		end: number,
		cross: number,
	): SpacingCandidate => ({
		direction,
		guide: {
			axis,
			cross,
			distance: Math.max(0, end - start),
			end,
			kind: 'distance',
			start,
		},
	});

	private deduplicateGuides = (guides: SpacingGuide[]) => {
		const seen = new Set<string>();
		return guides.filter(guide => {
			const key = [guide.axis, guide.kind, guide.start, guide.end, guide.cross]
				.map(value => (typeof value === 'number' ? value.toFixed(6) : value))
				.join(':');
			if (seen.has(key)) {
				return false;
			}
			seen.add(key);
			return true;
		});
	};

	private getEqualSpacingSnaps = (
		target: ObjectBounds,
		references: ObjectBounds[],
		disabledSnapAxes: SpacingAxis[] = [],
	) => {
		if (this.handler.guidelineOption.spacing?.snap === false) {
			return [];
		}
		const disabledAxes = new Set(disabledSnapAxes);
		return (['horizontal', 'vertical'] as SpacingAxis[])
			.filter(axis => !disabledAxes.has(axis))
			.map(axis => this.findEqualSpacingSnap(axis, target, references))
			.filter((snap): snap is EqualSpacingSnap => Boolean(snap));
	};

	private findEqualSpacingSnap = (
		axis: SpacingAxis,
		target: ObjectBounds,
		references: ObjectBounds[],
	): EqualSpacingSnap | undefined => {
		const horizontal = axis === 'horizontal';
		const targetStart = horizontal ? target.left : target.top;
		const targetEnd = horizontal ? target.right : target.bottom;
		const targetLength = horizontal ? target.width : target.height;
		const crossStart = horizontal ? target.top : target.left;
		const crossEnd = horizontal ? target.bottom : target.right;
		const cross = horizontal ? target.centerY : target.centerX;
		const comparable = references
			.filter(reference => {
				const referenceCrossStart = horizontal ? reference.top : reference.left;
				const referenceCrossEnd = horizontal ? reference.bottom : reference.right;
				return Math.min(crossEnd, referenceCrossEnd) - Math.max(crossStart, referenceCrossStart) >= 0;
			})
			.sort(
				(first, second) =>
					(horizontal ? first.left : first.top) - (horizontal ? second.left : second.top),
			);
		const snapMargin = this.getOption('snapMargin', 4) / this.getZoom();
		let best: EqualSpacingSnap | undefined;

		for (let index = 0; index < comparable.length - 1; index += 1) {
			const first = comparable[index];
			const second = comparable[index + 1];
			const firstStart = horizontal ? first.left : first.top;
			const firstEnd = horizontal ? first.right : first.bottom;
			const secondStart = horizontal ? second.left : second.top;
			const secondEnd = horizontal ? second.right : second.bottom;
			const fixedGap = secondStart - firstEnd;
			if (fixedGap < 0) {
				continue;
			}

			let desiredStart: number | undefined;
			let guides: SpacingGuide[] = [];
			if (targetStart >= secondEnd) {
				desiredStart = secondEnd + fixedGap;
				guides = [
					this.createEqualGuide(axis, firstEnd, secondStart, cross),
					this.createEqualGuide(axis, secondEnd, desiredStart, cross),
				];
			} else if (targetEnd <= firstStart) {
				desiredStart = firstStart - fixedGap - targetLength;
				guides = [
					this.createEqualGuide(axis, desiredStart + targetLength, firstStart, cross),
					this.createEqualGuide(axis, firstEnd, secondStart, cross),
				];
			} else if (targetStart >= firstEnd && targetEnd <= secondStart) {
				const availableGap = secondStart - firstEnd - targetLength;
				if (availableGap < 0) {
					continue;
				}
				const equalGap = availableGap / 2;
				desiredStart = firstEnd + equalGap;
				guides = [
					this.createEqualGuide(axis, firstEnd, desiredStart, cross),
					this.createEqualGuide(axis, desiredStart + targetLength, secondStart, cross),
				];
			}

			if (typeof desiredStart === 'undefined') {
				continue;
			}
			const correction = desiredStart - targetStart;
			if (Math.abs(correction) > snapMargin) {
				continue;
			}
			if (!best || Math.abs(correction) < Math.abs(best.correction)) {
				best = {
					axis,
					correction,
					guides,
				};
			}
		}
		return best;
	};

	private createEqualGuide = (
		axis: SpacingAxis,
		start: number,
		end: number,
		cross: number,
	): SpacingGuide => ({
		axis,
		cross,
		distance: Math.max(0, end - start),
		end,
		kind: 'equal',
		start,
	});

	public drawGuide = (guide: SpacingGuide) => {
		const { viewportTransform } = this.handler.canvas;
		const zoom = this.getZoom();
		const color = this.handler.guidelineOption.spacing?.color ?? '#0f9f8f';
		const labelBackgroundColor =
			this.handler.guidelineOption.spacing?.labelBackgroundColor ?? '#0f172a';
		const labelTextColor = this.handler.guidelineOption.spacing?.labelTextColor ?? '#ffffff';
		const capSize = 4 / zoom;
		const label = `${Math.round(guide.distance)} px`;
		const labelX = guide.axis === 'horizontal' ? (guide.start + guide.end) / 2 : guide.cross;
		const labelY = guide.axis === 'vertical' ? (guide.start + guide.end) / 2 : guide.cross;
		const paddingX = 5 / zoom;
		const labelHeight = 18 / zoom;

		this.ctx.save();
		this.ctx.transform(...viewportTransform);
		this.ctx.lineWidth = 1 / zoom;
		this.ctx.strokeStyle = color;
		this.ctx.beginPath();
		if (guide.axis === 'horizontal') {
			this.ctx.moveTo(guide.start, guide.cross);
			this.ctx.lineTo(guide.end, guide.cross);
			this.ctx.moveTo(guide.start, guide.cross - capSize);
			this.ctx.lineTo(guide.start, guide.cross + capSize);
			this.ctx.moveTo(guide.end, guide.cross - capSize);
			this.ctx.lineTo(guide.end, guide.cross + capSize);
		} else {
			this.ctx.moveTo(guide.cross, guide.start);
			this.ctx.lineTo(guide.cross, guide.end);
			this.ctx.moveTo(guide.cross - capSize, guide.start);
			this.ctx.lineTo(guide.cross + capSize, guide.start);
			this.ctx.moveTo(guide.cross - capSize, guide.end);
			this.ctx.lineTo(guide.cross + capSize, guide.end);
		}
		this.ctx.stroke();

		this.ctx.font = `${12 / zoom}px sans-serif`;
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		const labelWidth = this.ctx.measureText(label).width + paddingX * 2;
		this.ctx.fillStyle = labelBackgroundColor;
		this.ctx.beginPath();
		if (typeof this.ctx.roundRect === 'function') {
			this.ctx.roundRect(
				labelX - labelWidth / 2,
				labelY - labelHeight / 2,
				labelWidth,
				labelHeight,
				3 / zoom,
			);
			this.ctx.fill();
		} else {
			this.ctx.fillRect(
				labelX - labelWidth / 2,
				labelY - labelHeight / 2,
				labelWidth,
				labelHeight,
			);
		}
		this.ctx.fillStyle = labelTextColor;
		this.ctx.fillText(label, labelX, labelY);
		this.ctx.restore();
	};
}

export default SpacingGuidelineHandler;
