import type {
	Canvas,
	CanvasOptions,
	FabricImage as NativeFabricImage,
	FabricObject as NativeFabricObject,
	Group,
	Pattern,
	Point,
	Rect,
	TFabricObjectProps,
	TPointerEventInfo,
} from 'fabric';
import { IFilter } from '../handlers';

export type AnimationType = 'fade' | 'bounce' | 'shake' | 'scaling' | 'rotation' | 'flash' | 'custom' | 'none';

export interface AnimationProperty {
	delay?: number;
	duration?: number;
	autoplay?: boolean;
	loop?: boolean | number;
	type: AnimationType;
	offset?: number;
	opacity?: number;
	bounce?: 'vertical' | 'horizontal';
	shake?: 'vertical' | 'horizontal';
	scale?: number;
	angle?: number;
	fill?: string | Pattern;
	stroke?: string;
}

export interface LinkProperty {
	enabled?: boolean;
	type?: string;
	state?: string;
	[key: string]: any;
}

export interface TooltipProperty {
	enabled?: boolean;
	type?: string;
	template?: string;
}

export interface TriggerProperty {
	enabled?: boolean;
	type?: string;
	script?: string;
	effect?: string;
}

export interface FabricCanvasOption {
	wrapperEl?: HTMLElement;
}

export type FabricCanvas<T extends Canvas = Canvas> = T & FabricCanvasOption;

export type FabricObjectOption<T extends object = Partial<TFabricObjectProps>> = T & {
	/**
	 * Object id
	 * @type {string}
	 */
	id?: string;
	/**
	 * Parent object id
	 * @type {string}
	 */
	parentId?: string;
	/**
	 * Original opacity
	 * @type {number}
	 */
	originOpacity?: number;
	/**
	 * Original top position
	 * @type {number}
	 */
	originTop?: number;
	/**
	 * Original left position
	 * @type {number}
	 */
	originLeft?: number;
	/**
	 * Original scale X
	 * @type {number}
	 */
	originScaleX?: number;
	/**
	 * Original scale Y
	 * @type {number}
	 */
	originScaleY?: number;
	/**
	 * Original angle
	 * @type {number}
	 */
	originAngle?: number;
	/**
	 * Original fill color
	 *
	 * @type {(string | Pattern | Gradient)}
	 */
	originFill?: string | Pattern | Record<string, any>;
	/**
	 * Original stroke color
	 * @type {string}
	 */
	originStroke?: string;
	/**
	 * Original rotation
	 *
	 * @type {number}
	 */
	originRotation?: number;
	/**
	 * Object editable
	 * @type {boolean}
	 */
	editable?: boolean;
	/**
	 * Object Super type
	 * @type {string}
	 */
	superType?: string;
	/**
	 * @description
	 * @type {string}
	 */
	description?: string;
	/**
	 * Animation property
	 * @type {AnimationProperty}
	 */
	animation?: AnimationProperty;
	/**
	 * Anime instance
	 * @type {anime.AnimeInstance}
	 */
	anime?: anime.AnimeInstance;
	/**
	 * Tooltip property
	 * @type {TooltipProperty}
	 */
	tooltip?: TooltipProperty;
	/**
	 * Link property
	 * @type {LinkProperty}
	 */
	link?: LinkProperty;
	/**
	 * Is running animation
	 * @type {boolean}
	 */
	animating?: boolean;
	/**
	 * Object class
	 * @type {string}
	 */
	class?: string;
	/**
	 * Is possible delete
	 * @type {boolean}
	 */
	deletable?: boolean;
	/**
	 * Is enable double click
	 * @type {boolean}
	 */
	dblclick?: boolean;
	/**
	 * Is possible clone
	 * @type {boolean}
	 */
	cloneable?: boolean;
	/**
	 * Is locked object
	 * @type {boolean}
	 */
	locked?: boolean;
	/**
	 * This property replaces "angle"
	 *
	 * @type {number}
	 */
	rotation?: number;
	/**
	 * Whether it can be clicked
	 *
	 * @type {boolean}
	 */
	clickable?: boolean;
	[key: string]: any;
};

export type FabricObject<T extends NativeFabricObject = NativeFabricObject> = T & FabricObjectOption;

export type FabricGroup = FabricObject<Group> & {
	/**
	 * Object that config group
	 * @type {FabricObject[]}
	 */
	objects?: FabricObject[];
};

export type FabricImage = FabricObject &
	NativeFabricImage & {
		/**
		 * Image URL
		 * @type {string}
		 */
		src?: string;
		/**
		 * Image File or Blob
		 * @type {File}
		 */
		file?: File;
		/**
		 * Image Filter
		 * @type {IFilter[]}
		 */
		filters?: IFilter[];
	};

