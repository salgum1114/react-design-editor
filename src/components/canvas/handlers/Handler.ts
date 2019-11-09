import { fabric } from 'fabric';
import warning from 'warning';

import {
    ElementHandler,
    ImageHandler,
    ChartHandler,
    CropHandler,
    AnimationHandler,
    ContextmenuHandler,
    TooltipHandler,
    ZoomHandler,
    WorkareaHandler,
    ModeHandler,
    TransactionHandler,
    LinkHandler,
    AlignmentHandler,
    GuidelineHandler,
    GridHandler,
    PortHandler,
    NodeHandler,
    EventHandler,
} from '.';
import {
    FabricObject,
    FabricImage,
    WorkareaObject,
    WorkareaOption,
    InteractionMode,
    CanvasOption,
    GridOption,
    GuidelineOption,
    KeyEvent,
} from '../utils';

export interface HandlerOptions {
    id: string;
    canvas: fabric.Canvas;
    container: HTMLDivElement;
    workarea: WorkareaObject;
    objects: fabric.Object[];
    editable?: boolean;
    interactionMode: InteractionMode;
    propertiesToInclude?: string[];
    minZoom?: number;
    maxZoom?: number;
    workareaOption?: WorkareaOption;
    canvasOption?: CanvasOption;
    gridOption?: GridOption;
    defaultOption?: FabricObject;
    zoomEnabled?: boolean;
    activeSelection?: FabricObject<fabric.ActiveSelection>;
    width?: number;
    height?: number;
    keyEvent?: KeyEvent;
    [key: string]: any;

    onAdd?: (object: FabricObject) => void;
    onContext?: (el: HTMLDivElement, e: React.MouseEvent, target?: fabric.Object) => Promise<any>;
    onTooltip?: (el: HTMLDivElement, target?: fabric.Object) => Promise<any>;
    onZoom?: (zoomRatio: number) => void;
    onLink?: (canvas: fabric.Canvas, target: FabricObject) => void;
    onDblClick?: (canvas: fabric.Canvas, target: FabricObject) => void;
    onModified?: (target: FabricObject) => void;
    onSelect?: (target: FabricObject) => void;
}

class Handler {
    public id: string;
    public canvas: fabric.Canvas;
    public workarea: WorkareaObject;
    public objects: FabricObject[];
    public container: HTMLDivElement;
    public editable: boolean;
    public interactionMode: InteractionMode;
    public propertiesToInclude?: string[];
    public minZoom: number;
    public maxZoom: number;
    public workareaOption?: WorkareaOption;
    public canvasOption?: CanvasOption;
    public gridOption?: GridOption;
    public fabricObjects?: any;
    public defaultOption?: FabricObject;
    public guidelineOption?: GuidelineOption;
    public zoomEnabled?: boolean;
    public activeSelection?: FabricObject<fabric.ActiveSelection>;
    public keyEvent?: KeyEvent;

    public onAdd?: (object: FabricObject) => void;
    public onContext?: (el: HTMLDivElement, e: React.MouseEvent, target?: fabric.Object) => Promise<any>;
    public onTooltip?: (el: HTMLDivElement, target?: fabric.Object) => Promise<any>;
    public onZoom?: (zoomRatio: number) => void;
    public onLink?: (canvas: fabric.Canvas, target: FabricObject) => void;
    public onDblClick?: (canvas: fabric.Canvas, target: FabricObject) => void;
    public onModified?: (target: FabricObject) => void;
    public onSelect?: (target: FabricObject) => void;

    public imageHandler: ImageHandler;
    public chartHandler: ChartHandler;
    public elementHandler: ElementHandler;
    public cropHandler: CropHandler;
    public animationHandler: AnimationHandler;
    public contextmenuHandler: ContextmenuHandler;
    public tooltipHandler: TooltipHandler;
    public zoomHandler: ZoomHandler;
    public workareaHandler: WorkareaHandler;
    public modeHandler: ModeHandler;
    public transactionHandler: TransactionHandler;
    public gridHandler: GridHandler;
    public portHandler: PortHandler;
    public linkHandler: LinkHandler;
    public nodeHandler: NodeHandler;
    public alignmentHandler: AlignmentHandler;
    public guidelineHandler: GuidelineHandler;
    public eventHandler: EventHandler;

    public activeLine?: any;
    public activeShape?: any;
    public zoom = 1;
    public prevTarget?: FabricObject;
    public target?: FabricObject;
    public pointArray?: any[];

    private isRequsetAnimFrame = false;
    private requestFrame: any;

