import { fabric } from 'fabric';

import Handler from './Handler';
import { FabricObject } from '../utils';
import { NodeObject } from '../objects/Node';

class GridHandler {
    handler?: Handler;

    constructor(handler: Handler) {
        this.handler = handler;
    }

    /**
     * Init grid
     */
    public init = () => {
        const { gridOption } = this.handler;
        if (gridOption.enabled && gridOption.grid) {
            const width = 5000;
            const gridLength = width / gridOption.grid;
            const lineOptions = {
                stroke: '#ebebeb',
                selectable: false,
                evented: false,
                id: 'grid',
            };
            for (let i = 0; i < gridLength; i++) {
                const distance = i * gridOption.grid;
                const fhorizontal = new fabric.Line([distance, -width, distance, width], lineOptions);
                const shorizontal = new fabric.Line([distance - width, -width, distance - width, width], lineOptions);
                this.handler.canvas.add(fhorizontal);
                this.handler.canvas.add(shorizontal);
                const fvertical = new fabric.Line([-width, distance - width, width, distance - width], lineOptions);
                const svertical = new fabric.Line([-width, distance, width, distance], lineOptions);
                this.handler.canvas.add(fvertical);
                this.handler.canvas.add(svertical);
                if (i % 5 === 0) {
                    fhorizontal.set({ stroke: '#cccccc' });
                    shorizontal.set({ stroke: '#cccccc' });
                    fvertical.set({ stroke: '#cccccc' });
                    svertical.set({ stroke: '#cccccc' });
                }
            }
        }
    }

    /**
     * Set coords in grid
     * @param {(FabricObject | fabric.ActiveSelection)} target
     * @returns
     */
    public setCoords = (target: FabricObject | fabric.ActiveSelection) => {
        const { gridOption: { enabled, grid, snapToGrid } } = this.handler;
        if (enabled && grid && snapToGrid) {
            if (target.type === 'activeSelection') {
                const activeSelection = target as fabric.ActiveSelection;
                activeSelection.set({
                    left: Math.round(target.left / grid) * grid,
                    top: Math.round(target.top / grid) * grid,
                });
                activeSelection.setCoords();
                activeSelection.getObjects().forEach((obj: any) => {
                    if (obj.superType === 'node') {
                        const left = target.left + obj.left + (target.width / 2);
                        const top = target.top + obj.top + (target.height / 2);
                        this.handler.portHandler.setCoords({ ...obj, left, top });
                    }
                });
                return;
            }
            const obj = target as FabricObject;
            obj.set({
                left: Math.round(target.left / grid) * grid,
                top: Math.round(target.top / grid) * grid,
            });
            target.setCoords();
            this.handler.portHandler.setCoords(target as NodeObject);
        }
    }
}

export default GridHandler;
