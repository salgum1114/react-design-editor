import { fabric } from 'fabric';

import { IFilter } from '../handlers/ImageHandler';

export type AnimationType = 'fade' | 'bounce' | 'shake' | 'scaling' | 'rotation' | 'flash' | 'none';

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
    fill?: string | fabric.Pattern;
    stroke?: string;
}

export interface LinkProperty {
    enabled?: boolean;
    type?: 'resource' | 'alarm';
    state?: 'new' | 'tab';
    dashboard?: any;
}

export interface TooltipProperty {
    enabled?: boolean;
    type?: 'resource' | 'alarm';
    template?: string;
}

export interface TriggerProperty {
    enabled?: boolean;
    type?: 'resource' | 'alarm';
    script?: string;
    effect?: 'style' | 'animation';
}

export interface FabricCanvasOption {
    wrapperEl?: HTMLElement;
}

export type FabricCanvas<T extends any = fabric.Canvas> = T & FabricCanvasOption;

export type FabricObjectOption<T extends any = fabric.IObjectOptions> = T & {
    /**
     * @description Object id
     * @type {string}
     */
    id?: string;
    /**
     * @description Parent object id
     * @type {string}
     */
    parentId?: string;
    originOpacity?: number;
    originTop?: number;
    originLeft?: number;
    originScaleX?: number;
    originScaleY?: number;
    originAngle?: number;
    originFill?: string | fabric.Pattern;
    originStroke?: string;
    /**
     * @description Object editable
     * @type {boolean}
     */
    editable?: boolean;
    /**
     * @description Object Super type
     * @type {string}
     */
    superType?: string;
    /**
     * @description
     * @type {string}
     */
    description?: string;
    /**
     * @description Animation property
     * @type {AnimationProperty}
     */
    animation?: AnimationProperty;
    /**
     * @description Anime instance
     * @type {anime.AnimeInstance}
     */
    anime?: anime.AnimeInstance;
    /**
     * @description Trigger property
     * @type {TriggerProperty}
     */
    trigger?: TriggerProperty;
    /**
     * @description Tooltip property
     * @type {TooltipProperty}
     */
    tooltip?: TooltipProperty;
    /**
     * @description Link property
     * @type {LinkProperty}
     */
    link?: LinkProperty;
    /**
     * @description Is running animation
     * @type {boolean}
     */
    animating?: boolean;
    // /**
    //  * @description Object shadow
    //  * @type {fabric.Shadow}
    //  */
    // shadow?: fabric.Shadow | string;
    /**
     * @description Object class
     * @type {string}
     */
    class?: string;
    /**
     * @description Is possible delete
     * @type {boolean}
     */
    deletable?: boolean;
    /**
     * @description Is enable double click
     * @type {boolean}
     */
    dblclick?: boolean;
    /**
     * @description Is possible clone
     * @type {boolean}
     */
    cloneable?: boolean;
    /**
     * @description Is locked object
     * @type {boolean}
     */
    locked?: boolean;
}

export type FabricObject<T extends any = fabric.Object> = T & FabricObjectOption;

export type FabricImage = FabricObject & Omit<fabric.Image, 'filters'> & {
    src?: string;
    file?: File;
    filters?: IFilter[];
}

export interface FabricElement extends FabricObject<fabric.Rect> {
    container: HTMLDivElement;
    element: HTMLDivElement;
    setSource: (source: any) => void;
}

export type WorkareaLayout = 'fixed' | 'responsive' | 'fullscreen' | string;

export interface WorkareaOption {
    src?: string;
    file?: File;
    width?: number;
    height?: number;
    backgroundColor?: string;
}

export type WorkareaObject = FabricImage & {
    layout?: WorkareaLayout;
    _element?: HTMLImageElement;
    isElement?: boolean;
    workareaWidth?: number;
    workareaHeight?: number;
};

export interface CanvasOption {
    id?: string;
    preserveObjectStacking?: boolean;
    width?: number;
    height?: number;
    selection?: boolean;
    defaultCursor?: string;
    backgroundColor?: string | fabric.Pattern;
}

export interface GridOption {
    enabled?: boolean;
    grid?: number;
    snapToGrid?: boolean;
}

export interface GuidelineOption {
    enabled?: boolean;
}

export interface KeyEvent {
    move?: boolean;
    all?: boolean;
    copy?: boolean;
    paste?: boolean;
    esc?: boolean;
    del?: boolean;
    clipboard?: boolean;
    transaction?: boolean;
}

export type InteractionMode = 'selection' | 'grab' | 'polygon' | 'line' | 'arrow' | 'link' | 'crop';

export interface FabricEvent<T extends any = Event> extends Omit<fabric.IEvent, 'e'> {
	e: T;
	target?: FabricObject;
    subTargets?: FabricObject[],
	button?: number;
	isClick?: boolean;
	pointer?: fabric.Point;
	absolutePointer?: fabric.Point;
    transform?: { corner: string, original: FabricObject, originX: string, originY: string, width: number };
}

export const toObject = (obj: any, propertiesToInclude: string[], properties?: { [key: string]: any }) => fabric.util.object.extend(obj.callSuper('toObject'), propertiesToInclude.reduce((prev, property) => Object.assign(prev, {
    [property]: obj.get(property),
}), Object.assign({}, properties)));
