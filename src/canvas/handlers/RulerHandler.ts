import { defaults } from '../constants';
import type { RulerOption } from '../models';
import type Handler from './Handler';

const DEFAULT_MINIMUM_SPACING = 50;
const MINOR_DIVISIONS = 5;

export const getRulerStep = (zoom: number, minimumSpacing = DEFAULT_MINIMUM_SPACING) => {
	const safeZoom = zoom > 0 ? zoom : 1;
	const rawStep = minimumSpacing / safeZoom;
	const magnitude = 10 ** Math.floor(Math.log10(rawStep));
	const normalizedStep = rawStep / magnitude;

	if (normalizedStep <= 1) {
		return magnitude;
	}
	if (normalizedStep <= 2) {
		return 2 * magnitude;
	}
	if (normalizedStep <= 5) {
		return 5 * magnitude;
	}
	return 10 * magnitude;
};

export const rulerValueToScreenPosition = (
	value: number,
	origin: number,
	zoom: number,
	viewportOffset: number,
) => (origin + value) * zoom + viewportOffset;

const formatRulerValue = (value: number) => {
	const roundedValue = Math.round(value * 100) / 100;
	return Object.is(roundedValue, -0) ? '0' : String(roundedValue);
};

class RulerHandler {
	private handler: Handler;
	private option: RulerOption = defaults.rulerOption;
	private horizontalCanvas?: HTMLCanvasElement;
	private verticalCanvas?: HTMLCanvasElement;
	private corner?: HTMLDivElement;
	private subscribed = false;
	private viewportInsetApplied = false;
	private wrapperStyle?: {
		left: string;
		position: string;
		top: string;
	};

	constructor(handler: Handler) {
		this.handler = handler;
		this.setOptions(handler.rulerOption);
	}

	public setOptions = (option: RulerOption = {}) => {
		this.option = Object.assign({}, defaults.rulerOption, option);
		if (this.option.enabled) {
			this.mount();
		} else {
			this.unmount();
		}
		this.layoutViewport();
	};

	public getViewportInset = () => {
		if (!this.option.enabled) {
			return 0;
		}
		return Math.max(this.option.size || defaults.rulerOption.size || 0, 0);
	};

	public layoutViewport = () => {
		const wrapper = this.handler.canvas.wrapperEl;
		if (!wrapper) {
			return;
		}
		const inset = this.getViewportInset();
		if (!inset && !this.viewportInsetApplied) {
			return;
		}
		if (!this.wrapperStyle) {
			this.wrapperStyle = {
				left: wrapper.style.left,
				position: wrapper.style.position,
				top: wrapper.style.top,
			};
		}

		if (inset) {
			wrapper.style.position = 'absolute';
			wrapper.style.left = `${inset}px`;
			wrapper.style.top = `${inset}px`;
			this.viewportInsetApplied = true;
		} else {
			wrapper.style.position = this.wrapperStyle.position;
			wrapper.style.left = this.wrapperStyle.left;
			wrapper.style.top = this.wrapperStyle.top;
			this.viewportInsetApplied = false;
		}

		this.handler.eventHandler?.resize(
			this.handler.container.clientWidth,
			this.handler.container.clientHeight,
		);
	};

	private mount = () => {
		if (!this.horizontalCanvas || !this.verticalCanvas || !this.corner) {
			this.horizontalCanvas = document.createElement('canvas');
			this.horizontalCanvas.className = 'rde-ruler rde-ruler-horizontal';
			this.verticalCanvas = document.createElement('canvas');
			this.verticalCanvas.className = 'rde-ruler rde-ruler-vertical';
			this.corner = document.createElement('div');
			this.corner.className = 'rde-ruler-corner';

			this.handler.container.appendChild(this.horizontalCanvas);
			this.handler.container.appendChild(this.verticalCanvas);
			this.handler.container.appendChild(this.corner);
		}

		if (!this.subscribed) {
			this.handler.canvas.on('after:render', this.render);
			this.subscribed = true;
		}
		this.render();
	};

	private unmount = () => {
		if (this.subscribed) {
			this.handler.canvas.off('after:render', this.render);
			this.subscribed = false;
		}
		this.horizontalCanvas?.remove();
		this.verticalCanvas?.remove();
		this.corner?.remove();
		this.horizontalCanvas = undefined;
		this.verticalCanvas = undefined;
		this.corner = undefined;
	};

	private prepareCanvas = (
		canvas: HTMLCanvasElement,
		width: number,
		height: number,
		devicePixelRatio: number,
	) => {
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		const pixelWidth = Math.round(width * devicePixelRatio);
		const pixelHeight = Math.round(height * devicePixelRatio);
		if (canvas.width !== pixelWidth) {
			canvas.width = pixelWidth;
		}
		if (canvas.height !== pixelHeight) {
			canvas.height = pixelHeight;
		}
		const context = canvas.getContext('2d');
		context?.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
		return context;
	};

