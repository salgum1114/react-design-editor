import { fabric } from 'fabric';
import { union } from 'lodash';
import { uuid } from 'uuidv4';
import warning from 'warning';
import {
	AlignmentHandler,
	AnimationHandler,
	ChartHandler,
	ContextmenuHandler,
	CropHandler,
	CustomHandler,
	DrawingHandler,
	ElementHandler,
	EventHandler,
	GridHandler,
	GuidelineHandler,
	ImageHandler,
	InteractionHandler,
	LinkHandler,
	NodeHandler,
	PortHandler,
	ShortcutHandler,
	TooltipHandler,
	TransactionHandler,
	WorkareaHandler,
	ZoomHandler,
} from '.';
import CanvasObject from '../CanvasObject';
import { defaults } from '../constants';
import { LinkObject } from '../objects/Link';
import { NodeObject } from '../objects/Node';
import { PortObject } from '../objects/Port';
import { SvgObject } from '../objects/Svg';
import {
	CanvasOption,
	FabricCanvas,
	FabricElement,
	FabricGroup,
	FabricImage,
	FabricObject,
	FabricObjectOption,
	FabricObjects,
	GridOption,
	GuidelineOption,
	InteractionMode,
	KeyEvent,
	WorkareaObject,
	WorkareaOption,
} from '../utils';
import { LinkOption } from './LinkHandler';
import { TransactionEvent } from './TransactionHandler';

export interface HandlerCallback {
	/**
	 * When has been added object in Canvas, Called function
	 *
	 */
	onAdd?: (object: FabricObject) => void;
	/**
	 * Return contextmenu element
	 *
	 */
	onContext?: (el: HTMLDivElement, e: React.MouseEvent, target?: FabricObject) => Promise<any> | any;
	/**
	 * Return tooltip element
	 *
	 */
	onTooltip?: (el: HTMLDivElement, target?: FabricObject) => Promise<any> | any;
	/**
	 * When zoom, Called function
	 */
	onZoom?: (zoomRatio: number) => void;
	/**
	 * When clicked object, Called function
	 *
	 */
	onClick?: (canvas: FabricCanvas, target: FabricObject) => void;
	/**
	 * When double clicked object, Called function
	 *
	 */
	onDblClick?: (canvas: FabricCanvas, target: FabricObject) => void;
	/**
	 * When modified object, Called function
	 */
	onModified?: (target: FabricObject) => void;
	/**
	 * When select object, Called function
	 *
	 */
	onSelect?: (target: FabricObject) => void;
	/**
	 * When has been removed object in Canvas, Called function
	 *
	 */
	onRemove?: (target: FabricObject) => void;
	/**
	 * When has been undo or redo, Called function
	 *
	 */
	onTransaction?: (transaction: TransactionEvent) => void;
	/**
	 * When has been changed interaction mode, Called function
	 *
	 */
	onInteraction?: (interactionMode: InteractionMode) => void;
	/**
	 * When canvas has been loaded
	 *
	 */
	onLoad?: (handler: Handler, canvas?: fabric.Canvas) => void;
}

export interface HandlerOption {
	/**
	 * Canvas id
	 * @type {string}
	 */
	id?: string;
	/**
	 * Canvas object
	 * @type {FabricCanvas}
	 */
	canvas?: FabricCanvas;
	/**
	 * Canvas parent element
	 * @type {HTMLDivElement}
	 */
	container?: HTMLDivElement;
	/**
	 * Canvas editable
	 * @type {boolean}
	 */
	editable?: boolean;
	/**
	 * Canvas interaction mode
	 * @type {InteractionMode}
	 */
	interactionMode?: InteractionMode;
	/**
	 * Persist properties for object
	 * @type {string[]}
	 */
	propertiesToInclude?: string[];
	/**
	 * Minimum zoom ratio
	 * @type {number}
	 */
	minZoom?: number;
	/**
	 * Maximum zoom ratio
	 * @type {number}
	 */
	maxZoom?: number;
	/**
	 * Zoom ratio step
	 * @type {number}
	 */
	zoomStep?: number;
	/**
	 * Workarea option
	 * @type {WorkareaOption}
	 */
	workareaOption?: WorkareaOption;
	/**
	 * Canvas option
	 * @type {CanvasOption}
	 */
	canvasOption?: CanvasOption;
	/**
	 * Grid option
	 * @type {GridOption}
	 */
	gridOption?: GridOption;
	/**
	 * Default option for Fabric Object
	 * @type {FabricObjectOption}
	 */
	objectOption?: FabricObjectOption;
	/**
	 * Guideline option
	 * @type {GuidelineOption}
	 */
	guidelineOption?: GuidelineOption;
	/**
	 * Whether to use zoom
	 * @type {boolean}
	 */
	zoomEnabled?: boolean;
	/**
	 * ActiveSelection option
	 * @type {Partial<FabricObjectOption<fabric.ActiveSelection>>}
	 */
	activeSelectionOption?: Partial<FabricObjectOption<fabric.ActiveSelection>>;
	/**
	 * Canvas width
	 * @type {number}
	 */
	width?: number;
	/**
	 * Canvas height
	 * @type {number}
	 */
	height?: number;
	/**
	 * Keyboard event in Canvas
	 * @type {KeyEvent}
	 */
	keyEvent?: KeyEvent;
	/**
	 * Append custom objects
	 * @type {{ [key: string]: any }}
	 */
	fabricObjects?: FabricObjects;
	handlers?: { [key: string]: CustomHandler };
	[key: string]: any;
}

export type HandlerOptions = HandlerOption & HandlerCallback;

/**
 * Main handler for Canvas
 * @class Handler
 * @implements {HandlerOptions}
 */
class Handler implements HandlerOptions {
	public id: string;
	public canvas: FabricCanvas;
	public workarea: WorkareaObject;
	public container: HTMLDivElement;
	public editable: boolean;
	public interactionMode: InteractionMode;
	public minZoom: number;
	public maxZoom: number;
	public zoomStep: number = 0.05;
	public propertiesToInclude?: string[] = defaults.propertiesToInclude;
	public workareaOption?: WorkareaOption = defaults.workareaOption;
	public canvasOption?: CanvasOption = defaults.canvasOption;
	public gridOption?: GridOption = defaults.gridOption;
	public objectOption?: FabricObjectOption = defaults.objectOption;
	public guidelineOption?: GuidelineOption = defaults.guidelineOption;
	public keyEvent?: KeyEvent = defaults.keyEvent;
	public activeSelectionOption?: Partial<FabricObjectOption<fabric.ActiveSelection>> = defaults.activeSelectionOption;
	public fabricObjects?: FabricObjects = CanvasObject;
	public zoomEnabled?: boolean;
	public width?: number;
	public height?: number;

	public onAdd?: (object: FabricObject) => void;
	public onContext?: (el: HTMLDivElement, e: React.MouseEvent, target?: FabricObject) => Promise<any>;
	public onTooltip?: (el: HTMLDivElement, target?: FabricObject) => Promise<any>;
	public onZoom?: (zoomRatio: number) => void;
	public onClick?: (canvas: FabricCanvas, target: FabricObject) => void;
	public onDblClick?: (canvas: FabricCanvas, target: FabricObject) => void;
	public onModified?: (target: FabricObject) => void;
	public onSelect?: (target: FabricObject) => void;
	public onRemove?: (target: FabricObject) => void;
	public onTransaction?: (transaction: TransactionEvent) => void;
	public onInteraction?: (interactionMode: InteractionMode) => void;
	public onLoad?: (handler: Handler, canvas?: fabric.Canvas) => void;

