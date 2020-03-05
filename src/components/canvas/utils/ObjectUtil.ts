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
    /**
     * @description Original opacity
     * @type {number}
     */
    originOpacity?: number;
    /**
     * @description Original top position
     * @type {number}
     */
    originTop?: number;
    /**
     * @description Original left position
     * @type {number}
     */
    originLeft?: number;
    /**
     * @description Original scale X
     * @type {number}
     */
    originScaleX?: number;
    /**
     * @description Original scale Y
     * @type {number}
     */
    originScaleY?: number;
    /**
     * @description Original angle
     * @type {number}
     */
    originAngle?: number;
    /**
     * @description Original fill color
     * @type {(string | fabric.Pattern)}
     */
    originFill?: string | fabric.Pattern;
    /**
     * @description Original stroke color
     * @type {string}
     */
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
    [key: string]: any;
}

export type FabricObject<T extends any = fabric.Object> = T & FabricObjectOption;

export type FabricGroup = FabricObject<fabric.Group> & {
    /**
     * @description Object that config group
     * @type {FabricObject[]}
     */
    objects?: FabricObject[];
};

export type FabricImage = FabricObject & Omit<fabric.Image, 'filters'> & {
    /**
     * @description Image URL
     * @type {string}
     */
    src?: string;
    /**
     * @description Image File or Blob
     * @type {File}
     */
    file?: File;
    /**
     * @description Image Filter
     * @type {IFilter[]}
     */
    filters?: IFilter[];
}

export interface FabricElement extends FabricObject<fabric.Rect> {
    /**
     * @description Wrapped Element
     * @type {HTMLDivElement}
     */
    container: HTMLDivElement;
    /**
     * @description Target Element
     * @type {HTMLDivElement}
     */
    element: HTMLDivElement;
    /**
     * @description Source of Element Object
     */
    setSource: (source: any) => void;
}

export type WorkareaLayout = 'fixed' | 'responsive' | 'fullscreen';

export interface WorkareaOption {
    /**
     * @description Image URL
     * @type {string}
     */
    src?: string;
    /**
     * @description Image File or Blbo
     * @type {File}
     */
    file?: File;
    /**
     * @description Workarea Width
     * @type {number}
     */
    width?: number;
    /**
     * @description Workarea Height
     * @type {number}
     */
    height?: number;
    /**
     * @description Workarea Background Color
     * @type {string}
     */
    backgroundColor?: string;
    /**
     * @description Workarea Layout Type
     * @type {WorkareaLayout}
     */
    layout?: WorkareaLayout;
}

export type WorkareaObject = FabricImage & {
    /**
     * @description Workarea Layout Type
     * @type {WorkareaLayout}
     */
    layout?: WorkareaLayout;
    /**
     * @description Workarea Image Element
     * @type {HTMLImageElement}
     */
    _element?: HTMLImageElement;
    /**
     * @description Whether exist the element
     * @type {boolean}
     */
    isElement?: boolean;
    /**
     * @description Stored width in workarea
     * @type {number}
     */
    workareaWidth?: number;
    /**
     * @description Stored height in workarea
     * @type {number}
     */
    workareaHeight?: number;
};

export interface CanvasOption {
    /**
     * @description Unique id of Canvas
     * @type {string}
     */
    id?: string;
    /**
     * @description Indicates whether objects should remain in current stack position when selected. When false objects are brought to top and rendered as part of the selection group
     * @type {boolean}
     */
    preserveObjectStacking?: boolean;
    /**
     * @description Canvas width
     * @type {number}
     */
    width?: number;
    /**
     * @description Canvas height
     * @type {number}
     */
    height?: number;
    /**
     * @description Whether group selection should be enabled
     * @type {boolean}
     */
    selection?: boolean;
    /**
     * @description Default mouse cursor of Canvas
     * @type {string}
     */
    defaultCursor?: string;
    /**
     * @description Background color of Canvas
     * @type {(string | fabric.Pattern)}
     */
    backgroundColor?: string | fabric.Pattern;
}

export interface GridOption {
    /**
     * @description Whether should be enabled
     * @type {boolean}
     */
    enabled?: boolean;
    /**
     * @description Grid interval
     * @type {number}
     */
    grid?: number;
    /**
     * @description When had moved object, whether should adjust position on grid interval
     * @type {boolean}
     */
    snapToGrid?: boolean;
}

export interface GuidelineOption {
    /**
     * @description When have moved object, whether should show guideline
     * @type {boolean}
     */
    enabled?: boolean;
}

export interface KeyEvent {
    /**
     * @description Arrow key
     * @type {boolean}
     */
    move?: boolean;
    /**
     * @description Ctrl + A
     * @type {boolean}
     */
    all?: boolean;
    /**
     * @description Ctrl + C
     * @type {boolean}
     */
    copy?: boolean;
    /**
     * @description Ctrl + P
     * @type {boolean}
     */
    paste?: boolean;
    /**
     * @description Escape
     * @type {boolean}
     */
    esc?: boolean;
    /**
     * @description Delete key
     * @type {boolean}
     */
    del?: boolean;
    /**
     * @description When have copied object, whether should copy object option on clipboard
     * @type {boolean}
     */
    clipboard?: boolean;
    /**
     * @description Ctrl + Z, Ctrl + Y
     * @type {boolean}
     */
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

/**
 * @description toObject util
 * @param {*} obj
 * @param {string[]} propertiesToInclude
 * @param {{ [key: string]: any }} [properties]
 */
export const toObject = (obj: any, propertiesToInclude: string[], properties?: { [key: string]: any }) => fabric.util.object.extend(obj.callSuper('toObject'), propertiesToInclude.reduce((prev, property) => Object.assign(prev, {
    [property]: obj.get(property),
}), Object.assign({}, properties)));
