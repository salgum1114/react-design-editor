import Handler from './Handler';

export type TransactionType = 'add' | 'remove' | 'moved' | 'scaled' | 'rotated' | 'skewed';

class TransactionHandler {
    handler: Handler;
    redos: any[];
    undos: any[];

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
     * @returns
     */
    save = (target: any, type: TransactionType) => {
        if (!type) {
            console.warn('Must enter the transaction type');
            return;
        }
        const undo = {
            type,
        } as any;
        if (target.superType === 'node') {
            undo.target = {
                id: target.id,
                name: target.name,
                description: target.description,
                superType: target.superType,
                type: target.type,
                nodeClazz: target.nodeClazz,
                configuration: target.configuration,
                properties: {
                    left: target.left || 0,
                    top: target.top || 0,
                    iconName: target.descriptor.icon,
                },
            };
        } else if (target.superType === 'link') {
            undo.target = {
                id: target.id,
                type: target.type,
                superType: target.superType,
                fromNode: target.fromNode.id,
                fromPort: target.fromPort,
                toNode: target.toNode.id,
            };
        }
        // else if (target.type === 'activeSelection') {

        // } else {

        // }
        this.undos.push(undo);
    }

    /**
     * @description Undo transaction
     * @returns {any}
     */
    undo = () => {
        const undo = this.undos.pop();
        if (!undo) {
            return false;
        }
        const { target, type } = undo;
        if (type === 'add') {
            if (target.superType === 'link') {
                const findObject = this.handler.findById(target.id);
                this.handler.linkHandler.remove(findObject);
            } else {
                this.handler.removeById(target.id);
            }
        } else if (type === 'remove') {
            if (target.superType === 'node') {
                target.left = target.properties.left;
                target.top = target.properties.top;
            }
            this.handler.add({ ...target, id: null }, false, true);
        }
        // else if (type === 'moved') {
        // } else if (type === 'scaled') {
        // } else if (type === 'rotated') {
        // } else if (type === 'skewed') {
        // }
        this.redos.push(undo);
        return undo;
    }

    /**
     * @description Redo transaction
     * @returns {any}
     */
    redo = () => {
        const redo = this.redos.pop();
        if (!redo) {
            return false;
        }
        const { target, type } = redo;
        if (type === 'add') {
            if (target.superType === 'link') {
                this.handler.linkHandler.remove(target);
            } else {
                this.handler.removeById(target.id);
            }
            this.redos.push({
                target,
                type: 'remove',
            });
        }
        // else if (type === 'remove') {
        //     if (target.superType === 'link') {
        //     } else {
        //     }
        // } else if (type === 'moved') {
        // } else if (type === 'scaled') {
        // } else if (type === 'rotated') {
        // } else if (type === 'skewed') {
        // }
        this.undos.push(redo);
        return redo;
    }
}

export default TransactionHandler;
