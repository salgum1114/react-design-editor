import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { defaults } from '../constants';
import EventHandler from './EventHandler';
import RulerHandler, { getRulerStep, rulerValueToScreenPosition } from './RulerHandler';

const canvasSource = readFileSync(new URL('../Canvas.tsx', import.meta.url), 'utf8');
const handlerSource = readFileSync(new URL('./Handler.ts', import.meta.url), 'utf8');
const imageMapSource = readFileSync(
	new URL('../../editors/imagemap/ImageMapEditor.tsx', import.meta.url),
	'utf8',
);
const workflowSource = readFileSync(
	new URL('../../editors/workflow/WorkflowEditor.tsx', import.meta.url),
	'utf8',
);

const createContext = () =>
	({
		beginPath: vi.fn(),
		clearRect: vi.fn(),
		fillRect: vi.fn(),
		fillText: vi.fn(),
		lineTo: vi.fn(),
		moveTo: vi.fn(),
		restore: vi.fn(),
		rotate: vi.fn(),
		save: vi.fn(),
		setTransform: vi.fn(),
		stroke: vi.fn(),
		translate: vi.fn(),
	}) as unknown as CanvasRenderingContext2D;

const createRulerFixture = (enabled = true) => {
	const children: any[] = [];
	const context = createContext();
	const container = {
		clientHeight: 400,
		clientWidth: 600,
		appendChild: vi.fn((element: any) => {
			children.push(element);
			element.parentElement = container;
			return element;
		}),
	};
	const createElement = vi.fn((tagName: string) => {
		const element: any = {
			className: '',
			height: 0,
			parentElement: null,
			style: {},
			width: 0,
			remove: vi.fn(() => {
				const index = children.indexOf(element);
				if (index >= 0) {
					children.splice(index, 1);
				}
				element.parentElement = null;
			}),
		};
		if (tagName === 'canvas') {
			element.getContext = vi.fn(() => context);
			let width = 0;
			let height = 0;
			element.widthWrites = 0;
			element.heightWrites = 0;
			Object.defineProperties(element, {
				width: {
					get: () => width,
					set: (value: number) => {
						width = value;
						element.widthWrites += 1;
					},
				},
				height: {
					get: () => height,
					set: (value: number) => {
						height = value;
						element.heightWrites += 1;
					},
				},
			});
		}
		return element;
	});
	vi.stubGlobal('document', { createElement });
	vi.stubGlobal('window', { devicePixelRatio: 1 });

	const canvas = {
		getZoom: vi.fn(() => 1),
		off: vi.fn(),
		on: vi.fn(),
		viewportTransform: [1, 0, 0, 1, 0, 0],
		wrapperEl: {
			style: {
				left: '',
				position: 'relative',
				top: '',
			},
		},
	};
	const handler = {
		canvas,
		container,
		eventHandler: {
			resize: vi.fn(),
		},
		rulerOption: { ...defaults.rulerOption, enabled },
		workarea: {
			getPointByOrigin: vi.fn(() => ({ x: 100, y: 80 })),
		},
	};

	return { canvas, children, createElement, handler };
};

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('ruler coordinates', () => {
	it('uses readable major steps as zoom changes', () => {
		expect(getRulerStep(0.25)).toBe(200);
		expect(getRulerStep(1)).toBe(50);
		expect(getRulerStep(2)).toBe(50);
	});

	it('positions ruler values from the workarea origin and viewport offset', () => {
		expect(rulerValueToScreenPosition(0, 120, 2, -40)).toBe(200);
		expect(rulerValueToScreenPosition(50, 120, 2, -40)).toBe(300);
	});

	it('keeps rulers disabled for library consumers by default', () => {
		expect(defaults.rulerOption).toMatchObject({
			enabled: false,
			unit: 'px',
			size: 24,
		});
	});
});

