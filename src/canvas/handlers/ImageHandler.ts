import * as fabric from 'fabric';
import { isEqual } from 'lodash-es';
import Handler from './Handler';

export type GrayscaleModeType = 'average' | 'luminosity' | 'lightness';

export interface RemoveColorFilter {
	color?: string;
	distance?: number;
	fragmentSource?: any;
	useAlpha?: any;
	useAlpahe?: any;
}

type BlendColorMode =
	| 'multiply'
	| 'add'
	| 'difference'
	| 'screen'
	| 'subtract'
	| 'darken'
	| 'lighten'
	| 'overlay'
	| 'exclusion'
	| 'tint';

export interface BlendColorFilter {
	color?: string;
	mode?: BlendColorMode;
	alpha?: number;
}

export interface GammaFilter {
	gamma?: number[];
}

export interface BlendImageFilter {
	image?: fabric.Image;
	mode?: 'multiply' | 'mask';
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

export type ValuesOf<T extends any[]> = T[number];

export interface IFilter {
	type: (typeof FILTER_TYPES)[number];
	[key: string]: any;
}

export const FILTER_TYPES = [
	'grayscale',
	'invert',
	'remove-color',
	'sepia',
	'brownie',
	'brightness',
	'contrast',
	'saturation',
	'noise',
	'vintage',
	'pixelate',
	'blur',
	'sharpen',
	'emboss',
	'technicolor',
	'polaroid',
	'blend-color',
	'gamma',
	'kodachrome',
	'blackwhite',
	'blend-image',
	'hue',
	'resize',
	'tint',
	'mask',
	'multiply',
	'sepia2',
	'gradient-transparency',
	'color-matrix',
	'remove-white',
];

export const capitalize = (str: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : false);

const SHARPEN_MATRIX = [0, -1, 0, -1, 5, -1, 0, -1, 0];
const EMBOSS_MATRIX = [1, 1, 1, 1, 0.7, -1, -1, -1, -1];
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const normalizeFilterType = (type: string) => {
	switch (type.toLowerCase()) {
		case 'remove-color':
		case 'removecolor':
			return 'remove-color';
		case 'blend-color':
		case 'blendcolor':
			return 'blend-color';
		case 'blend-image':
		case 'blendimage':
			return 'blend-image';
		case 'gradient-transparency':
		case 'gradienttransparency':
			return 'gradient-transparency';
		case 'color-matrix':
		case 'colormatrix':
			return 'color-matrix';
		case 'remove-white':
		case 'removewhite':
			return 'remove-white';
		default:
			return type.toLowerCase();
	}
};

/**
 * Image Handler
 * @author salgum1114
 * @date 2019-09-01
 * @class ImageHandler
 * @implements {IBaseHandler}
 */
class ImageHandler {
	handler: Handler;

	constructor(handler: Handler) {
		this.handler = handler;
	}

	private createBlendColorFilter(value?: BlendColorFilter) {
		return new fabric.filters.BlendColor({
			color: value?.color ?? '#000000',
			mode: value?.mode ?? 'multiply',
			alpha: value?.alpha ?? 1,
		});
	}

	private createBlendImageFilter(value?: BlendImageFilter) {
		if (!value?.image) {
			return false;
		}
		return new fabric.filters.BlendImage({
			image: value.image,
			mode: value.mode ?? 'multiply',
			alpha: value.alpha ?? 1,
		});
	}

	private createTintFilter(value?: TintFilter) {
		return this.createBlendColorFilter({
			color: value?.color ?? '#000000',
			mode: 'tint',
			alpha: clamp01(value?.opacity ?? 1),
		});
	}

	private createMaskFilter(value?: MaskFilter) {
		return this.createBlendImageFilter({
			image: value?.mask,
			mode: 'mask',
			alpha: 1,
		});
	}

	private createMultiplyFilter(value?: MultiplyFilter) {
		return this.createBlendColorFilter({
			color: value?.color ?? '#000000',
			mode: 'multiply',
			alpha: 1,
		});
	}

	private createSepia2Filter() {
		return new fabric.filters.Brownie();
	}

	private createGradientTransparencyFilter() {
		// Fabric 6 removed GradientTransparency and does not expose a native equivalent.
		return false;
	}

	private createRemoveWhiteFilter(value?: RemoveWhiteFilter) {
		return new fabric.filters.RemoveColor({
			color: '#FFFFFF',
			distance: clamp01(Math.max(value?.threshold ?? 30, value?.distance ?? 20) / 255),
			useAlpha: true,
		});
	}

