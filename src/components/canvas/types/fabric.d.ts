import * as fabric from 'fabric';

declare module 'fabric' {
    export interface Element extends fabric.Rect {
        container?: HTMLDivElement;
        element: HTMLDivElement;
    }
}