    constructor(options: HandlerOptions) {
        this.id = options.id;
        this.canvas = options.canvas;
        this.workarea = options.workarea;
        this.container = options.container;
        this.objects = options.objects;
        this.editable = options.editable;
        this.interactionMode = options.interactionMode;
        this.propertiesToInclude = options.propertiesToInclude;
        this.minZoom = options.minZoom;
        this.maxZoom = options.maxZoom;
        this.workareaOption = options.workareaOption;
        this.canvasOption = options.canvasOption;
        this.gridOption = options.gridOption;
        this.defaultOption = options.defaultOption;
        this.fabricObjects = options.fabricObjects;
        this.zoomEnabled = options.zoomEnabled;
        this.activeSelection = options.activeSelection;
        this.keyEvent = options.keyEvent;

        this.onAdd = options.onAdd;
        this.onTooltip = options.onTooltip;
        this.onZoom = options.onZoom;
        this.onContext = options.onContext;
        this.onLink = options.onLink;
        this.onDblClick = options.onDblClick;
        this.onSelect = options.onSelect;

        this.imageHandler = new ImageHandler(this);
        this.chartHandler = new ChartHandler(this);
        this.elementHandler = new ElementHandler(this);
        this.cropHandler = new CropHandler(this);
        this.animationHandler = new AnimationHandler(this);
        this.contextmenuHandler = new ContextmenuHandler(this, {
            onContext: options.onContext,
        });
        this.tooltipHandler = new TooltipHandler(this, {
            onTooltip: options.onTooltip,
        });
        this.zoomHandler = new ZoomHandler(this, {
            onZoom: options.onZoom,
        });
        this.workareaHandler = new WorkareaHandler(this);
        this.modeHandler = new ModeHandler(this);
        this.transactionHandler = new TransactionHandler(this);
        this.gridHandler = new GridHandler(this);
        this.portHandler = new PortHandler(this);
        this.linkHandler = new LinkHandler(this, {
            onAdd: options.onAdd,
        });
        this.nodeHandler = new NodeHandler(this);
        this.alignmentHandler = new AlignmentHandler(this);
        this.guidelineHandler = new GuidelineHandler(this);
        this.eventHandler = new EventHandler(this);
    }

    /**
     * Set the position on Object
     *
     * @param {FabricObject} obj
     * @param {boolean} [centered]
     */
    centerObject = (obj: FabricObject, centered?: boolean) => {
        if (centered) {
            this.canvas.centerObject(obj);
            obj.setCoords();
        } else {
            this.setByPartial(obj, {
                left: (obj.left / this.canvas.getZoom()) - (obj.width / 2) - (this.canvas.viewportTransform[4] / this.canvas.getZoom()),
                top: (obj.top / this.canvas.getZoom()) - (obj.height / 2) - (this.canvas.viewportTransform[5] / this.canvas.getZoom()),
            });
        }
    }

    /**
     * @description Add object
     * @param {FabricObject} obj
     * @param {boolean} [centered=true]
     * @param {boolean} [loaded=false]
     * @returns
     */
    add = (obj: FabricObject, centered = true, loaded = false) => {
        const { editable, onAdd, gridOption } = this;
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
        const newOption = Object.assign({}, option, obj, {
            container: this.container,
            editable,
        });
        // Individually create canvas object
        if (obj.superType === 'link') {
            return this.linkHandler.create(newOption);
        }
        if (obj.type === 'svg') {
            return this.addSVG(newOption, centered, loaded);
        }
        let createdObj;
        // Create canvas object
        if (obj.type === 'image') {
            createdObj = this.addImage(newOption);
        } else if (obj.type === 'group') {
            const objects = this.addGroup(newOption, centered, loaded);
            const groupOption = Object.assign({}, newOption, { objects, name: 'New Group' });
            createdObj = this.fabricObjects[obj.type].create(groupOption);
        } else {
            console.log(obj, this.fabricObjects);
            createdObj = this.fabricObjects[obj.type].create(newOption);
        }
        this.canvas.add(createdObj);
        this.objects = this.getObjects();
        if (!editable && !(obj.superType === 'element')) {
            createdObj.on('mousedown', this.eventHandler.objectMousedown);
        }
        if (createdObj.dbclick) {
            createdObj.on('mousedblclick', this.eventHandler.objectMousedblclick);
        }
        if (this.objects.some(object => object.type === 'gif')) {
            this.startRequestAnimFrame();
        } else {
            this.stopRequestAnimFrame();
        }
        if (
            obj.superType !== 'drawing'
            && obj.superType !== 'link'
            && editable
            && !loaded
        ) {
            this.centerObject(createdObj, centered);
        }
        if (createdObj.superType === 'node') {
            this.portHandler.create(createdObj);
            if (createdObj.iconButton) {
                this.canvas.add(createdObj.iconButton);
            }
        }
        if (!editable && createdObj.animation && createdObj.animation.autoplay) {
            this.animationHandler.play(createdObj.id);
        }
        if (onAdd && editable && !loaded) {
            onAdd(createdObj);
        }
        if (!loaded) {
            if (createdObj.superType === 'node') {
                createdObj.setShadow({
                    color: createdObj.stroke,
                });
                this.nodeHandler.highlightingNode(createdObj);
            }
        }
        if (gridOption.enabled) {
            this.gridHandler.setCoords(createdObj);
        }
        return createdObj;
    }

