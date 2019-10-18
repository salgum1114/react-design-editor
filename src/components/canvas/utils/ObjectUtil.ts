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

export const toObject = (obj: any, propertiesToInclude: string[], properties?: { [key: string]: any }) => fabric.util.object.extend(obj.callSuper('toObject'), propertiesToInclude.reduce((prev, property) => Object.assign(prev, {
    [property]: obj.get(property),
}), Object.assign({}, properties)));