	public imageHandler: ImageHandler;
	public chartHandler: ChartHandler;
	public elementHandler: ElementHandler;
	public cropHandler: CropHandler;
	public animationHandler: AnimationHandler;
	public contextmenuHandler: ContextmenuHandler;
	public tooltipHandler: TooltipHandler;
	public zoomHandler: ZoomHandler;
	public workareaHandler: WorkareaHandler;
	public interactionHandler: InteractionHandler;
	public transactionHandler: TransactionHandler;
	public gridHandler: GridHandler;
	public portHandler: PortHandler;
	public linkHandler: LinkHandler;
	public nodeHandler: NodeHandler;
	public alignmentHandler: AlignmentHandler;
	public guidelineHandler: GuidelineHandler;
	public eventHandler: EventHandler;
	public drawingHandler: DrawingHandler;
	public shortcutHandler: ShortcutHandler;
	public handlers: { [key: string]: CustomHandler } = {};

	public objectMap: Record<string, FabricObject> = {};
	public objects: FabricObject[];
	public activeLine?: any;
	public activeShape?: any;
	public zoom = 1;
	public prevTarget?: FabricObject;
	public target?: FabricObject;
	public pointArray?: any[];
	public lineArray?: any[];
	public isCut = false;

	private isRequsetAnimFrame = false;
	private requestFrame: any;
	/**
	 * Copied object
	 *
	 * @private
	 * @type {*}
	 */
	private clipboard: any;

	constructor(options: HandlerOptions) {
		this.initialize(options);
	}

	/**
	 * Initialize handler
	 *
	 * @author salgum1114
	 * @param {HandlerOptions} options
	 */
	public initialize(options: HandlerOptions) {
		this.initOption(options);
		this.initCallback(options);
		this.initHandler();
	}

	/**
	 * Init class fields
	 * @param {HandlerOptions} options
	 */
	public initOption = (options: HandlerOptions) => {
		this.id = options.id;
		this.canvas = options.canvas;
		this.container = options.container;
		this.editable = options.editable;
		this.interactionMode = options.interactionMode;
		this.minZoom = options.minZoom;
		this.maxZoom = options.maxZoom;
		this.zoomStep = options.zoomStep || 0.05;
		this.zoomEnabled = options.zoomEnabled;
		this.width = options.width;
		this.height = options.height;
		this.objects = [];
		this.setPropertiesToInclude(options.propertiesToInclude);
		this.setWorkareaOption(options.workareaOption);
		this.setCanvasOption(options.canvasOption);
		this.setGridOption(options.gridOption);
		this.setObjectOption(options.objectOption);
		this.setFabricObjects(options.fabricObjects);
		this.setGuidelineOption(options.guidelineOption);
		this.setActiveSelectionOption(options.activeSelectionOption);
		this.setKeyEvent(options.keyEvent);
	};

	/**
	 * Initialize callback
	 * @param {HandlerOptions} options
	 */
	public initCallback = (options: HandlerOptions) => {
		this.onAdd = options.onAdd;
		this.onTooltip = options.onTooltip;
		this.onZoom = options.onZoom;
		this.onContext = options.onContext;
		this.onClick = options.onClick;
		this.onModified = options.onModified;
		this.onDblClick = options.onDblClick;
		this.onSelect = options.onSelect;
		this.onRemove = options.onRemove;
		this.onTransaction = options.onTransaction;
		this.onInteraction = options.onInteraction;
		this.onLoad = options.onLoad;
	};

	/**
	 * Initialize handlers
	 *
	 */
	public initHandler = () => {
		this.workareaHandler = new WorkareaHandler(this);
		this.imageHandler = new ImageHandler(this);
		this.chartHandler = new ChartHandler(this);
		this.elementHandler = new ElementHandler(this);
		this.cropHandler = new CropHandler(this);
		this.animationHandler = new AnimationHandler(this);
		this.contextmenuHandler = new ContextmenuHandler(this);
		this.tooltipHandler = new TooltipHandler(this);
		this.zoomHandler = new ZoomHandler(this, this.zoomStep);
		this.interactionHandler = new InteractionHandler(this);
		this.transactionHandler = new TransactionHandler(this);
		this.gridHandler = new GridHandler(this);
		this.portHandler = new PortHandler(this);
		this.linkHandler = new LinkHandler(this);
		this.nodeHandler = new NodeHandler(this);
		this.alignmentHandler = new AlignmentHandler(this);
		this.guidelineHandler = new GuidelineHandler(this);
		this.eventHandler = new EventHandler(this);
		this.drawingHandler = new DrawingHandler(this);
		this.shortcutHandler = new ShortcutHandler(this);
	};

	/**
	 * Get primary object
	 * @returns {FabricObject[]}
	 */
	public getObjects = (): FabricObject[] => {
		const objects = this.canvas.getObjects().filter((obj: FabricObject) => {
			if (obj.id === 'workarea') {
				return false;
			} else if (obj.id === 'grid') {
				return false;
			} else if (obj.superType === 'port') {
				return false;
			} else if (!obj.id) {
				return false;
			}
			return true;
		}) as FabricObject[];
		if (objects.length) {
			objects.forEach(obj => (this.objectMap[obj.id] = obj));
		} else {
			this.objectMap = {};
		}
		return objects;
	};

	/**
	 * Set key pair
	 * @param {keyof FabricObject} key
	 * @param {*} value
	 * @returns
	 */
	public set = (key: keyof FabricObject, value: any) => {
		const activeObject = this.canvas.getActiveObject() as FabricObject;
		if (!activeObject) {
			return;
		}
		if (activeObject.type === 'svg' && (key === 'fill' || key === 'stroke')) {
			(activeObject as FabricGroup)._objects.forEach(obj => obj.set(key, value));
		}
		activeObject.set(key, value);
		activeObject.setCoords();
		this.canvas.requestRenderAll();
		const { id, superType, type, player, width, height } = activeObject as any;
		if (superType === 'element') {
			if (key === 'visible') {
				if (value) {
					activeObject.element.style.display = 'block';
				} else {
					activeObject.element.style.display = 'none';
				}
			}
			const el = this.elementHandler.findById(id);
			// update the element
			this.elementHandler.setScaleOrAngle(el, activeObject);
			this.elementHandler.setSize(el, activeObject);
			this.elementHandler.setPosition(el, activeObject);
			if (type === 'video' && player) {
				player.setPlayerSize(width, height);
			}
		}
		const { onModified } = this;
		if (onModified) {
			onModified(activeObject);
		}
	};

	/**
	 * Set option
	 * @param {Partial<FabricObject>} option
	 * @returns
	 */
	public setObject = (option: Partial<FabricObject>) => {
		const activeObject = this.canvas.getActiveObject() as any;
		if (!activeObject) {
			return;
		}
		Object.keys(option).forEach(key => {
			if (option[key] !== activeObject[key]) {
				activeObject.set(key, option[key]);
				activeObject.setCoords();
			}
		});
		this.canvas.requestRenderAll();
		const { id, superType, type, player, width, height } = activeObject;
		if (superType === 'element') {
			if ('visible' in option) {
				if (option.visible) {
					activeObject.element.style.display = 'block';
				} else {
					activeObject.element.style.display = 'none';
				}
			}
			const el = this.elementHandler.findById(id);
			// update the element
			this.elementHandler.setScaleOrAngle(el, activeObject);
			this.elementHandler.setSize(el, activeObject);
			this.elementHandler.setPosition(el, activeObject);
			if (type === 'video' && player) {
				player.setPlayerSize(width, height);
			}
		}
		const { onModified } = this;
		if (onModified) {
			onModified(activeObject);
		}
	};

