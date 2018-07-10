import { fabric } from 'fabric';
export default (mergeObjects) => {
    const fabricObjects = {
        'i-text': {
            create: ({ text, ...option }) => new fabric.IText(text, {
                ...option,
            }),
        },
        textbox: {
            create: ({ text, ...option }) => new fabric.Textbox(text, {
                ...option,
            }),
        },
        triangle: {
            create: option => new fabric.Triangle({
                ...option,
            }),
        },
        circle: {
            create: option => new fabric.Circle({
                ...option,
            }),
        },
        rect: {
            create: option => new fabric.Rect({
                ...option,
            }),
        },
        polygon: {
            create: ({ points, ...option }) => new fabric.Polygon(points, {
                ...option,
            }),
        },
        image: {
            create: ({ imgElement, ...option }) => new fabric.Image(imgElement, {
                ...option,
            }),
        },
    };
    if (mergeObjects) {
        Object.assign(fabricObjects, mergeObjects);
    }
    return fabricObjects;
};
