import { fabric } from 'fabric';
import isEqual from 'lodash/isEqual';

import Handler from './Handler';

export type GrayscaleModeType = 'average' | 'luminosity' | 'lightness';

export interface RemoveColorFilter {
    color?: string;
    distance?: number;
    fragmentSource?: any;
    useAlpahe?: any;
}

export interface BlendColorFilter {
    color?: string;
    mode?: string;
    alpha?: number;
}

export interface GammaFilter {
    gamma?: number[];
}

export interface BlendImageFilter {
    image?: fabric.Image;
    mode?: string;
    alpha?: number;
}

export interface HueRotationFilter {
    rotation?: number;
}

export type ResizeType = 'bilinear' | 'hermite' | 'sliceHack' | 'lanczos';

export interface ResizeFilter {
    resizeType?: ResizeType;
    scaleX?: number;
    scaleY?: number;
    lanczosLobes?: number;
}

export interface TintFilter {
    color?: string;
    opacity?: number;
}

export interface MaskFilter {
    mask?: fabric.Image;
    /**
     * Rgb channel (0, 1, 2 or 3)
     * @default 0
     */
    channel: number;
}

export interface MultiplyFilter {
    /**
     * Color to multiply the image pixels with
     * @default #000000
     */
    color: string;
}

export interface GradientTransparencyFilter {
    /** @default 100 */
    threshold?: number;
}

export interface ColorMatrixFilter {
    /** Filter matrix */
    matrix?: number[];
}

export interface RemoveWhiteFilter {
    /** @default 30 */
    threshold?: number;
    /** @default 20 */
    distance?: number;
}

export type ValuesOf<T extends any[]>= T[number];

export interface IFilter {
    type: typeof FILTER_TYPES[number];
    [key: string]: any;
}

export const FILTER_TYPES = [
    'grayscale', 'invert', 'remove-color', 'sepia', 'brownie',
    'brightness', 'contrast', 'saturation', 'noise', 'vintage',
    'pixelate', 'blur', 'sharpen', 'emboss', 'technicolor',
    'polaroid', 'blend-color', 'gamma', 'kodachrome',
    'blackwhite', 'blend-image', 'hue', 'resize',
    'tint', 'mask', 'multiply', 'sepia2',
];

export const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : false;

const SHARPEN_MATRIX = [0, -1, 0, -1, 5, -1, 0, -1, 0];
const EMBOSS_MATRIX = [1, 1, 1, 1, 0.7, -1, -1, -1, -1];

/**
 * @description Image Handler
 * @author salgum1114
 * @date 2019-09-01
 * @class ImageHandler
 * @extends {Handler}
 */
class ImageHandler {
    handler?: Handler;

    constructor(handler: Handler) {
        this.handler = handler;
    }

