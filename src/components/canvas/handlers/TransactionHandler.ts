import { fabric } from 'fabric';

import Handler from './Handler';
import { FabricObject } from '../utils';

export type TransactionType = 'init'
| 'add'
| 'remove'
| 'moved'
| 'scaled'
| 'rotated'
| 'skewed'
| 'group'
| 'ungroup'
| 'paste'
| 'bringForward'
| 'bringToFront'
| 'sendBackwards'
| 'sendToBack'
;

export interface TransactionTransform {
    scaleX?: number;
    scaleY?: number;
    skewX?: number;
    skewY?: number;
    angle?: number;
    left?: number;
    top?: number;
    flipX?: number;
    flipY?: number;
    originX?: string;
    originY?: string;
}

export interface TransactionEvent {
    json: string;
    type: TransactionType;
}

class TransactionHandler {
    handler: Handler;
    redos: TransactionEvent[];
    undos: TransactionEvent[];
    active: boolean = false;
    state: FabricObject[] = [];

    constructor(handler: Handler) {
        this.handler = handler;
    }

    /**
     * @description Init transaction
     */
    init = () => {
        this.redos = [];
        this.undos = [];
        this.save('init');
    }

    /**
     * @description Save transaction
     * @param {TransactionType} type
     * @param {*} [canvasJSON]
     * @param {boolean} [isWorkarea=true]
     * @returns
     */
    save = (type: TransactionType, canvasJSON?: any, isWorkarea: boolean = true) => {
        if (!this.handler.keyEvent.transaction) {
            return;
        }
        try {
            if (this.state) {
                const json = JSON.stringify(this.state);
                this.undos.push({
                    type,
                    json,
                });
            }
            const { objects }: { objects: FabricObject[] } = canvasJSON || this.handler.canvas.toJSON(this.handler.propertiesToInclude);
            this.state = objects.filter(obj => {
                if (obj.id === 'workarea') {
                    return false;
                } else if (obj.id === 'grid') {
                    return false;
                }
                return true;
            });
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * @description Undo transaction
     * @returns
     */
    undo = () => {
        const undo = this.undos.pop();
        if (!undo) {
            return;
        }
        const transaction = JSON.parse(undo.json) as FabricObject[];
        this.state = transaction;
        this.active = true;
        this.handler.canvas.renderOnAddRemove = false;
        this.handler.clear();
        console.log(transaction);
        fabric.util.enlivenObjects(transaction, (elivenObjects: FabricObject[]) => {
            const { length } = this.handler.canvas._objects;
            elivenObjects.forEach((obj, index) => {
                this.handler.canvas.insertAt(obj, index + length, false);
            });
            this.handler.canvas.renderOnAddRemove = true;
            this.active = false;
            this.handler.canvas.renderAll();
            console.log(this.handler.canvas.getObjects());
        }, null);
    }

    /**
     * @description Redo transaction
     * @returns
     */
    redo = () => {
        // const redo = this.redos.pop();
        // if (!redo) {
        //     return null;
        // }
        // const { target, type, originTransform } = redo;
        // this.active = true;
        // switch (type) {
        //     case 'add':
        //         this.handler.add(target, false, true);
        //         break;
        //     case 'remove':
        //         this.handler.removeById(target.id);
        //         break;
        //     case 'moved':
        //     case 'scaled':
        //     case 'rotated':
        //         this.setModifiedTransform(redo, target, originTransform);
        //         break;
        //     case 'group':
        //         redo.target = this.handler.toGroup(target);
        //         break;
        //     case 'activeSelection':
        //         redo.target = this.handler.toActiveSelection(target);
        //         break;
        // }
        // this.active = false;
        // this.undos.push(redo);
        // return redo;
    }
}

export default TransactionHandler;