	/**
	 * Set key pair by object
	 * @param {FabricObject} obj
	 * @param {string} key
	 * @param {*} value
	 * @returns
	 */
	public setByObject = (obj: any, key: string, value: any) => {
		if (!obj) {
			return;
		}
		if (obj.type === 'svg') {
			if (key === 'fill') {
				obj.setFill(value);
			} else if (key === 'stroke') {
				obj.setStroke(value);
			}
		}
		obj.set(key, value);
		obj.setCoords();
		this.canvas.renderAll();
		const { id, superType, type, player, width, height } = obj as any;
		if (superType === 'element') {
			if (key === 'visible') {
				if (value) {
					obj.element.style.display = 'block';
				} else {
					obj.element.style.display = 'none';
				}
			}
			const el = this.elementHandler.findById(id);
			// update the element
			this.elementHandler.setScaleOrAngle(el, obj);
			this.elementHandler.setSize(el, obj);
			this.elementHandler.setPosition(el, obj);
			if (type === 'video' && player) {
				player.setPlayerSize(width, height);
			}
		}
		const { onModified } = this;
		if (onModified) {
			onModified(obj);
		}
	};

	/**
	 * Set key pair by id
	 * @param {string} id
	 * @param {string} key
	 * @param {*} value
	 */
	public setById = (id: string, key: string, value: any) => {
		const findObject = this.findById(id);
		this.setByObject(findObject, key, value);
	};

	/**
	 * Set partial by object
	 * @param {FabricObject} obj
	 * @param {FabricObjectOption} option
	 * @returns
	 */
	public setByPartial = (obj: FabricObject, option: FabricObjectOption) => {
		if (!obj) {
			return;
		}
		if (obj.type === 'svg') {
			if (option.fill) {
				obj.setFill(option.fill);
			} else if (option.stroke) {
				obj.setStroke(option.stroke);
			}
		}
		obj.set(option);
		obj.setCoords();
		this.canvas.renderAll();
		const { id, superType, type, player, width, height } = obj as any;
		if (superType === 'element') {
			if ('visible' in option) {
				if (option.visible) {
					obj.element.style.display = 'block';
				} else {
					obj.element.style.display = 'none';
				}
			}
			const el = this.elementHandler.findById(id);
			// update the element
			this.elementHandler.setScaleOrAngle(el, obj);
			this.elementHandler.setSize(el, obj);
			this.elementHandler.setPosition(el, obj);
			if (type === 'video' && player) {
				player.setPlayerSize(width, height);
			}
		}
	};

	/**
	 * Set shadow
	 * @param {fabric.Shadow} option
	 * @returns
	 */
	public setShadow = (option: fabric.IShadowOptions) => {
		const activeObject = this.canvas.getActiveObject() as FabricObject;
		if (!activeObject) {
			return;
		}
		activeObject.set('shadow', new fabric.Shadow(option));
		this.canvas.requestRenderAll();
		const { onModified } = this;
		if (onModified) {
			onModified(activeObject);
		}
	};

	/**
	 * Set the image
	 * @param {FabricImage} obj
	 * @param {(File | string)} [source]
	 * @param {boolean} [keepSize] Keep size of previous Image
	 * @param {fabric.IImageOptions} [options]
	 * @returns
	 */
	public setImage = (
		obj: FabricImage,
		source?: File | string,
		keepSize?: boolean,
		options?: fabric.IImageOptions,
	): Promise<FabricImage> => {
		const { height, scaleY } = obj;
		const renderCallbaack = (imgObj: FabricImage, src: string) => {
			if (keepSize) {
				const scale = (height * scaleY) / imgObj.height;
				imgObj.set({ scaleY: scale, scaleX: scale, src });
			}
			this.canvas.requestRenderAll();
		};
		return new Promise(resolve => {
			if (!source) {
				obj.set('file', null);
				obj.set('src', null);
				resolve(
					obj.setSrc(
						'./images/sample/transparentBg.png',
						(imgObj: FabricImage) => renderCallbaack(imgObj, null),
						{
							dirty: true,
							...options,
						},
					) as FabricImage,
				);
			}
			if (source instanceof File) {
				const reader = new FileReader();
				reader.onload = () => {
					obj.set('file', source);
					obj.set('src', null);
					resolve(
						obj.setSrc(
							reader.result as string,
							(imgObj: FabricImage) => renderCallbaack(imgObj, reader.result as string),
							{
								dirty: true,
								...options,
							},
						) as FabricImage,
					);
				};
				reader.readAsDataURL(source);
			} else {
				obj.set('file', null);
				obj.set('src', source);
				resolve(
					obj.setSrc(source, (imgObj: FabricImage) => renderCallbaack(imgObj, source), {
						dirty: true,
						crossOrigin: 'anonymous',
						...options,
					}) as FabricImage,
				);
			}
		});
	};

	/**
	 * Set image by id
	 * @param {string} id
	 * @param {*} source
	 * @param {boolean} [keepSize] Keep size of previous Image
	 * @returns
	 */
	public setImageById = (id: string, source: any, keepSize?: boolean) => {
		const findObject = this.findById(id) as FabricImage;
		return Promise.resolve(this.setImage(findObject, source, keepSize));
	};

	/**
	 * Set Svg
	 *
	 * @param {SvgObject} obj
	 * @param {(File | string)} [source]
	 * @param {boolean} [keepSize] Keep size of previous SVG
	 * @param {boolean} [xmlString] XML string
	 */
	public setSvg = (
		obj: SvgObject,
		source?: File | string,
		keepSize?: boolean,
		xmlString?: boolean,
	): Promise<SvgObject> => {
		return new Promise(resolve => {
			if (!source) {
				resolve(obj.loadSvg({ src: './images/sample/chiller.svg', loadType: 'file', keepSize }));
			}
			if (source instanceof File) {
				const reader = new FileReader();
				reader.readAsDataURL(source);
				reader.onload = () =>
					resolve(obj.loadSvg({ src: reader.result as string, loadType: 'file', keepSize }));
			} else {
				resolve(obj.loadSvg({ src: source, loadType: xmlString ? 'svg' : 'file', keepSize }));
			}
		});
	};

	/**
	 * Set visible
	 * @param {boolean} [visible]
	 * @returns
	 */
	public setVisible = (visible?: boolean) => {
		const activeObject = this.canvas.getActiveObject() as FabricElement;
		if (!activeObject) {
			return;
		}
		if (activeObject.superType === 'element') {
			if (visible) {
				activeObject.element.style.display = 'block';
			} else {
				activeObject.element.style.display = 'none';
			}
		}
		activeObject.set({
			visible,
		});
		this.canvas.renderAll();
	};

