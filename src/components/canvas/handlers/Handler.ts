import { fabric } from 'fabric';
import warning from 'warning';

import {
    ElementHandler,
    ImageHandler,
    ChartHandler,
    VideoHandler,
    CropHandler,
    AnimationHandler,
    ContextmenuHandler,
    TooltipHandler,
} from '.';
import { FabricObject, FabricImage } from '../utils';

export interface HandlerOptions {
    id: string;
    canvas: fabric.Canvas;
    container: HTMLDivElement;
    workarea: fabric.Image;
    objects: fabric.Object[];
    editable?: boolean;
    interactionMode: string;
    propertiesToInclude?: string[];
    [key: string]: any;

    onContext?: (el: HTMLDivElement, e: React.MouseEvent, target?: fabric.Object) => Promise<any>;
    onTooltip?: (el: HTMLDivElement, target?: fabric.Object) => Promise<any>;

    imageHandler: ImageHandler;
    chartHandler: ChartHandler;
    videoHandler: VideoHandler;
    elementHandler: ElementHandler;
    cropHandler: CropHandler;
    animationHandler: AnimationHandler;
    contextmenuHandler: ContextmenuHandler;
    tooltipHandler: TooltipHandler;
}

class Handler implements HandlerOptions {
    public id: string;
    public canvas: fabric.Canvas;
    public workarea: fabric.Image;
    public objects: fabric.Object[];
    public container: HTMLDivElement;
    public editable: boolean;
    public interactionMode: string;
    public propertiesToInclude?: string[];

    private isRequsetAnimFrame = false;
    private requestFrame: any;

    public imageHandler: ImageHandler;
    public chartHandler: ChartHandler;
    public videoHandler: VideoHandler;
    public elementHandler: ElementHandler;
    public cropHandler: CropHandler;
    public animationHandler: AnimationHandler;
    public contextmenuHandler: ContextmenuHandler;
    public tooltipHandler: TooltipHandler;

    constructor(options: HandlerOptions) {
        this.id = options.id;
        this.canvas = options.canvas;
        this.workarea = options.workarea;
        this.container = options.container;
        this.objects = options.objects;
        this.editable = options.editable;
        this.interactionMode = options.interactionMode;
        this.propertiesToInclude = options.propertiesToInclude;

        this.imageHandler = new ImageHandler(this);
        this.chartHandler = new ChartHandler(this);
        this.videoHandler = new VideoHandler(this);
        this.elementHandler = new ElementHandler(this);
        this.cropHandler = new CropHandler(this);
        this.animationHandler = new AnimationHandler(this);
        this.contextmenuHandler = new ContextmenuHandler(this, {
            onContext: options.onContext,
        });
        this.tooltipHandler = new TooltipHandler(this, {
            onTooltip: options.onTooltip,
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