    /**
     * @description Create filter by type
     * @param {IFilter} filter
     */
    public createFilter = (filter: IFilter) => {
        const { type: filterType, ...other } = filter;
        const type = filterType.toLowerCase();
        if (type === 'grayscale') {
            return new fabric.Image.filters.Grayscale(other);
        } else if (type === 'invert') {
            return new fabric.Image.filters.Invert();
        // } else if (type === 'remove-color') {
        //     return new fabric.Image.filters.RemoveColor(other);
        } else if (type === 'sepia') {
            return new fabric.Image.filters.Sepia();
        // } else if (type === 'brownie') {
        //     return new fabric.Image.filters.Brownie();
        } else if (type === 'brightness') {
            return new fabric.Image.filters.Brightness({ brightness: other.brightness });
        } else if (type === 'contrast') {
            return new fabric.Image.filters.Contrast(other);
        } else if (type === 'saturation') {
            return new fabric.Image.filters.Saturation(other);
        } else if (type === 'noise') {
            return new fabric.Image.filters.Noise({ noise: other.noise });
        // } else if (type === 'vintage') {
        //     return new fabric.Image.filters.Vintage();
        } else if (type === 'pixelate') {
            return new fabric.Image.filters.Pixelate(other);
        // } else if (type === 'blur') {
        //     return new fabric.Image.filters.Blur(other);
        } else if (type === 'sharpen') {
            return new fabric.Image.filters.Convolute({
                matrix: SHARPEN_MATRIX,
            });
        } else if (type === 'emboss') {
            return new fabric.Image.filters.Convolute({
                matrix: EMBOSS_MATRIX,
            });
        // } else if (type === 'technicolor') {
        //     return new fabric.Image.filters.Technicolor();
        // } else if (type === 'polaroid') {
        //     return new fabric.Image.filters.Polaroid();
        } else if (type === 'blend-color') {
            return new fabric.Image.filters.BlendColor(other);
        // } else if (type === 'gamma') {
        //     return new fabric.Image.filters.Gamma(other);
        // } else if (type === 'kodachrome') {
        //     return new fabric.Image.filters.Kodachrome();
        // } else if (type === 'blackwhite') {
        //     return new fabric.Image.filters.BlackWhite();
        } else if (type === 'blend-image') {
            return new fabric.Image.filters.BlendImage(other);
        // } else if (type === 'hue') {
        //     return new fabric.Image.filters.HueRotation(other);
        } else if (type === 'resize') {
            return new fabric.Image.filters.Resize(other);
        } else if (type === 'tint') {
            return new fabric.Image.filters.Tint(other);
        } else if (type === 'mask') {
            return new fabric.Image.filters.Mask({
                channel: other.channel,
                mask: other.mask,
            });
        } else if (type === 'multiply') {
            return new fabric.Image.filters.Multiply({
                color: other.color,
            });
        } else if (type === 'sepia2') {
            return new fabric.Image.filters.Sepia2(other);
        }
        return false;
    }

    /**
     * @description Create filter by types
     * @param {IFilter[]} filters
     */
    public createFilters = (filters: IFilter[]) => {
        const createdFilters = filters.reduce((prev, filter) => {
            let type = filter.type;
            if (type.toLowerCase() === 'convolute' && isEqual(filter.matrix, SHARPEN_MATRIX)) {
                type = 'sharpen';
            } else if (type.toLowerCase() === 'convolute' && isEqual(filter.matrix, EMBOSS_MATRIX)) {
                type = 'emboss';
            }
            const findIndex = FILTER_TYPES.findIndex(filterType => type.toLowerCase() === filterType);
            if (findIndex > -1) {
                prev[findIndex] = this.createFilter({
                    ...filter,
                    type,
                });
            }
            return prev;
        }, []);
        return createdFilters;
    }

    /**
     * @description Apply filter by type
     * @param {string} type
     * @param {*} [value]
     * @param {fabric.Image} [imageObj]
     */
    public applyFilterByType = (type: string, apply = true, value?: any, imageObj?: fabric.Image): void => {
        const obj = imageObj || this.handler.canvas.getActiveObject() as any;
        const findIndex = FILTER_TYPES.findIndex(ft => ft === type);
        if (obj.filters && findIndex > -1) {
            if (apply) {
                obj.filters[findIndex] = this.createFilter({
                    type,
                    ...value,
                });
                obj.applyFilters();
            } else {
                obj.filters[findIndex] = false;
                obj.applyFilters();
            }
            this.handler.canvas.requestRenderAll();
        }
    }

    /**
     * @description Apply filter in image
     * @param {fabric.Image} [imageObj]
     * @param {number} index
     * @param {fabric.IBaseFilter} filter
     */
    public applyFilter = (index: number, filter: fabric.IBaseFilter | boolean, imageObj?: fabric.Image): void => {
        const obj = imageObj || this.handler.canvas.getActiveObject() as any;
        if (obj.filters) {
            obj.filters[index] = filter;
            obj.applyFilters();
            this.handler.canvas.requestRenderAll();
        }
    }

    /**
     * @description Apply filter value in image
     * @param {fabric.Image} [imageObj]
     * @param {number} index
     * @param {string} prop
     * @param {any} value
     */
    public applyFilterValue = (index: number, prop: string, value: any, imageObj?: fabric.Image): void => {
        const obj = imageObj || this.handler.canvas.getActiveObject() as fabric.Image;
        if (obj.filters) {
            const filter = obj.filters[index];
            if (filter) {
                filter.setOptions({
                    [prop]: value,
                });
                obj.applyFilters();
                this.handler.canvas.requestRenderAll();
            }
        }
    }

