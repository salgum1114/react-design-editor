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
} from '.';
import { FabricObject, FabricImage, WorkareaObject, WorkareaOption, InteractionMode, CanvasOption } from '../utils';

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
    [key: string]: any;

    onContext?: (el: HTMLDivElement, e: React.MouseEvent, target?: fabric.Object) => Promise<any>;
    onTooltip?: (el: HTMLDivElement, target?: fabric.Object) => Promise<any>;
    onZoom?: (zoomRatio: number) => void;

    imageHandler: ImageHandler;
    chartHandler: ChartHandler;
    elementHandler: ElementHandler;
    cropHandler: CropHandler;
    animationHandler: AnimationHandler;
    contextmenuHandler: ContextmenuHandler;
    tooltipHandler: TooltipHandler;
    zoomHandler: ZoomHandler;
    workareaHandler: WorkareaHandler;
    modeHandler: ModeHandler;
    transactionHandler: TransactionHandler;
}

class Handler {
    public id: string;
    public canvas: fabric.Canvas;
    public workarea: WorkareaObject;
    public objects: fabric.Object[];
    public container: HTMLDivElement;
    public editable: boolean;
    public interactionMode: InteractionMode;
    public propertiesToInclude?: string[];
    public minZoom: number;
    public maxZoom: number;
    public workareaOption: WorkareaOption;
    public canvasOption?: CanvasOption;

    private isRequsetAnimFrame = false;
    private requestFrame: any;

    public onContext?: (el: HTMLDivElement, e: React.MouseEvent, target?: fabric.Object) => Promise<any>;
    public onTooltip?: (el: HTMLDivElement, target?: fabric.Object) => Promise<any>;
    public onZoom?: (zoomRatio: number) => void;

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
     * @param {fabric.Image} obj
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
     * @param {fabric.Object} obj
     * @param {string} src
     */
    public loadImage = (obj: fabric.Image, src: string) => {
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

    /**
     * @description Find object by id
     * @param {string} id
     * @returns {(FabricObject | null)}
     */
    public findById = (id: string): FabricObject | null => {
        let findObject;
        // const exist = this.objects.some(obj => {
        const exist = this.getObjects().some(obj => {
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