	private drawHorizontal = (
		context: CanvasRenderingContext2D,
		width: number,
		height: number,
		origin: number,
		zoom: number,
		viewportOffset: number,
	) => {
		const { backgroundColor, lineColor, textColor } = this.option;
		const majorStep = getRulerStep(zoom);
		const minorStep = majorStep / MINOR_DIVISIONS;
		const minorStepPixels = minorStep * zoom;
		const screenOrigin = rulerValueToScreenPosition(0, origin, zoom, viewportOffset);
		const startIndex = Math.floor(-screenOrigin / minorStepPixels);
		const endIndex = Math.ceil((width - screenOrigin) / minorStepPixels);

		context.clearRect(0, 0, width, height);
		context.fillStyle = backgroundColor;
		context.fillRect(0, 0, width, height);
		context.strokeStyle = lineColor;
		context.fillStyle = textColor;
		context.lineWidth = 1;
		context.font = '10px sans-serif';
		context.textBaseline = 'top';

		for (let index = startIndex; index <= endIndex; index += 1) {
			const isMajor = index % MINOR_DIVISIONS === 0;
			const position = screenOrigin + index * minorStepPixels;
			const crispPosition = Math.round(position) + 0.5;
			const tickHeight = isMajor ? height * 0.55 : height * 0.3;
			context.beginPath();
			context.moveTo(crispPosition, height);
			context.lineTo(crispPosition, height - tickHeight);
			context.stroke();
			if (isMajor) {
				context.fillText(formatRulerValue(index * minorStep), position + 3, 3);
			}
		}
	};

	private drawVertical = (
		context: CanvasRenderingContext2D,
		width: number,
		height: number,
		origin: number,
		zoom: number,
		viewportOffset: number,
	) => {
		const { backgroundColor, lineColor, textColor } = this.option;
		const majorStep = getRulerStep(zoom);
		const minorStep = majorStep / MINOR_DIVISIONS;
		const minorStepPixels = minorStep * zoom;
		const screenOrigin = rulerValueToScreenPosition(0, origin, zoom, viewportOffset);
		const startIndex = Math.floor(-screenOrigin / minorStepPixels);
		const endIndex = Math.ceil((height - screenOrigin) / minorStepPixels);

		context.clearRect(0, 0, width, height);
		context.fillStyle = backgroundColor;
		context.fillRect(0, 0, width, height);
		context.strokeStyle = lineColor;
		context.fillStyle = textColor;
		context.lineWidth = 1;
		context.font = '10px sans-serif';
		context.textBaseline = 'top';

		for (let index = startIndex; index <= endIndex; index += 1) {
			const isMajor = index % MINOR_DIVISIONS === 0;
			const position = screenOrigin + index * minorStepPixels;
			const crispPosition = Math.round(position) + 0.5;
			const tickWidth = isMajor ? width * 0.55 : width * 0.3;
			context.beginPath();
			context.moveTo(width, crispPosition);
			context.lineTo(width - tickWidth, crispPosition);
			context.stroke();
			if (isMajor) {
				context.save();
				context.translate(3, position - 3);
				context.rotate(-Math.PI / 2);
				context.fillText(formatRulerValue(index * minorStep), 0, 0);
				context.restore();
			}
		}
	};

	public render = () => {
		if (!this.option.enabled || !this.horizontalCanvas || !this.verticalCanvas || !this.corner) {
			return;
		}

		const size = this.option.size || defaults.rulerOption.size || 24;
		const width = Math.max(this.handler.container.clientWidth - size, 0);
		const height = Math.max(this.handler.container.clientHeight - size, 0);
		const devicePixelRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
		const horizontalContext = this.prepareCanvas(this.horizontalCanvas, width, size, devicePixelRatio);
		const verticalContext = this.prepareCanvas(this.verticalCanvas, size, height, devicePixelRatio);

		if (!horizontalContext || !verticalContext) {
			this.horizontalCanvas.style.display = 'none';
			this.verticalCanvas.style.display = 'none';
			this.corner.style.display = 'none';
			return;
		}

		this.horizontalCanvas.style.display = '';
		this.verticalCanvas.style.display = '';
		this.corner.style.display = '';
		this.corner.style.width = `${size}px`;
		this.corner.style.height = `${size}px`;
		this.corner.style.backgroundColor = this.option.backgroundColor;
		this.corner.style.borderColor = this.option.lineColor;
		this.corner.style.color = this.option.textColor;
		this.corner.textContent = this.option.unit;

		const zoom = this.handler.canvas.getZoom() || 1;
		const viewportTransform = this.handler.canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
		const workareaOrigin = this.handler.workarea?.getPointByOrigin?.('left', 'top') || {
			x: this.handler.workarea?.left || 0,
			y: this.handler.workarea?.top || 0,
		};

		this.drawHorizontal(horizontalContext, width, size, workareaOrigin.x, zoom, viewportTransform[4]);
		this.drawVertical(verticalContext, size, height, workareaOrigin.y, zoom, viewportTransform[5]);
	};

	public destroy = () => {
		this.option = Object.assign({}, this.option, { enabled: false });
		this.unmount();
		this.layoutViewport();
	};
}

export default RulerHandler;