    /**
     * @description Apply grayscale in image
     * @param {fabric.Image} [imageObj]
     * @param {boolean} [grayscale=false]
     * @param {GrayscaleModeType} [value]
     */
    public applyGrayscale = (grayscale = false, value?: GrayscaleModeType, imageObj?: fabric.Image): void => {
        this.applyFilter(0, grayscale && new fabric.Image.filters.Grayscale(value ? {
            mode: value,
        } : undefined), imageObj);
    }

    /**
     * @description Apply invert in image
     * @param {fabric.Image} [imageObj]
     * @param {boolean} [invert=false]
     */
    public applyInvert = (invert = false, imageObj?: fabric.Image): void => {
        this.applyFilter(1, invert && new fabric.Image.filters.Invert(), imageObj);
    }

    /**
     * @description Apply remove color in image
     * @param {fabric.Image} [imageObj]
     * @param {boolean} [removeColor=false]
     * @param {RemoveColorFilter} [value]
     */
    // public applyRemoveColor = (removeColor = false, value?: RemoveColorFilter, imageObj?: fabric.Image): void => {
    //     this.applyFilter(2, removeColor && new fabric.Image.filters.RemoveColor(value), imageObj);
    // }

    /**
     * @description Apply sepia in image
     * @param {fabric.Image} [imageObj]
     * @param {boolean} [sepia=false]
     */
    public applySepia = (sepia = false, imageObj?: fabric.Image): void => {
        this.applyFilter(3, sepia && new fabric.Image.filters.Sepia(), imageObj);
    }

    /**
     * @description Apply brownie in image
     * @param {boolean} [brownie=false]
     * @param {fabric.Image} [imageObj]
     */
    // public applyBrownie = (brownie = false, imageObj?: fabric.Image): void => {
    //     this.applyFilter(4, brownie && new fabric.Image.filters.Brownie(), imageObj);
    // }

    /**
     * @description Apply brightness in image
     * @param {boolean} [brightness=false]
     * @param {number} [value]
     * @param {fabric.Image} [imageObj]
     */
    public applyBrightness = (brightness = false, value?: number, imageObj?: fabric.Image): void => {
        this.applyFilter(5, brightness && new fabric.Image.filters.Brightness(value ? {
            brightness: value,
        } : undefined), imageObj);
    }

    /**
     * @description Apply contrast in image
     * @param {boolean} [contrast=false]
     * @param {number} [value]
     * @param {fabric.Image} [imageObj]
     */
    public applyContrast = (contrast = false, value?: number, imageObj?: fabric.Image): void => {
        this.applyFilter(6, contrast && new fabric.Image.filters.Contrast(value ? {
            contrast: value,
        } : undefined), imageObj);
    }

    /**
     * @description Apply saturation in image
     * @param {boolean} [saturation=false]
     * @param {number} [value]
     * @param {fabric.Image} [imageObj]
     */
    public applySaturation = (saturation = false, value?: number, imageObj?: fabric.Image): void => {
        this.applyFilter(7, saturation && new fabric.Image.filters.Saturation(value ? {
            saturation: value,
        } : undefined), imageObj);
    }

    /**
     * @description Apply noise in image
     * @param {boolean} [noise=false]
     * @param {number} [value]
     * @param {fabric.Image} [imageObj]
     */
    public applyNoise = (noise = false, value?: number, imageObj?: fabric.Image): void => {
        this.applyFilter(8, noise && new fabric.Image.filters.Noise(value ? {
            noise: value,
        } : undefined), imageObj);
    }

    /**
     * @description Apply vintage in image
     * @param {boolean} [vintage=false]
     * @param {fabric.Image} [imageObj]
     */
    // public applyVintage = (vintage = false, imageObj?: fabric.Image): void => {
    //     this.applyFilter(9, vintage && new fabric.Image.filters.Vintage(), imageObj);
    // }