	/**
	 * Set the position on Object
	 *
	 * @param {FabricObject} obj
	 * @param {boolean} [centered]
	 */
	public centerObject = (obj: FabricObject, centered?: boolean) => {
		if (centered) {
			this.canvas.centerObject(obj);
			obj.setCoords();
		} else {
			this.setByPartial(obj, {
				left:
					obj.left / this.canvas.getZoom() -
					obj.width / 2 -
					this.canvas.viewportTransform[4] / this.canvas.getZoom(),
				top:
					obj.top / this.canvas.getZoom() -
					obj.height / 2 -
					this.canvas.viewportTransform[5] / this.canvas.getZoom(),
			});
		}
	};

	/**
	 * Add object
	 * @param {FabricObjectOption} obj
	 * @param {boolean} [centered=true]
	 * @param {boolean} [loaded=false]
	 * @param {boolean} [group=false]
	 * @returns
	 */
	public add = (obj: FabricObjectOption, centered = true, loaded = false, group = false) => {
		const { editable, onAdd, gridOption, objectOption } = this;
		const option: any = {
			hasControls: editable,
			hasBorders: editable,
			selectable: editable,
			lockMovementX: !editable,
			lockMovementY: !editable,
			hoverCursor: !editable ? 'pointer' : 'move',
		};
		if (obj.type === 'i-text') {
			option.editable = false;
		} else {
			option.editable = editable;
		}
		if (editable && this.workarea.layout === 'fullscreen') {
			option.scaleX = this.workarea.scaleX;
			option.scaleY = this.workarea.scaleY;
		}
		const newOption = Object.assign(
			{},
			objectOption,
			obj,
			{
				container: this.container.id,
				editable,
			},
			option,
		);
		// Individually create canvas object
		if (obj.superType === 'link') {
			return this.linkHandler.create(newOption, loaded);
		}
		let createdObj;
		// Create canvas object
		if (obj.type === 'image') {
			createdObj = this.addImage(newOption);
		} else if (obj.type === 'group') {
			createdObj = this.addGroup(newOption);
		} else {
			createdObj = this.fabricObjects[obj.type].create(newOption);
		}
		if (group) {
			return createdObj;
		}
		this.canvas.add(createdObj);
		this.objects = this.getObjects();
		if (!editable && !(obj.superType === 'element')) {
			createdObj.on('mousedown', this.eventHandler.object.mousedown);
		}
		if (createdObj.dblclick) {
			createdObj.on('mousedblclick', this.eventHandler.object.mousedblclick);
		}
		if (this.objects.some(object => object.type === 'gif')) {
			this.startRequestAnimFrame();
		} else {
			this.stopRequestAnimFrame();
		}
		if (obj.superType !== 'drawing' && obj.superType !== 'link' && editable && !loaded) {
			this.centerObject(createdObj, centered);
		}
		if (createdObj.superType === 'node') {
			this.portHandler.create(createdObj as NodeObject);
			if (createdObj.iconButton) {
				this.canvas.add(createdObj.iconButton);
			}
		}
		if (!editable && createdObj.animation && createdObj.animation.autoplay) {
			this.animationHandler.play(createdObj.id);
		}
		if (createdObj.superType === 'node') {
			createdObj.set('shadow', {
				color: createdObj.stroke,
			} as fabric.Shadow);
		}
		if (gridOption.enabled) {
			this.gridHandler.setCoords(createdObj);
		}
		if (!this.transactionHandler.active && !loaded) {
			this.transactionHandler.save('add');
		}
		if (onAdd && editable && !loaded) {
			onAdd(createdObj);
		}
		return createdObj;
	};

	/**
	 * Add group object
	 *
	 * @param {FabricGroup} obj
	 * @param {boolean} [centered=true]
	 * @param {boolean} [loaded=false]
	 * @returns
	 */
	public addGroup = (obj: FabricGroup) => {
		const { objects = [], ...other } = obj;
		const _objects = objects.map(child => this.add(child, false, true, true)) as FabricObject[];
		return new fabric.Group(_objects, other) as FabricGroup;
	};

	/**
	 * Add iamge object
	 * @param {FabricImage} obj
	 * @returns
	 */
	public addImage = (obj: FabricImage) => {
		const { objectOption } = this;
		const { filters = [], src, file, ...otherOption } = obj;
		const image = new Image();
		// if (typeof src === 'string') {
		// 	image.src = src;
		// }
		const createdObj = new fabric.Image(image, {
			...objectOption,
			...otherOption,
		}) as FabricImage;
		createdObj.set({
			filters: this.imageHandler.createFilters(filters),
		});
		this.setImage(createdObj, src || file);
		return createdObj;
	};

	/**
	 * Remove object
	 * @param {FabricObject} target
	 * @returns {any}
	 */
	public remove = (target?: FabricObject) => {
		const activeObject = target || (this.canvas.getActiveObject() as any);
		if (this.prevTarget && this.prevTarget.superType === 'link') {
			this.linkHandler.remove(this.prevTarget as LinkObject);
			if (!this.transactionHandler.active) {
				this.transactionHandler.save('remove');
			}
			return;
		}
		if (!activeObject) {
			return;
		}
		if (typeof activeObject.deletable !== 'undefined' && !activeObject.deletable) {
			return;
		}
		if (activeObject.type !== 'activeSelection') {
			this.canvas.discardActiveObject();
			if (activeObject.superType === 'element') {
				this.elementHandler.removeById(activeObject.id);
			}
			if (activeObject.superType === 'link') {
				this.linkHandler.remove(activeObject);
			} else if (activeObject.superType === 'node') {
				if (activeObject.toPort) {
					if (activeObject.toPort.links.length) {
						activeObject.toPort.links.forEach((link: any) => {
							this.linkHandler.remove(link, 'from');
						});
					}
					this.canvas.remove(activeObject.toPort);
				}
				if (activeObject.fromPort && activeObject.fromPort.length) {
					activeObject.fromPort.forEach((port: any) => {
						if (port.links.length) {
							port.links.forEach((link: any) => {
								this.linkHandler.remove(link, 'to');
							});
						}
						this.canvas.remove(port);
					});
				}
			}
			this.canvas.remove(activeObject);
		} else {
			const { _objects: activeObjects } = activeObject;
			const existDeleted = activeObjects.some(
				(obj: any) => typeof obj.deletable !== 'undefined' && !obj.deletable,
			);
			if (existDeleted) {
				return;
			}
			this.canvas.discardActiveObject();
			activeObjects.forEach((obj: any) => {
				if (obj.superType === 'element') {
					this.elementHandler.removeById(obj.id);
				} else if (obj.superType === 'node') {
					if (obj.toPort) {
						if (obj.toPort.links.length) {
							obj.toPort.links.forEach((link: any) => {
								this.linkHandler.remove(link, 'from');
							});
						}
						this.canvas.remove(obj.toPort);
					}
					if (obj.fromPort && obj.fromPort.length) {
						obj.fromPort.forEach((port: any) => {
							if (port.links.length) {
								port.links.forEach((link: any) => {
									this.linkHandler.remove(link, 'to');
								});
							}
							this.canvas.remove(port);
						});
					}
				}
				this.canvas.remove(obj);
			});
		}
		if (!this.transactionHandler.active) {
			this.transactionHandler.save('remove');
		}
		this.objects = this.getObjects();
		const { onRemove } = this;
		if (onRemove) {
			onRemove(activeObject);
		}
	};