	/**
	 * Create filter by type
	 * @param {IFilter} filter
	 */
	public createFilter = (filter: IFilter) => {
		const { type: filterType, ...other } = filter;
		const type = normalizeFilterType(filterType);
		if (type === 'grayscale') {
			return new fabric.filters.Grayscale(other);
		} else if (type === 'invert') {
			return new fabric.filters.Invert();
		} else if (type === 'remove-color') {
			return new fabric.filters.RemoveColor(other);
		} else if (type === 'sepia') {
			return new fabric.filters.Sepia();
		} else if (type === 'brownie') {
			return new fabric.filters.Brownie();
		} else if (type === 'brightness') {
			return new fabric.filters.Brightness({ brightness: other.brightness });
		} else if (type === 'contrast') {
			return new fabric.filters.Contrast(other);
		} else if (type === 'saturation') {
			return new fabric.filters.Saturation(other);
		} else if (type === 'noise') {
			return new fabric.filters.Noise({ noise: other.noise });
			// } else if (type === 'vintage') {
			//     return new fabric.filters.Vintage();
		} else if (type === 'pixelate') {
			return new fabric.filters.Pixelate(other);
			// } else if (type === 'blur') {
			//     return new fabric.filters.Blur(other);
		} else if (type === 'sharpen') {
			return new fabric.filters.Convolute({
				matrix: SHARPEN_MATRIX,
			});
		} else if (type === 'emboss') {
			return new fabric.filters.Convolute({
				matrix: EMBOSS_MATRIX,
			});
			// } else if (type === 'technicolor') {
			//     return new fabric.filters.Technicolor();
			// } else if (type === 'polaroid') {
			//     return new fabric.filters.Polaroid();
		} else if (type === 'blend-color') {
			return this.createBlendColorFilter(other as BlendColorFilter);
			// } else if (type === 'gamma') {
			//     return new fabric.filters.Gamma(other);
			// } else if (type === 'kodachrome') {
			//     return new fabric.filters.Kodachrome();
			// } else if (type === 'blackwhite') {
			//     return new fabric.filters.BlackWhite();
		} else if (type === 'blend-image') {
			return this.createBlendImageFilter(other as BlendImageFilter);
			// } else if (type === 'hue') {
			//     return new fabric.filters.HueRotation(other);
		} else if (type === 'resize') {
			return new fabric.filters.Resize(other);
		} else if (type === 'tint') {
			return this.createTintFilter(other as TintFilter);
		} else if (type === 'mask') {
			return this.createMaskFilter(other as MaskFilter);
		} else if (type === 'multiply') {
			return this.createMultiplyFilter(other as MultiplyFilter);
		} else if (type === 'sepia2') {
			return this.createSepia2Filter();
		} else if (type === 'gradient-transparency') {
			return this.createGradientTransparencyFilter();
		} else if (type === 'color-matrix') {
			return new fabric.filters.ColorMatrix(other);
		} else if (type === 'remove-white') {
			return this.createRemoveWhiteFilter(other as RemoveWhiteFilter);
		}
		return false;
	};

	/**
	 * Create filter by types
	 * @param {IFilter[]} filters
	 */
	public createFilters = (filters: IFilter[]) => {
		return filters.reduce((prev, filter) => {
			let type = filter.type;
			if (type.toLowerCase() === 'convolute' && isEqual(filter.matrix, SHARPEN_MATRIX)) {
				type = 'sharpen';
			} else if (type.toLowerCase() === 'convolute' && isEqual(filter.matrix, EMBOSS_MATRIX)) {
				type = 'emboss';
			} else {
				type = normalizeFilterType(type);
			}
			const findIndex = FILTER_TYPES.findIndex(filterType => type === filterType);
			if (findIndex > -1) {
				prev[findIndex] = this.createFilter({
					...filter,
					type,
				});
			}
			return prev;
		}, []);
	};