    addGroup = (obj: FabricObject<fabric.Group>, centered = true, loaded = false): any => {
        return obj.getObjects().map((child: FabricObject) => {
            return this.add(child, centered, loaded);
        });
    }

    addImage = (obj: FabricImage): FabricImage => {
        const { defaultOption } = this;
        const image = new Image();
        const { src, file, filters = [], ...otherOption } = obj;
        const createdObj = new fabric.Image(image, {
            src,
            file,
            ...defaultOption,
            ...otherOption,
        });
        createdObj.set({
            filters: this.imageHandler.createFilters(filters),
        });
        this.setImage(createdObj, src || file);
        return createdObj;
    }

    addSVG = (obj: FabricObject, centered = true, loaded = false) => {
        const { defaultOption } = this;
        return new Promise((resolve) => {
            const getSVGElements = (object, objects, options) => {
                const createdObj = fabric.util.groupSVGElements(objects, options);
                createdObj.set({ ...defaultOption, ...object });
                this.canvas.add(createdObj);
                this.objects = this.getObjects();
                const { onAdd, editable } = this;
                if (!editable && !(obj.superType === 'element')) {
                    createdObj.on('mousedown', this.eventHandler.objectMousedown);
                }
                if (createdObj.dbclick) {
                    createdObj.on('mousedblclick', this.eventHandler.objectMousedblclick);
                }
                if (editable && !loaded) {
                    this.centerObject(createdObj, centered);
                }
                if (!editable && createdObj.animation && createdObj.animation.autoplay) {
                    this.animationHandler.play(createdObj.id);
                }
                if (onAdd && !loaded && editable) {
                    onAdd(obj);
                }
                return createdObj;
            };
            if (obj.loadType === 'svg') {
                fabric.loadSVGFromString(obj.svg, (objects, options) => {
                    resolve(getSVGElements(obj, objects, options));
                });
            } else {
                fabric.loadSVGFromURL(obj.svg, (objects, options) => {
                    resolve(getSVGElements(obj, objects, options));
                });
            }
        });
    }

    /**
     * @description Get primary object
     * @returns {FabricObject[]}
     */
    public getObjects = (): FabricObject[] => this.canvas.getObjects().filter((obj: FabricObject) => {
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
    });

    /**
     * @description Set the image
     * @param {FabricImage} obj
     * @param {*} source
     * @returns
     */
    public setImage = (obj: FabricImage, source: any) => {
       if (!source) {
           this.loadImage(obj, null);
           obj.set('file', null);
           obj.set('src', null);
           return;
       }
       if (source instanceof File) {
            const reader = new FileReader();
            reader.onload = e => {
                this.loadImage(obj, e.target.result as string);
                obj.set('file', source);
                obj.set('src', null);
            };
            reader.readAsDataURL(source);
       } else {
            this.loadImage(obj, source);
            obj.set('file', null);
            obj.set('src', source);
       }
   }

    /**
     * @description Load the image
     * @param {FabricImage} obj
     * @param {string} src
     */
    public loadImage = (obj: FabricImage, src: string) => {
        let url = src;
        if (!url) {
            url = './images/sample/transparentBg.png';
        }
        fabric.util.loadImage(url, source => {
            if (obj.type !== 'image') {
                obj.setPatternFill({
                    source,
                    repeat: 'repeat',
                }, null);
                obj.setCoords();
                this.canvas.renderAll();
                return;
            }
            obj.setElement(source);
            obj.setCoords();
            this.canvas.renderAll();
        });
    }

    public find = (obj: FabricObject) => this.findById(obj.id)

    /**
     * @description Find object by id
     * @param {string} id
     * @returns {(FabricObject | null)}
     */
    public findById = (id: string): FabricObject | null => {
        let findObject;
        const exist = this.objects.some(obj => {
        // const exist = this.getObjects().some(obj => {
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
    }

    /**
     * @description Select object
     * @param {FabricObject} obj
     */
    public select = (obj: FabricObject) => {
        const findObject = this.find(obj);
        if (findObject) {
            this.canvas.discardActiveObject();
            this.canvas.setActiveObject(findObject);
            this.canvas.requestRenderAll();
        }
    }

    /**
     * @description Start request animation frame
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
    }

    /**
     * @description Stop request animation frame
     */
    public stopRequestAnimFrame = () => {
        this.isRequsetAnimFrame = false;
        const cancelRequestAnimFrame = (() => window.cancelAnimationFrame
        // || window.webkitCancelRequestAnimationFrame
        // || window.mozCancelRequestAnimationFrame
        // || window.oCancelRequestAnimationFrame
        // || window.msCancelRequestAnimationFrame
        || clearTimeout
        )();
        cancelRequestAnimFrame(this.requestFrame);
    }

}

export default Handler;