	/**
	 * Remove object by id
	 * @param {string} id
	 */
	public removeById = (id: string) => {
		const findObject = this.findById(id);
		if (findObject) {
			this.remove(findObject);
		}
	};

	/**
	 * Delete at origin object list
	 * @param {string} id
	 */
	public removeOriginById = (id: string) => {
		const object = this.findOriginByIdWithIndex(id);
		if (object.index > 0) {
			this.objects.splice(object.index, 1);
		}
	};

	/**
	 * Duplicate object
	 * @returns
	 */
	public duplicate = () => {
		const {
			onAdd,
			propertiesToInclude,
			gridOption: { grid = 10 },
		} = this;
		const activeObject = this.canvas.getActiveObject() as FabricObject;
		if (!activeObject) {
			return;
		}
		if (typeof activeObject.cloneable !== 'undefined' && !activeObject.cloneable) {
			return;
		}
		activeObject.clone((clonedObj: FabricObject) => {
			this.canvas.discardActiveObject();
			clonedObj.set({
				left: clonedObj.left + grid,
				top: clonedObj.top + grid,
				evented: true,
			});
			if (clonedObj.type === 'activeSelection') {
				const activeSelection = clonedObj as fabric.ActiveSelection;
				activeSelection.canvas = this.canvas;
				activeSelection.forEachObject((obj: any) => {
					obj.set('id', uuid());
					if (obj.superType === 'node') {
						obj.set('shadow', {
							color: obj.stroke,
						} as fabric.Shadow);
					}
					this.canvas.add(obj);
					this.objects = this.getObjects();
					if (obj.dblclick) {
						obj.on('mousedblclick', this.eventHandler.object.mousedblclick);
					}
				});
				if (onAdd) {
					onAdd(activeSelection);
				}
				activeSelection.setCoords();
			} else {
				if (activeObject.id === clonedObj.id) {
					clonedObj.set('id', uuid());
				}
				if (clonedObj.superType === 'node') {
					clonedObj.set('shadow', {
						color: clonedObj.stroke,
					} as fabric.Shadow);
				}
				this.canvas.add(clonedObj);
				this.objects = this.getObjects();
				if (clonedObj.dblclick) {
					clonedObj.on('mousedblclick', this.eventHandler.object.mousedblclick);
				}
				if (onAdd) {
					onAdd(clonedObj);
				}
			}
			this.canvas.setActiveObject(clonedObj);
			this.portHandler.create(clonedObj as NodeObject);
			this.canvas.requestRenderAll();
		}, propertiesToInclude);
	};

	/**
	 * Duplicate object by id
	 * @param {string} id
	 * @returns
	 */
	public duplicateById = (id: string) => {
		const {
			onAdd,
			propertiesToInclude,
			gridOption: { grid = 10 },
		} = this;
		const findObject = this.findById(id);
		if (findObject) {
			if (typeof findObject.cloneable !== 'undefined' && !findObject.cloneable) {
				return false;
			}
			findObject.clone((cloned: FabricObject) => {
				cloned.set({
					left: cloned.left + grid,
					top: cloned.top + grid,
					id: uuid(),
					evented: true,
				});
				this.canvas.add(cloned);
				this.objects = this.getObjects();
				if (onAdd) {
					onAdd(cloned);
				}
				if (cloned.dblclick) {
					cloned.on('mousedblclick', this.eventHandler.object.mousedblclick);
				}
				this.canvas.setActiveObject(cloned);
				this.portHandler.create(cloned as NodeObject);
				this.canvas.requestRenderAll();
			}, propertiesToInclude);
		}
		return true;
	};

	/**
	 * Cut object
	 *
	 */
	public cut = () => {
		this.copy();
		this.remove();
		this.isCut = true;
	};

	/**
	 * Copy to clipboard
	 *
	 * @param {*} value
	 */
	public copyToClipboard = (value: any) => {
		const textarea = document.createElement('textarea');
		document.body.appendChild(textarea);
		textarea.value = value;
		textarea.select();
		document.execCommand('copy');
		document.body.removeChild(textarea);
		this.canvas.wrapperEl.focus();
	};

	/**
	 * Copy object
	 *
	 * @returns
	 */
	public copy = () => {
		const { propertiesToInclude } = this;
		const activeObject = this.canvas.getActiveObject() as FabricObject;
		if (activeObject && activeObject.superType === 'link') {
			return false;
		}
		if (activeObject) {
			if (typeof activeObject.cloneable !== 'undefined' && !activeObject.cloneable) {
				return false;
			}
			if (activeObject.type === 'activeSelection') {
				const activeSelection = activeObject as fabric.ActiveSelection;
				if (activeSelection.getObjects().some((obj: any) => obj.superType === 'node')) {
					if (this.keyEvent.clipboard) {
						const links = [] as any[];
						const objects = activeSelection.getObjects().map((obj: any, index: number) => {
							if (typeof obj.cloneable !== 'undefined' && !obj.cloneable) {
								return null;
							}
							if (obj.fromPort.length) {
								obj.fromPort.forEach((port: any) => {
									if (port.links.length) {
										port.links.forEach((link: any) => {
											const linkTarget = {
												fromNodeIndex: index,
												fromPortId: port.id,
												type: 'curvedLink',
												superType: 'link',
											} as any;
											const findIndex = activeSelection
												.getObjects()
												.findIndex((compObj: any) => compObj.id === link.toNode.id);
											if (findIndex >= 0) {
												linkTarget.toNodeIndex = findIndex;
												links.push(linkTarget);
											}
										});
									}
								});
							}
							return {
								name: obj.name,
								description: obj.description,
								superType: obj.superType,
								type: obj.type,
								nodeClazz: obj.nodeClazz,
								configuration: obj.configuration,
								descriptor: obj.descriptor,
								properties: {
									left: activeObject.left + activeObject.width / 2 + obj.left || 0,
									top: activeObject.top + activeObject.height / 2 + obj.top || 0,
									iconName: obj.descriptor.icon,
								},
							};
						});
						this.copyToClipboard(JSON.stringify(objects.concat(links), null, '\t'));
						return true;
					}
					this.clipboard = activeObject;
					return true;
				}
			}
			activeObject.clone((cloned: FabricObject) => {
				if (this.keyEvent.clipboard) {
					if (cloned.superType === 'node') {
						const node = {
							name: cloned.name,
							description: cloned.description,
							superType: cloned.superType,
							type: cloned.type,
							nodeClazz: cloned.nodeClazz,
							configuration: cloned.configuration,
							descriptor: cloned.descriptor,
							properties: {
								left: cloned.left || 0,
								top: cloned.top || 0,
								iconName: cloned.descriptor.icon,
							},
						};
						const objects = [node];
						this.copyToClipboard(JSON.stringify(objects, null, '\t'));
					} else {
						this.copyToClipboard(JSON.stringify(cloned.toObject(propertiesToInclude), null, '\t'));
					}
				} else {
					this.clipboard = cloned;
				}
			}, propertiesToInclude);
		}
		return true;
	};