export interface FabricElement extends FabricObject<Rect> {
	/**
	 * Container element id
	 * @type {string}
	 */
	container: string;
	/**
	 * Target Element
	 * @type {HTMLDivElement}
	 */
	element: HTMLDivElement;
	/**
	 * Source of Element Object
	 */
	setSource: (source: any) => void;
}

export type WorkareaLayout = 'fixed' | 'responsive' | 'fullscreen';

export interface WorkareaOption {
	/**
	 * Image URL
	 * @type {string}
	 */
	src?: string;
	/**
	 * Image File or Blbo
	 * @type {File}
	 */
	file?: File;
	/**
	 * Workarea Width
	 * @type {number}
	 */
	width?: number;
	/**
	 * Workarea Height
	 * @type {number}
	 */
	height?: number;
	/**
	 * Workarea Background Color
	 * @type {string}
	 */
	backgroundColor?: string;
	/**
	 * Workarea Layout Type
	 * @type {WorkareaLayout}
	 */
	layout?: WorkareaLayout;
}

export type WorkareaObject = FabricImage & {
	/**
	 * Workarea Layout Type
	 * @type {WorkareaLayout}
	 */
	layout?: WorkareaLayout;
	/**
	 * Whether exist the element
	 * @type {boolean}
	 */
	isElement?: boolean;
	/**
	 * Stored width in workarea
	 * @type {number}
	 */
	workareaWidth?: number;
	/**
	 * Stored height in workarea
	 * @type {number}
	 */
	workareaHeight?: number;
};

export interface CanvasOption extends Partial<CanvasOptions> {
	/**
	 * Unique id of Canvas
	 * @type {string}
	 */
	id?: string;
}

export interface GridOption {
	type?: 'line' | 'dot';
	/**
	 * Whether should be enabled
	 * @type {boolean}
	 */
	enabled?: boolean;
	/**
	 * Grid interval
	 * @type {number}
	 */
	grid?: number;
	/**
	 * When had moved object, whether should adjust position on grid interval
	 * @type {boolean}
	 */
	snapToGrid?: boolean;
	/**
	 * Grid line color
	 *
	 * @type {string}
	 */
	lineColor?: string;
	/**
	 * Grid border color
	 *
	 * @type {string}
	 */
	borderColor?: string;
	dotColor?: string;
}

export interface GuidelineOption {
	/**
	 * When have moved object, whether should show guideline
	 * @type {boolean}
	 */
	enabled?: boolean;
}

export interface CanvasActions {
	/**
	 * Move selected objects (Arrow keys)
	 * @type {boolean}
	 */
	move?: boolean;

	/**
	 * Select all objects (Ctrl + A)
	 * @type {boolean}
	 */
	all?: boolean;

	/**
	 * Copy selected objects (Ctrl + C)
	 * @type {boolean}
	 */
	copy?: boolean;

	/**
	 * Paste copied objects (Ctrl + P)
	 * @type {boolean}
	 */
	paste?: boolean;

	/**
	 * Cancel selection or action (Escape)
	 * @type {boolean}
	 */
	esc?: boolean;

	/**
	 * Delete selected objects (Delete or Backspace)
	 * @type {boolean}
	 */
	del?: boolean;

	/**
	 * Whether to use object options on the clipboard when copying
	 * @type {boolean}
	 */
	clipboard?: boolean;

	/**
	 * Undo or redo actions (Ctrl + Z, Ctrl + Y)
	 * @type {boolean}
	 */
	transaction?: boolean;

	/**
	 * Zoom in or out (Plus, Minus)
	 * @type {boolean}
	 */
	zoom?: boolean;

	/**
	 * Cut selected objects (Ctrl + X)
	 * @type {boolean}
	 */
	cut?: boolean;

	/**
	 * Hand tool for panning the canvas (Space or Alt Key + Drag)
	 * @type {boolean}
	 */
	grab?: boolean;

	/**
	 * Scroll the canvas view (Mouse wheel)
	 * @type {boolean}
	 */
	scroll?: boolean;
}

export type InteractionMode = 'selection' | 'grab' | 'polygon' | 'line' | 'arrow' | 'link' | 'crop';

export interface FabricEvent<T extends Event = Event> extends Omit<Partial<TPointerEventInfo>, 'e'> {
	e: T;
	target?: FabricObject;
	subTargets?: FabricObject[];
	selected?: FabricObject[];
	deselected?: FabricObject[];
	button?: number;
	isClick?: boolean;
	action?: string;
	pointer?: Point;
	absolutePointer?: Point;
}

export type FabricObjects = {
	[key: string]: {
		create: (...args: any) => FabricObject;
	};
};
