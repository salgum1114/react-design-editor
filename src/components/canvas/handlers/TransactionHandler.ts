import Handler from './Handler';
import { FabricObject, FabricObjectOption } from '../utils';

export type TransactionType = 'add'
| 'remove'
| 'moved'
| 'scaled'
| 'rotated'
| 'skewed'
| 'group'
| 'activeSelection'
;

export interface TransactionEvent {
    target: FabricObject;
    original?: FabricObjectOption;
    type: TransactionType;
}

class TransactionHandler {
    handler: Handler;
    redos: TransactionEvent[];
    undos: TransactionEvent[];

    constructor(handler: Handler) {
        this.handler = handler;
    }

    /**
     * @description Init transaction
     */
    init = () => {
        this.redos = [];
        this.undos = [];
    }

    /**
     * @description Save transaction
     * @param {FabricObject} target
     * @param {TransactionType} type
     * @param {FabricObjectOption} original
     * @returns
     */
    save = (target: FabricObject, type: TransactionType, original?: FabricObjectOption) => {
        if (!type) {
            console.warn('Must enter the transaction type');
            return;
        }
        const undo = {
            type,
            target,
            original,
        } as TransactionEvent;
        console.log(target.type);
        if (target.type === 'group') {
        } else if (target.type === 'activeSelection') {
        }
        // if (target.superType === 'node') {
        //     undo.target = {
        //         id: target.id,
        //         name: target.name,
        //         description: target.description,
        //         superType: target.superType,
        //         type: target.type,
        //         nodeClazz: target.nodeClazz,
        //         configuration: target.configuration,
        //         properties: {
        //             left: target.left || 0,
        //             top: target.top || 0,
        //             iconName: target.descriptor.icon,
        //         },
        //     };
        // } else if (target.superType === 'link') {
        //     undo.target = {
        //         id: target.id,
        //         type: target.type,
        //         superType: target.superType,
        //         fromNode: target.fromNode.id,
        //         fromPort: target.fromPort,
        //         toNode: target.toNode.id,
        //     };
        // } else if (target.type === 'activeSelection') {

        // } else {

        // }
        this.undos.push(undo);
    }

    /**
     * @description Undo transaction
     * @returns
     */
    undo = () => {
        const undo = this.undos.pop();
        if (!undo) {
            return null;
        }
        const { target, type, original } = undo;
        // console.log(type, target.type);
        switch (type) {
            case 'add':
                this.handler.removeById(target.id, false);
                break;
            case 'remove':
                this.handler.add(target, false, true, false);
                break;
            case 'moved':
            case 'scaled':
            case 'rotated':
                this.setModifiedTransform(undo, target, original);
                break;
            case 'group':
                undo.target = this.handler.toActiveSelection(target, false);
                break;
            case 'activeSelection':
                undo.target = this.handler.toGroup(target, false);
                break;
        }
        // console.log(undo.type, undo.target.type);
        this.redos.push(undo);
        return undo;
    }

    /**
     * @description Redo transaction
     * @returns
     */
    redo = () => {
        const redo = this.redos.pop();
        if (!redo) {
            return null;
        }
        const { target, type, original } = redo;
        // console.log(type, target.type);
        switch (type) {
            case 'add':
                this.handler.add(target, false, true, false);
                break;
            case 'remove':
                this.handler.removeById(target.id, false);
                break;
            case 'moved':
            case 'scaled':
            case 'rotated':
                this.setModifiedTransform(redo, target, original);
                break;
            case 'group':
                redo.target = this.handler.toGroup(target, false);
                break;
            case 'activeSelection':
                redo.target = this.handler.toActiveSelection(target, false);
                break;
        }
        this.undos.push(redo);
        // console.log(this.undos, this.redos);
        return redo;
    }

    setModifiedTransform = (transaction: TransactionEvent, target: FabricObjectOption, original: FabricObjectOption) => {
        const findObj = this.handler.findOriginById(target.id);
        if (findObj) {
            transaction.original = findObj.toObject(this.handler.propertiesToInclude);
            this.handler.setByPartial(findObj, original);
            transaction.target = findObj.toObject(this.handler.propertiesToInclude);
        }
    }
}

export default TransactionHandler;