describe('RulerHandler configuration', () => {
	it('forwards ruler option changes without recreating the Canvas', () => {
		expect(canvasSource).toContain('this.handler.setRulerOption(this.props.rulerOption)');
	});

	it('owns and destroys the ruler handler with the Canvas lifecycle', () => {
		expect(handlerSource).toContain('this.rulerHandler = new RulerHandler(this)');
		expect(handlerSource).toContain('this.rulerHandler.destroy()');
	});

	it('enables themed rulers in ImageMap without enabling them in Workflow', () => {
		expect(imageMapSource).toMatch(/rulerOption=\{\{[\s\S]*?enabled: true,[\s\S]*?backgroundColor:/);
		expect(workflowSource).not.toContain('rulerOption=');
	});
});

describe('RulerHandler lifecycle', () => {
	it('mounts overlays and subscribes while enabled', () => {
		const { canvas, children, handler } = createRulerFixture();

		const ruler = new RulerHandler(handler as any);

		expect(children.map(element => element.className)).toEqual([
			'rde-ruler rde-ruler-horizontal',
			'rde-ruler rde-ruler-vertical',
			'rde-ruler-corner',
		]);
		expect(canvas.on).toHaveBeenCalledWith('after:render', ruler.render);
	});

	it('does not resize or reposition a Canvas when the ruler starts disabled', () => {
		const { canvas, handler } = createRulerFixture(false);

		new RulerHandler(handler as any);

		expect(handler.eventHandler.resize).not.toHaveBeenCalled();
		expect(canvas.wrapperEl.style).toMatchObject({
			left: '',
			position: 'relative',
			top: '',
		});
	});

	it('reserves ruler space in the existing Fabric viewport', () => {
		const { canvas, handler } = createRulerFixture();

		new RulerHandler(handler as any);

		expect(canvas.wrapperEl.style).toMatchObject({
			left: '24px',
			position: 'absolute',
			top: '24px',
		});
		expect(handler.eventHandler.resize).toHaveBeenCalledWith(600, 400);
	});

	it('removes overlays and listeners when disabled', () => {
		const { canvas, children, handler } = createRulerFixture();
		const ruler = new RulerHandler(handler as any);

		ruler.setOptions({ ...handler.rulerOption, enabled: false });

		expect(children).toHaveLength(0);
		expect(canvas.off).toHaveBeenCalledWith('after:render', ruler.render);
		expect(canvas.wrapperEl.style).toMatchObject({
			left: '',
			position: 'relative',
			top: '',
		});
		expect(handler.eventHandler.resize).toHaveBeenLastCalledWith(600, 400);
	});

	it('cleans up overlays and listeners when destroyed', () => {
		const { canvas, children, handler } = createRulerFixture();
		const ruler = new RulerHandler(handler as any);

		ruler.destroy();

		expect(children).toHaveLength(0);
		expect(canvas.off).toHaveBeenCalledWith('after:render', ruler.render);
	});

	it('reuses backing canvas dimensions between renders', () => {
		const { children, handler } = createRulerFixture();
		const ruler = new RulerHandler(handler as any);
		const horizontalCanvas = children[0];
		const verticalCanvas = children[1];

		ruler.render();

		expect(horizontalCanvas.widthWrites).toBe(1);
		expect(horizontalCanvas.heightWrites).toBe(1);
		expect(verticalCanvas.widthWrites).toBe(1);
		expect(verticalCanvas.heightWrites).toBe(1);
	});

	it('uses the ruler line color for the corner borders', () => {
		const { children, handler } = createRulerFixture();
		handler.rulerOption.lineColor = '#123456';

		new RulerHandler(handler as any);

		expect(children[2].style.borderColor).toBe('#123456');
	});

	it('aligns the zero tick with the inset Fabric viewport origin', () => {
		const { handler } = createRulerFixture();
		const context = createContext();
		vi.mocked(document.createElement).mockImplementation((tagName: string) => {
			const element: any = {
				className: '',
				getContext: tagName === 'canvas' ? vi.fn(() => context) : undefined,
				height: 0,
				remove: vi.fn(),
				style: {},
				width: 0,
			};
			return element;
		});

		new RulerHandler(handler as any);

		expect(context.fillText).toHaveBeenCalledWith('0', 103, 3);
	});
});

describe('ruler viewport sizing', () => {
	it('subtracts the ruler inset from the Fabric canvas dimensions', () => {
		const wrapperEl = {
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			style: {},
		};
		const canvas = {
			backgroundColor: '',
			off: vi.fn(),
			on: vi.fn(),
			renderAll: vi.fn(),
			setHeight: vi.fn(),
			setWidth: vi.fn(),
			wrapperEl,
		};
		const handler = {
			canvas,
			canvasActions: { clipboard: false },
			canvasOption: { backgroundColor: '#ffffff' },
			editable: false,
			rulerHandler: {
				getViewportInset: () => 24,
			},
		};
		const eventHandler = new EventHandler(handler as any);

		eventHandler.resize(600, 400);

		expect(canvas.setWidth).toHaveBeenCalledWith(576);
		expect(canvas.setHeight).toHaveBeenCalledWith(376);
	});
});