	/**
	 * Paste object
	 *
	 * @returns
	 */
	public paste = () => {
		const {
			onAdd,
			propertiesToInclude,
			gridOption: { grid = 10 },
			clipboard,
			isCut,
		} = this;
		const padding = isCut ? 0 : grid;
		if (!clipboard) {
			return false;
		}
		if (typeof clipboard.cloneable !== 'undefined' && !clipboard.cloneable) {
			return false;
		}
		this.isCut = false;
		if (clipboard.type === 'activeSelection') {
			if (clipboard.getObjects().some((obj: any) => obj.superType === 'node')) {
				this.canvas.discardActiveObject();
				const objects = [] as any[];
				const linkObjects = [] as LinkOption[];
				clipboard.getObjects().forEach((obj: any) => {
					if (typeof obj.cloneable !== 'undefined' && !obj.cloneable) {
						return;
					}
					const clonedObj = obj.duplicate();
					if (clonedObj.type === 'SwitchNode') {
						clonedObj.set({
							left: obj.left + padding + padding,
							top: obj.top + padding,
						});
					} else {
						clonedObj.set({
							left: obj.left + padding,
							top: obj.top + padding,
						});
					}
					if (obj.fromPort.length) {
						obj.fromPort.forEach((port: PortObject) => {
							if (port.links.length) {
								port.links.forEach((link: LinkObject) => {
									const linkTarget = {
										fromNode: clonedObj.id,
										fromPort: port.id,
									} as any;
									const findIndex = clipboard
										.getObjects()
										.findIndex((compObj: any) => compObj.id === link.toNode.id);
									if (findIndex >= 0) {
										linkTarget.toNodeIndex = findIndex;
										linkObjects.push(linkTarget);
									}
								});
							}
						});
					}
					if (clonedObj.dblclick) {
						clonedObj.on('mousedblclick', this.eventHandler.object.mousedblclick);
					}
					this.canvas.add(clonedObj);
					this.objects = this.getObjects();
					this.portHandler.create(clonedObj);
					objects.push(clonedObj);
				});
				if (linkObjects.length) {
					linkObjects.forEach((linkObject: any) => {
						const { fromNode, fromPort, toNodeIndex } = linkObject;
						const toNode = objects[toNodeIndex];
						const link = {
							type: 'curvedLink',
							fromNodeId: fromNode,
							fromPortId: fromPort,
							toNodeId: toNode.id,
							toPortId: toNode.toPort.id,
						};
						this.linkHandler.create(link);
					});
				}
				const activeSelection = new fabric.ActiveSelection(objects, {
					canvas: this.canvas,
					...this.activeSelectionOption,
				});
				if (isCut) {
					this.clipboard = null;
				} else {
					this.clipboard = activeSelection;
				}
				if (!this.transactionHandler.active) {
					this.transactionHandler.save('paste');
				}
				this.canvas.setActiveObject(activeSelection);
				this.canvas.renderAll();
				return true;
			}
		}
		clipboard.clone((clonedObj: any) => {
			this.canvas.discardActiveObject();
			clonedObj.set({
				left: clonedObj.left + padding,
				top: clonedObj.top + padding,
				id: isCut ? clipboard.id : uuid(),
				evented: true,
			});
			if (clonedObj.type === 'activeSelection') {
				clonedObj.canvas = this.canvas;
				clonedObj.forEachObject((obj: any) => {
					obj.set('id', isCut ? obj.id : uuid());
					this.canvas.add(obj);
					if (obj.dblclick) {
						obj.on('mousedblclick', this.eventHandler.object.mousedblclick);
					}
				});
			} else {
				if (clonedObj.superType === 'node') {
					clonedObj = clonedObj.duplicate();
				}
				this.canvas.add(clonedObj);
				if (clonedObj.dblclick) {
					clonedObj.on('mousedblclick', this.eventHandler.object.mousedblclick);
				}
			}
			const newClipboard = clipboard.set({
				top: clonedObj.top,
				left: clonedObj.left,
			});
			if (isCut) {
				this.clipboard = null;
			} else {
				this.clipboard = newClipboard;
			}
			if (clonedObj.superType === 'node') {
				this.portHandler.create(clonedObj);
			}
			if (!this.transactionHandler.active) {
				this.transactionHandler.save('paste');
			}
			// TODO...
			// After toGroup svg elements not rendered.
			this.objects = this.getObjects();
			if (onAdd) {
				onAdd(clonedObj);
			}
			clonedObj.setCoords();
			this.canvas.setActiveObject(clonedObj);
			this.canvas.requestRenderAll();
		}, propertiesToInclude);
		return true;
	};

	/**
	 * Find object by object
	 * @param {FabricObject} obj
	 */
	public find = (obj: FabricObject) => this.findById(obj.id);

	/**
	 * Find object by id
	 * @param {string} id
	 * @returns {(FabricObject | null)}
	 */
	public findById = (id: string): FabricObject | null => {
		let findObject;
		const exist = this.objects.some(obj => {
			if (obj.id === id) {
				findObject = obj;
				return true;
			}
			return false;
		});
		if (!exist) {
			warning(true, 'Not found object by id.');
			return null;
		}
		return findObject;
	};

	/**
	 * Find object in origin list
	 * @param {string} id
	 * @returns
	 */
	public findOriginById = (id: string) => {
		let findObject: FabricObject;
		const exist = this.objects.some(obj => {
			if (obj.id === id) {
				findObject = obj;
				return true;
			}
			return false;
		});
		if (!exist) {
			console.warn('Not found object by id.');
			return null;
		}
		return findObject;
	};

	/**
	 * Return origin object list
	 * @param {string} id
	 * @returns
	 */
	public findOriginByIdWithIndex = (id: string) => {
		let findObject;
		let index = -1;
		const exist = this.objects.some((obj, i) => {
			if (obj.id === id) {
				findObject = obj;
				index = i;
				return true;
			}
			return false;
		});
		if (!exist) {
			console.warn('Not found object by id.');
			return {};
		}
		return {
			object: findObject,
			index,
		};
	};

	/**
	 * Select object
	 * @param {FabricObject} obj
	 * @param {boolean} [find]
	 */
	public select = (obj: FabricObject, find?: boolean) => {
		let findObject = obj;
		if (find) {
			findObject = this.find(obj);
		}
		if (findObject) {
			this.canvas.discardActiveObject();
			this.canvas.setActiveObject(findObject);
			this.canvas.requestRenderAll();
		}
	};

	/**
	 * Select by id
	 * @param {string} id
	 */
	public selectById = (id: string) => {
		const findObject = this.findById(id);
		if (findObject) {
			this.canvas.discardActiveObject();
			this.canvas.setActiveObject(findObject);
			this.canvas.requestRenderAll();
		}
	};

	/**
	 * Select all
	 * @returns
	 */
	public selectAll = () => {
		this.canvas.discardActiveObject();
		const filteredObjects = this.canvas.getObjects().filter((obj: any) => {
			if (obj.id === 'workarea') {
				return false;
			} else if (!obj.evented) {
				return false;
			} else if (obj.superType === 'link') {
				return false;
			} else if (obj.superType === 'port') {
				return false;
			} else if (obj.superType === 'element') {
				return false;
			} else if (obj.locked) {
				return false;
			}
			return true;
		});
		if (!filteredObjects.length) {
			return;
		}
		if (filteredObjects.length === 1) {
			this.canvas.setActiveObject(filteredObjects[0]);
			this.canvas.renderAll();
			return;
		}
		const activeSelection = new fabric.ActiveSelection(filteredObjects, {
			canvas: this.canvas,
			...this.activeSelectionOption,
		});
		this.canvas.setActiveObject(activeSelection);
		this.canvas.renderAll();
	};

