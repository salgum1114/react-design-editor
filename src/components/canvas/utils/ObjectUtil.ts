import { fabric } from 'fabric';
import { Pattern } from 'fabric/fabric-impl';

export type AnimationType = 'fade' | 'bounce' | 'shake' | 'scaling' | 'rotation' | 'flash' | 'none';

export interface AnimationProperty {
    delay?: number;
    duration?: number;
    autoplay?: boolean;
    loop?: boolean;
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

export type FabricObject<T extends any = fabric.Object> = T & {
    id?: string;
    originOpacity?: number;
    originTop?: number;
    originLeft?: number;
    originScaleX?: number;
    originScaleY?: number;
    originAngle?: number;
    originFill?: string | Pattern;
    originStroke?: string;
    editable?: boolean;
    superType?: string;
    /**
     * Animation
     */
    animation?: AnimationProperty;
    anime?: anime.AnimeInstance;
    /**
     * Trigger
     */
    trigger?: TriggerProperty;
    /**
     * Tooltip
     */
    tooltip?: TooltipProperty;
    /**
     * Link
     */
    link?: LinkProperty;
}

export interface FabricImage extends FabricObject<fabric.Image> {
    src?: string;
    file?: File;
}

export interface FabricElement extends FabricObject<fabric.Rect> {
    container: HTMLDivElement;
    element: HTMLDivElement;
    setSource: (source: any) => void;
}

export type WorkareaLayout = 'fixed' | 'responsive' | 'fullscreen' | string;

export interface WorkareaOption {
    width?: number;
    height?: number;
    workareaWidth?: number;
    workareaHeight?: number;
    lockScalingX?: boolean;
    lockScalingY: boolean;
    scaleX?: number;
    scaleY?: number;
    backgroundColor?: string;
    hasBorders?: boolean;
    hasControls?: boolean;
    selectable?: boolean;
    lockMovementX?: boolean;
    lockMovementY?: boolean;
    hoverCursor?: string;
    name?: string;
    id?: string;
    type?: string;
    layout?: WorkareaLayout;
    link?: LinkProperty;
    tooltip?: TooltipProperty;
    isElement?: boolean;
}

export interface WorkareaObject extends FabricObject<fabric.Image> {
    layout?: WorkareaLayout;
    _element?: HTMLImageElement;
    isElement?: boolean;
    workareaWidth?: number;
    workareaHeight?: number;
    src?: string;
    file?: File;
}

export interface CanvasOption {
    preserveObjectStacking?: boolean;
    width?: number;
    height?: number;
    selection?: boolean;
    defaultCursor?: string;
    backgroundColor?: string;
}

export const toObject = (obj: any, propertiesToInclude: string[], properties?: { [key: string]: any }) => fabric.util.object.extend(obj.callSuper('toObject'), propertiesToInclude.reduce((prev, property) => Object.assign(prev, {
    [property]: obj.get(property),
}), Object.assign({}, properties)));