	/**
	 * Apply filter by type
	 * @param {string} type
	 * @param {*} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	public applyFilterByType = (type: string, apply = true, value?: any, imageObj?: fabric.Image): void => {
		const obj = imageObj || (this.handler.canvas.getActiveObject() as any);
		const normalizedType = normalizeFilterType(type);
		const findIndex = FILTER_TYPES.findIndex(ft => ft === normalizedType);
		if (obj.filters && findIndex > -1) {
			if (apply) {
				obj.filters[findIndex] = this.createFilter({
					type: normalizedType,
					...value,
				});
				obj.applyFilters();
			} else {
				obj.filters[findIndex] = false;
				obj.applyFilters();
			}
			this.handler.canvas.requestRenderAll();
		}
	};

	/**
	 * Apply filter in image
	 * @param {fabric.Image} [imageObj]
	 * @param {number} index
	 * @param {fabric.IBaseFilter} filter
	 */
	public applyFilter = (index: number, filter: fabric.IBaseFilter | boolean, imageObj?: fabric.Image): void => {
		const obj = imageObj || (this.handler.canvas.getActiveObject() as any);
		if (obj.filters) {
			obj.filters[index] = filter;
			obj.applyFilters();
			this.handler.canvas.requestRenderAll();
		}
	};

	/**
	 * Apply filter value in image
	 * @param {fabric.Image} [imageObj]
	 * @param {number} index
	 * @param {string} prop
	 * @param {any} value
	 */
	public applyFilterValue = (index: number, prop: string, value: any, imageObj?: fabric.Image): void => {
		const obj = imageObj || (this.handler.canvas.getActiveObject() as fabric.Image);
		if (obj.filters) {
			const filter = obj.filters[index] as any;
			if (filter) {
				if (typeof filter.setOptions === 'function') {
					filter.setOptions({
						[prop]: value,
					});
				} else {
					filter[prop] = value;
				}
				obj.applyFilters();
				this.handler.canvas.requestRenderAll();
			}
		}
	};

	/**
	 * Apply grayscale in image
	 * @param {fabric.Image} [imageObj]
	 * @param {boolean} [grayscale=false]
	 * @param {GrayscaleModeType} [value]
	 */
	public applyGrayscale = (grayscale = false, value?: GrayscaleModeType, imageObj?: fabric.Image): void => {
		this.applyFilter(
			0,
			grayscale &&
				new fabric.filters.Grayscale(
					value
						? {
								mode: value,
							}
						: undefined,
				),
			imageObj,
		);
	};

	/**
	 * Apply invert in image
	 * @param {fabric.Image} [imageObj]
	 * @param {boolean} [invert=false]
	 */
	public applyInvert = (invert = false, imageObj?: fabric.Image): void => {
		this.applyFilter(1, invert && new fabric.filters.Invert(), imageObj);
	};

	/**
	 * Apply remove color in image
	 * @param {fabric.Image} [imageObj]
	 * @param {boolean} [removeColor=false]
	 * @param {RemoveColorFilter} [value]
	 */
	// public applyRemoveColor = (removeColor = false, value?: RemoveColorFilter, imageObj?: fabric.Image): void => {
	//     this.applyFilter(2, removeColor && new fabric.filters.RemoveColor(value), imageObj);
	// }

	/**
	 * Apply sepia in image
	 * @param {fabric.Image} [imageObj]
	 * @param {boolean} [sepia=false]
	 */
	public applySepia = (sepia = false, imageObj?: fabric.Image): void => {
		this.applyFilter(3, sepia && new fabric.filters.Sepia(), imageObj);
	};

	/**
	 * Apply brownie in image
	 * @param {boolean} [brownie=false]
	 * @param {fabric.Image} [imageObj]
	 */
	// public applyBrownie = (brownie = false, imageObj?: fabric.Image): void => {
	//     this.applyFilter(4, brownie && new fabric.filters.Brownie(), imageObj);
	// }