	/**
	 * Save origin width, height
	 * @param {FabricObject} obj
	 * @param {number} width
	 * @param {number} height
	 */
	public originScaleToResize = (obj: FabricObject, width: number, height: number) => {
		if (obj.id === 'workarea') {
			this.setByPartial(obj, {
				workareaWidth: obj.width,
				workareaHeight: obj.height,
			});
		}
		this.setByPartial(obj, {
			scaleX: width / obj.width,
			scaleY: height / obj.height,
		});
	};

	/**
	 * When set the width, height, Adjust the size
	 * @param {number} width
	 * @param {number} height
	 */
	public scaleToResize = (width: number, height: number) => {
		const activeObject = this.canvas.getActiveObject() as FabricObject;
		const { id } = activeObject;
		const obj = {
			id,
			scaleX: width / activeObject.width,
			scaleY: height / activeObject.height,
		};
		this.setObject(obj);
		activeObject.setCoords();
		this.canvas.requestRenderAll();
	};

	/**
	 * Import json
	 * @param {*} json
	 * @param {(canvas: FabricCanvas) => void} [callback]
	 */
	public importJSON = async (json: any, callback?: (canvas: FabricCanvas) => void) => {
		if (typeof json === 'string') {
			json = JSON.parse(json);
		}
		let prevLeft = 0;
		let prevTop = 0;
		this.canvas.setBackgroundColor(this.canvasOption.backgroundColor, this.canvas.renderAll.bind(this.canvas));
		const workarea = json.find((obj: FabricObjectOption) => obj.id === 'workarea');
		if (!this.workarea) {
			this.workareaHandler.initialize();
		}
		if (workarea) {
			prevLeft = workarea.left;
			prevTop = workarea.top;
			this.workarea.set(workarea);
			await this.workareaHandler.setImage(workarea.src, true);
			this.workarea.setCoords();
		} else {
			this.canvas.centerObject(this.workarea);
			this.workarea.setCoords();
			prevLeft = this.workarea.left;
			prevTop = this.workarea.top;
		}
		json.forEach((obj: FabricObjectOption) => {
			if (obj.id === 'workarea') {
				return;
			}
			const canvasWidth = this.canvas.getWidth();
			const canvasHeight = this.canvas.getHeight();
			const { width, height, scaleX, scaleY, layout, left, top } = this.workarea;
			if (layout === 'fullscreen') {
				const leftRatio = canvasWidth / (width * scaleX);
				const topRatio = canvasHeight / (height * scaleY);
				obj.left *= leftRatio;
				obj.top *= topRatio;
				obj.scaleX *= leftRatio;
				obj.scaleY *= topRatio;
			} else {
				const diffLeft = left - prevLeft;
				const diffTop = top - prevTop;
				obj.left += diffLeft;
				obj.top += diffTop;
			}
			if (obj.superType === 'element') {
				obj.id = uuid();
			}
			this.add(obj, false, true);
			this.canvas.renderAll();
		});
		this.objects = this.getObjects();
		if (callback) {
			callback(this.canvas);
		}
		return Promise.resolve(this.canvas);
	};

	/**
	 * Export json
	 */
	public exportJSON = () => this.canvas.toObject(this.propertiesToInclude).objects as FabricObject[];

	/**
	 * Active selection to group
	 * @returns
	 */
	public toGroup = (target?: FabricObject) => {
		const activeObject = target || (this.canvas.getActiveObject() as fabric.ActiveSelection);
		if (!activeObject) {
			return null;
		}
		if (activeObject.type !== 'activeSelection') {
			return null;
		}
		const group = activeObject.toGroup() as FabricObject<fabric.Group>;
		group.set({
			id: uuid(),
			name: 'New group',
			type: 'group',
			...this.objectOption,
		});
		this.objects = this.getObjects();
		if (!this.transactionHandler.active) {
			this.transactionHandler.save('group');
		}
		if (this.onSelect) {
			this.onSelect(group);
		}
		this.canvas.renderAll();
		return group;
	};

	/**
	 * Group to active selection
	 * @returns
	 */
	public toActiveSelection = (target?: FabricObject) => {
		const activeObject = target || (this.canvas.getActiveObject() as fabric.Group);
		if (!activeObject) {
			return;
		}
		if (activeObject.type !== 'group') {
			return;
		}
		const activeSelection = activeObject.toActiveSelection();
		this.objects = this.getObjects();
		if (!this.transactionHandler.active) {
			this.transactionHandler.save('ungroup');
		}
		if (this.onSelect) {
			this.onSelect(activeSelection);
		}
		this.canvas.renderAll();
		return activeSelection;
	};

	/**
	 * Bring forward
	 */
	public bringForward = () => {
		const activeObject = this.canvas.getActiveObject() as FabricObject;
		if (activeObject) {
			this.canvas.bringForward(activeObject);
			if (!this.transactionHandler.active) {
				this.transactionHandler.save('bringForward');
			}
			const { onModified } = this;
			if (onModified) {
				onModified(activeObject);
			}
		}
	};

	/**
	 * Bring to front
	 */
	public bringToFront = () => {
		const activeObject = this.canvas.getActiveObject() as FabricObject;
		if (activeObject) {
			this.canvas.bringToFront(activeObject);
			if (!this.transactionHandler.active) {
				this.transactionHandler.save('bringToFront');
			}
			const { onModified } = this;
			if (onModified) {
				onModified(activeObject);
			}
		}
	};

	/**
	 * Send backwards
	 * @returns
	 */
	public sendBackwards = () => {
		const activeObject = this.canvas.getActiveObject() as FabricObject;
		if (activeObject) {
			const firstObject = this.canvas.getObjects()[1] as FabricObject;
			if (firstObject.id === activeObject.id) {
				return;
			}
			if (!this.transactionHandler.active) {
				this.transactionHandler.save('sendBackwards');
			}
			this.canvas.sendBackwards(activeObject);
			const { onModified } = this;
			if (onModified) {
				onModified(activeObject);
			}
		}
	};

	/**
	 * Send to back
	 */
	public sendToBack = () => {
		const activeObject = this.canvas.getActiveObject() as FabricObject;
		if (activeObject) {
			this.canvas.sendToBack(activeObject);
			this.canvas.sendToBack(this.canvas.getObjects()[1]);
			if (!this.transactionHandler.active) {
				this.transactionHandler.save('sendToBack');
			}
			const { onModified } = this;
			if (onModified) {
				onModified(activeObject);
			}
		}
	};

	/**
	 * Clear canvas
	 * @param {boolean} [includeWorkarea=false]
	 */
	public clear = (includeWorkarea = false) => {
		const ids = this.canvas.getObjects().reduce((prev, curr: any) => {
			if (curr.superType === 'element') {
				prev.push(curr.id);
				return prev;
			}
			return prev;
		}, []);
		this.elementHandler.removeByIds(ids);
		if (includeWorkarea) {
			this.canvas.clear();
			this.workarea = null;
		} else {
			this.canvas.discardActiveObject();
			this.canvas.getObjects().forEach((obj: any) => {
				if (obj.id === 'grid' || obj.id === 'workarea') {
					return;
				}
				this.canvas.remove(obj);
			});
		}
		this.objects = this.getObjects();
		this.canvas.renderAll();
	};