    /**
     * @description Apply pixelate in image
     * @param {boolean} [pixelate=false]
     * @param {number} [value]
     * @param {fabric.Image} [imageObj]
     */
    public applyPixelate = (pixelate = false, value?: number, imageObj?: fabric.Image): void => {
        this.applyFilter(10, pixelate && new fabric.Image.filters.Pixelate(value ? {
            blocksize: value,
        } : undefined), imageObj);
    }

    /**
     * @description Apply blur in image
     * @param {boolean} [blur=false]
     * @param {number} [value]
     * @param {fabric.Image} imageObj
     */
    // public applyBlur = (blur = false, value?: number, imageObj?: fabric.Image): void => {
    //     this.applyFilter(11, blur && new fabric.Image.filters.Blur(value ? {
    //         value,
    //     } : undefined), imageObj);
    // }

    /**
     * @description Apply sharpen in image
     * @param {boolean} [sharpen=false]
     * @param {number[]} [value=[0, -1,  0, -1,  5, -1, 0, -1,  0]]
     * @param {fabric.Image} [imageObj]
     */
    public applySharpen = (sharpen = false, value: number[] = SHARPEN_MATRIX, imageObj?: fabric.Image): void => {
        this.applyFilter(12, sharpen && new fabric.Image.filters.Convolute(value ? {
            matrix: value,
        } : undefined), imageObj);
    }

    /**
     * @description Apply emboss in image
     * @param {boolean} [emboss=false]
     * @param {number[]} [value=[1, 1, 1, 1, 0.7, -1, -1, -1, -1]]
     * @param {fabric.Image} [imageObj]
     */
    public applyEmboss = (emboss = false, value: number[] = EMBOSS_MATRIX, imageObj?: fabric.Image): void => {
        this.applyFilter(13, emboss && new fabric.Image.filters.Convolute(value ? {
            matrix: value,
        } : undefined), imageObj);
    }

    /**
     * @description Apply technicolor in image
     * @param {boolean} [technicolor=false]
     * @param {fabric.Image} [imageObj]
     */
    // public applyTechnicolor = (technicolor = false, imageObj?: fabric.Image): void => {
    //     this.applyFilter(14, technicolor && new fabric.Image.filters.Technicolor(), imageObj);
    // }

    /**
     * @description Apply polaroid in image
     * @param {boolean} [polaroid=false]
     * @param {fabric.Image} [imageObj]
     */
    // public applyPolaroid = (polaroid = false, imageObj?: fabric.Image): void => {
    //     this.applyFilter(15, polaroid && new fabric.Image.filters.Polaroid(), imageObj);
    // }

    /**
     * @description Apply blend color in image
     * @param {boolean} [blend=false]
     * @param {BlendColorFilter} [value]
     * @param {fabric.Image} [imageObj]
     */
    public applyBlendColor = (blend = false, value?: BlendColorFilter, imageObj?: fabric.Image): void => {
        this.applyFilter(16, blend && new fabric.Image.filters.BlendColor(value), imageObj);
    }

    /**
     * @description Apply gamma in image
     * @param {boolean} [gamma=false]
     * @param {GammaFilter} [value]
     * @param {fabric.Image} [imageObj]
     */
    // public applyGamma = (gamma = false, value?: GammaFilter, imageObj?: fabric.Image): void => {
    //     this.applyFilter(17, gamma && new fabric.Image.filters.Gamma(value), imageObj);
    // }

    /**
     * @description Apply kodachrome in image
     * @param {boolean} [kodachrome=false]
     * @param {fabric.Image} [imageObj]
     */
    // public applyKodachrome = (kodachrome = false, imageObj?: fabric.Image): void => {
    //     this.applyFilter(18, kodachrome && new fabric.Image.filters.Kodachrome(), imageObj);
    // }

    /**
     * @description Apply black white in image
     * @param {boolean} [blackWhite=false]
     * @param {fabric.Image} [imageObj]
     */
    // public applyBlackWhite = (blackWhite = false, imageObj?: fabric.Image): void => {
    //     this.applyFilter(19, blackWhite && new fabric.Image.filters.BlackWhite(), imageObj);
    // }