	/**
	 * Apply brightness in image
	 * @param {boolean} [brightness=false]
	 * @param {number} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	public applyBrightness = (brightness = false, value?: number, imageObj?: fabric.Image): void => {
		this.applyFilter(
			5,
			brightness &&
				new fabric.filters.Brightness(
					value
						? {
								brightness: value,
							}
						: undefined,
				),
			imageObj,
		);
	};

	/**
	 * Apply contrast in image
	 * @param {boolean} [contrast=false]
	 * @param {number} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	public applyContrast = (contrast = false, value?: number, imageObj?: fabric.Image): void => {
		this.applyFilter(
			6,
			contrast &&
				new fabric.filters.Contrast(
					value
						? {
								contrast: value,
							}
						: undefined,
				),
			imageObj,
		);
	};

	/**
	 * Apply saturation in image
	 * @param {boolean} [saturation=false]
	 * @param {number} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	public applySaturation = (saturation = false, value?: number, imageObj?: fabric.Image): void => {
		this.applyFilter(
			7,
			saturation &&
				new fabric.filters.Saturation(
					value
						? {
								saturation: value,
							}
						: undefined,
				),
			imageObj,
		);
	};

	/**
	 * Apply noise in image
	 * @param {boolean} [noise=false]
	 * @param {number} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	public applyNoise = (noise = false, value?: number, imageObj?: fabric.Image): void => {
		this.applyFilter(
			8,
			noise &&
				new fabric.filters.Noise(
					value
						? {
								noise: value,
							}
						: undefined,
				),
			imageObj,
		);
	};

	/**
	 * Apply vintage in image
	 * @param {boolean} [vintage=false]
	 * @param {fabric.Image} [imageObj]
	 */
	// public applyVintage = (vintage = false, imageObj?: fabric.Image): void => {
	//     this.applyFilter(9, vintage && new fabric.filters.Vintage(), imageObj);
	// }

	/**
	 * Apply pixelate in image
	 * @param {boolean} [pixelate=false]
	 * @param {number} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	public applyPixelate = (pixelate = false, value?: number, imageObj?: fabric.Image): void => {
		this.applyFilter(
			10,
			pixelate &&
				new fabric.filters.Pixelate(
					value
						? {
								blocksize: value,
							}
						: undefined,
				),
			imageObj,
		);
	};

	/**
	 * Apply blur in image
	 * @param {boolean} [blur=false]
	 * @param {number} [value]
	 * @param {fabric.Image} imageObj
	 */
	// public applyBlur = (blur = false, value?: number, imageObj?: fabric.Image): void => {
	//     this.applyFilter(11, blur && new fabric.filters.Blur(value ? {
	//         value,
	//     } : undefined), imageObj);
	// }

	/**
	 * Apply sharpen in image
	 * @param {boolean} [sharpen=false]
	 * @param {number[]} [value=[0, -1,  0, -1,  5, -1, 0, -1,  0]]
	 * @param {fabric.Image} [imageObj]
	 */
	public applySharpen = (sharpen = false, value: number[] = SHARPEN_MATRIX, imageObj?: fabric.Image): void => {
		this.applyFilter(
			12,
			sharpen &&
				new fabric.filters.Convolute(
					value
						? {
								matrix: value,
							}
						: undefined,
				),
			imageObj,
		);
	};

	/**
	 * Apply emboss in image
	 * @param {boolean} [emboss=false]
	 * @param {number[]} [value=[1, 1, 1, 1, 0.7, -1, -1, -1, -1]]
	 * @param {fabric.Image} [imageObj]
	 */
	public applyEmboss = (emboss = false, value: number[] = EMBOSS_MATRIX, imageObj?: fabric.Image): void => {
		this.applyFilter(
			13,
			emboss &&
				new fabric.filters.Convolute(
					value
						? {
								matrix: value,
							}
						: undefined,
				),
			imageObj,
		);
	};

	/**
	 * Apply technicolor in image
	 * @param {boolean} [technicolor=false]
	 * @param {fabric.Image} [imageObj]
	 */
	// public applyTechnicolor = (technicolor = false, imageObj?: fabric.Image): void => {
	//     this.applyFilter(14, technicolor && new fabric.filters.Technicolor(), imageObj);
	// }

	/**
	 * Apply polaroid in image
	 * @param {boolean} [polaroid=false]
	 * @param {fabric.Image} [imageObj]
	 */
	// public applyPolaroid = (polaroid = false, imageObj?: fabric.Image): void => {
	//     this.applyFilter(15, polaroid && new fabric.filters.Polaroid(), imageObj);
	// }

	/**
	 * Apply blend color in image
	 * @param {boolean} [blend=false]
	 * @param {BlendColorFilter} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	public applyBlendColor = (blend = false, value?: BlendColorFilter, imageObj?: fabric.Image): void => {
		this.applyFilter(16, blend && this.createBlendColorFilter(value), imageObj);
	};

	/**
	 * Apply gamma in image
	 * @param {boolean} [gamma=false]
	 * @param {GammaFilter} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	// public applyGamma = (gamma = false, value?: GammaFilter, imageObj?: fabric.Image): void => {
	//     this.applyFilter(17, gamma && new fabric.filters.Gamma(value), imageObj);
	// }

	/**
	 * Apply kodachrome in image
	 * @param {boolean} [kodachrome=false]
	 * @param {fabric.Image} [imageObj]
	 */
	// public applyKodachrome = (kodachrome = false, imageObj?: fabric.Image): void => {
	//     this.applyFilter(18, kodachrome && new fabric.filters.Kodachrome(), imageObj);
	// }