	/**
	 * Start request animation frame
	 */
	public startRequestAnimFrame = () => {
		if (!this.isRequsetAnimFrame) {
			this.isRequsetAnimFrame = true;
			const render = () => {
				this.canvas.renderAll();
				this.requestFrame = fabric.util.requestAnimFrame(render);
			};
			fabric.util.requestAnimFrame(render);
		}
	};

	/**
	 * Stop request animation frame
	 */
	public stopRequestAnimFrame = () => {
		this.isRequsetAnimFrame = false;
		const cancelRequestAnimFrame = (() =>
			window.cancelAnimationFrame ||
			// || window.webkitCancelRequestAnimationFrame
			// || window.mozCancelRequestAnimationFrame
			// || window.oCancelRequestAnimationFrame
			// || window.msCancelRequestAnimationFrame
			clearTimeout)();
		cancelRequestAnimFrame(this.requestFrame);
	};

	/**
	 * Save target object as image
	 * @param {FabricObject} targetObject
	 * @param {string} [option={ name: 'New Image', format: 'png', quality: 1 }]
	 */
	public saveImage = (targetObject: FabricObject, option = { name: 'New Image', format: 'png', quality: 1 }) => {
		let dataUrl;
		let target = targetObject;
		if (target) {
			dataUrl = target.toDataURL(option);
		} else {
			target = this.canvas.getActiveObject() as FabricObject;
			if (target) {
				dataUrl = target.toDataURL(option);
			}
		}
		if (dataUrl) {
			const anchorEl = document.createElement('a');
			anchorEl.href = dataUrl;
			anchorEl.download = `${option.name}.png`;
			document.body.appendChild(anchorEl);
			anchorEl.click();
			anchorEl.remove();
		}
	};

	/**
	 * Save canvas as image
	 * @param {string} [option={ name: 'New Image', format: 'png', quality: 1 }]
	 */
	public saveCanvasImage = (option = { name: 'New Image', format: 'png', quality: 1 }) => {
		// If it's zoomed out/in, the container will also include in the image
		// hence need to reset the zoom level.
		let { left, top, width, height, scaleX, scaleY } = this.workarea;
		width = Math.ceil(width * scaleX);
		height = Math.ceil(height * scaleY);
		// cachedVT is used to reset the viewportTransform after the image is saved.
		const cachedVT = this.canvas.viewportTransform;
		// reset the viewportTransform to default (no zoom)
		this.canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
		const dataUrl = this.canvas.toDataURL({
			...option,
			left,
			top,
			width,
			height,
			enableRetinaScaling: true,
		});

		if (dataUrl) {
			const anchorEl = document.createElement('a');
			anchorEl.href = dataUrl;
			anchorEl.download = `${option.name}.png`;
			document.body.appendChild(anchorEl);
			anchorEl.click();
			anchorEl.remove();
		}
		// reset the viewportTransform to previous value.
		this.canvas.viewportTransform = cachedVT;
	};

	/**
	 * Sets "angle" of an instance with centered rotation
	 *
	 * @param {number} angle
	 */
	public rotate = (angle: number) => {
		const activeObject = this.canvas.getActiveObject();
		if (activeObject) {
			this.set('rotation', angle);
			activeObject.rotate(angle);
			this.canvas.requestRenderAll();
		}
	};

	/**
	 * Destroy canvas
	 *
	 */
	public destroy = () => {
		this.eventHandler.destroy();
		this.guidelineHandler.destroy();
		this.contextmenuHandler.destory();
		this.tooltipHandler.destroy();
		this.clear(true);
	};

	/**
	 * Set canvas option
	 *
	 * @param {CanvasOption} canvasOption
	 */
	public setCanvasOption = (canvasOption: CanvasOption) => {
		this.canvasOption = Object.assign({}, this.canvasOption, canvasOption);
		this.canvas.setBackgroundColor(canvasOption.backgroundColor, this.canvas.renderAll.bind(this.canvas));
		if (typeof canvasOption.width !== 'undefined' && typeof canvasOption.height !== 'undefined') {
			if (this.eventHandler) {
				this.eventHandler.resize(canvasOption.width, canvasOption.height);
			} else {
				this.canvas.setWidth(canvasOption.width).setHeight(canvasOption.height);
			}
		}
		if (typeof canvasOption.selection !== 'undefined') {
			this.canvas.selection = canvasOption.selection;
		}
		if (typeof canvasOption.hoverCursor !== 'undefined') {
			this.canvas.hoverCursor = canvasOption.hoverCursor;
		}
		if (typeof canvasOption.defaultCursor !== 'undefined') {
			this.canvas.defaultCursor = canvasOption.defaultCursor;
		}
		if (typeof canvasOption.preserveObjectStacking !== 'undefined') {
			this.canvas.preserveObjectStacking = canvasOption.preserveObjectStacking;
		}
	};

	/**
	 * Set keyboard event
	 *
	 * @param {KeyEvent} keyEvent
	 */
	public setKeyEvent = (keyEvent: KeyEvent) => {
		this.keyEvent = Object.assign({}, this.keyEvent, keyEvent);
	};

	/**
	 * Set fabric objects
	 *
	 * @param {FabricObjects} fabricObjects
	 */
	public setFabricObjects = (fabricObjects: FabricObjects) => {
		this.fabricObjects = Object.assign({}, this.fabricObjects, fabricObjects);
	};

	/**
	 * Set workarea option
	 *
	 * @param {WorkareaOption} workareaOption
	 */
	public setWorkareaOption = (workareaOption: WorkareaOption) => {
		this.workareaOption = Object.assign({}, this.workareaOption, workareaOption);
		if (this.workarea) {
			this.workarea.set({
				...workareaOption,
			});
		}
	};

	/**
	 * Set guideline option
	 *
	 * @param {GuidelineOption} guidelineOption
	 */
	public setGuidelineOption = (guidelineOption: GuidelineOption) => {
		this.guidelineOption = Object.assign({}, this.guidelineOption, guidelineOption);
		if (this.guidelineHandler) {
			this.guidelineHandler.initialize();
		}
	};

	/**
	 * Set grid option
	 *
	 * @param {GridOption} gridOption
	 */
	public setGridOption = (gridOption: GridOption) => {
		this.gridOption = Object.assign({}, this.gridOption, gridOption);
	};

	/**
	 * Set object option
	 *
	 * @param {FabricObjectOption} objectOption
	 */
	public setObjectOption = (objectOption: FabricObjectOption) => {
		this.objectOption = Object.assign({}, this.objectOption, objectOption);
	};

	/**
	 * Set activeSelection option
	 *
	 * @param {Partial<FabricObjectOption<fabric.ActiveSelection>>} activeSelectionOption
	 */
	public setActiveSelectionOption = (activeSelectionOption: Partial<FabricObjectOption<fabric.ActiveSelection>>) => {
		this.activeSelectionOption = Object.assign({}, this.activeSelectionOption, activeSelectionOption);
	};

	/**
	 * Set propertiesToInclude
	 *
	 * @param {string[]} propertiesToInclude
	 */
	public setPropertiesToInclude = (propertiesToInclude: string[]) => {
		this.propertiesToInclude = union(propertiesToInclude, this.propertiesToInclude);
	};

	/**
	 * Register custom handler
	 *
	 * @param {string} name
	 * @param {typeof CustomHandler} handler
	 */
	public registerHandler = (name: string, handler: typeof CustomHandler) => {
		this.handlers[name] = new handler(this);
		return this.handlers[name];
	};
}

export default Handler;