    /**
     * @description Apply blend image in image
     * @param {boolean} [blendImage=false]
     * @param {BlendImageFilter} value
     * @param {fabric.Image} [imageObj]
     */
    public applyBlendImage = (blendImage = false, value?: BlendImageFilter, imageObj?: fabric.Image): void => {
        this.applyFilter(20, blendImage && new fabric.Image.filters.BlendImage(value), imageObj);
    }

    /**
     * @description Apply hue rotation in image
     * @param {boolean} [hue=false]
     * @param {HueRotationFilter} [value]
     * @param {fabric.Image} [imageObj]
     */
    // public applyHue = (hue = false, value?: HueRotationFilter, imageObj?: fabric.Image): void => {
    //     this.applyFilter(21, hue && new fabric.Image.filters.HueRotation(value ? {
    //         rotation: value,
    //     } : undefined), imageObj);
    // }

    /**
     * @description Apply resize in image
     * @param {boolean} [resize=false]
     * @param {ResizeFilter} [value]
     * @param {fabric.Image} [imageObj]
     */
    public applyResize = (resize = false, value?: ResizeFilter, imageObj?: fabric.Image): void => {
        this.applyFilter(22, resize && new fabric.Image.filters.Resize(value), imageObj);
    }

    /**
     * @description Apply tint in image
     * @param {boolean} [tint=false]
     * @param {TintFilter} [value]
     * @param {fabric.Image} [imageObj]
     */
    public applyTint = (tint = false, value?: TintFilter, imageObj?: fabric.Image): void => {
        this.applyFilter(23, tint && new fabric.Image.filters.Tint(value), imageObj);
    }

    /**
     * @description Apply mask in image
     * @param {boolean} [mask=false]
     * @param {MaskFilter} [value]
     * @param {fabric.Image} [imageObj]
     */
    public applyMask = (mask = false, value?: MaskFilter, imageObj?: fabric.Image): void => {
        this.applyFilter(24, mask && new fabric.Image.filters.Mask(value), imageObj);
    }

    /**
     * @description Apply multiply in image
     * @param {boolean} [multiply=false]
     * @param {MultiplyFilter} [value]
     * @param {fabric.Image} [imageObj]
     */
    public applyMultiply = (multiply = false, value?: MultiplyFilter, imageObj?: fabric.Image): void => {
        this.applyFilter(25, multiply && new fabric.Image.filters.Multiply(value), imageObj);
    }

    /**
     * @description Apply sepia2 in image
     * @param {boolean} [sepia2=false]
     * @param {fabric.Image} [imageObj]
     */
    public applySepia2 = (sepia2 = false, imageObj?: fabric.Image): void => {
        this.applyFilter(26, sepia2 && new fabric.Image.filters.Sepia2(), imageObj);
    }

    /**
     * @description Apply gradient transparency in image
     * @param {boolean} [gradientTransparency=false]
     * @param {GradientTransparencyFilter} [value]
     * @param {fabric.Image} [imageObj]
     */
    public applyGradientTransparency = (gradientTransparency = false, value?: GradientTransparencyFilter, imageObj?: fabric.Image): void => {
        this.applyFilter(27, gradientTransparency && new fabric.Image.filters.GradientTransparency(value), imageObj);
    }

    /**
     * @description Apply color matrix in image
     * @param {boolean} [colorMatrix=false]
     * @param {ColorMatrixFilter} [value]
     * @param {fabric.Image} [imageObj]
     */
    public applyColorMatrix = (colorMatrix = false, value?: ColorMatrixFilter, imageObj?: fabric.Image): void => {
        this.applyFilter(28, colorMatrix && new fabric.Image.filters.ColorMatrix(value), imageObj);
    }

    /**
     * @description Apply remove white in image
     * @param {boolean} [removeWhite=false]
     * @param {RemoveWhiteFilter} [value]
     * @param {fabric.Image} [imageObj]
     */
    public applyRemoveWhite = (removeWhite = false, value?: RemoveWhiteFilter, imageObj?: fabric.Image): void => {
        this.applyFilter(29, removeWhite && new fabric.Image.filters.RemoveWhite(value), imageObj);
    }
}

export default ImageHandler;