	/**
	 * Apply black white in image
	 * @param {boolean} [blackWhite=false]
	 * @param {fabric.Image} [imageObj]
	 */
	// public applyBlackWhite = (blackWhite = false, imageObj?: fabric.Image): void => {
	//     this.applyFilter(19, blackWhite && new fabric.filters.BlackWhite(), imageObj);
	// }

	/**
	 * Apply blend image in image
	 * @param {boolean} [blendImage=false]
	 * @param {BlendImageFilter} value
	 * @param {fabric.Image} [imageObj]
	 */
	public applyBlendImage = (blendImage = false, value?: BlendImageFilter, imageObj?: fabric.Image): void => {
		this.applyFilter(20, blendImage && this.createBlendImageFilter(value), imageObj);
	};

	/**
	 * Apply hue rotation in image
	 * @param {boolean} [hue=false]
	 * @param {HueRotationFilter} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	// public applyHue = (hue = false, value?: HueRotationFilter, imageObj?: fabric.Image): void => {
	//     this.applyFilter(21, hue && new fabric.filters.HueRotation(value ? {
	//         rotation: value,
	//     } : undefined), imageObj);
	// }

	/**
	 * Apply resize in image
	 * @param {boolean} [resize=false]
	 * @param {ResizeFilter} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	public applyResize = (resize = false, value?: ResizeFilter, imageObj?: fabric.Image): void => {
		this.applyFilter(22, resize && new fabric.filters.Resize(value), imageObj);
	};

	/**
	 * Apply tint in image
	 * @param {boolean} [tint=false]
	 * @param {TintFilter} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	public applyTint = (tint = false, value?: TintFilter, imageObj?: fabric.Image): void => {
		this.applyFilter(23, tint && this.createTintFilter(value), imageObj);
	};

	/**
	 * Apply mask in image
	 * @param {boolean} [mask=false]
	 * @param {MaskFilter} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	public applyMask = (mask = false, value?: MaskFilter, imageObj?: fabric.Image): void => {
		this.applyFilter(24, mask && this.createMaskFilter(value), imageObj);
	};

	/**
	 * Apply multiply in image
	 * @param {boolean} [multiply=false]
	 * @param {MultiplyFilter} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	public applyMultiply = (multiply = false, value?: MultiplyFilter, imageObj?: fabric.Image): void => {
		this.applyFilter(25, multiply && this.createMultiplyFilter(value), imageObj);
	};

	/**
	 * Apply sepia2 in image
	 * @param {boolean} [sepia2=false]
	 * @param {fabric.Image} [imageObj]
	 */
	public applySepia2 = (sepia2 = false, imageObj?: fabric.Image): void => {
		this.applyFilter(26, sepia2 && this.createSepia2Filter(), imageObj);
	};

	/**
	 * Apply gradient transparency in image
	 * @param {boolean} [gradientTransparency=false]
	 * @param {GradientTransparencyFilter} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	public applyGradientTransparency = (
		gradientTransparency = false,
		_value?: GradientTransparencyFilter,
		imageObj?: fabric.Image,
	): void => {
		this.applyFilter(27, gradientTransparency && this.createGradientTransparencyFilter(), imageObj);
	};

	/**
	 * Apply color matrix in image
	 * @param {boolean} [colorMatrix=false]
	 * @param {ColorMatrixFilter} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	public applyColorMatrix = (colorMatrix = false, value?: ColorMatrixFilter, imageObj?: fabric.Image): void => {
		this.applyFilter(28, colorMatrix && new fabric.filters.ColorMatrix(value), imageObj);
	};

	/**
	 * Apply remove white in image
	 * @param {boolean} [removeWhite=false]
	 * @param {RemoveWhiteFilter} [value]
	 * @param {fabric.Image} [imageObj]
	 */
	public applyRemoveWhite = (removeWhite = false, value?: RemoveWhiteFilter, imageObj?: fabric.Image): void => {
		this.applyFilter(29, removeWhite && this.createRemoveWhiteFilter(value), imageObj);
	};
}

export default ImageHandler;
