import { fabric } from 'fabric';

export const toObject = (obj: any, propertiesToInclude: string[], properties?: { [key: string]: any }) => fabric.util.object.extend(obj.callSuper('toObject'), propertiesToInclude.reduce((prev, property) => Object.assign(prev, {
    [property]: obj.get(property),
}), Object.assign({}, properties)));
