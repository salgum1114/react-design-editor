import { fabric } from 'fabric';

import { Handler } from '.';
import { WorkareaLayout, WorkareaObject } from '../utils';
import { VideoObject } from '../objects/Video';

const defaultWorkareaOption: Partial<WorkareaObject> = {
	width: 600,
	height: 400,
	workareaWidth: 600,
	workareaHeight: 400,
	lockScalingX: true,
	lockScalingY: true,
	scaleX: 1,
	scaleY: 1,
	backgroundColor: '#fff',
	hasBorders: false,
	hasControls: false,
	selectable: false,
	lockMovementX: true,
	lockMovementY: true,
	hoverCursor: 'default',
	name: '',
	id: 'workarea',
	type: 'image',
	layout: 'fixed', // fixed, responsive, fullscreen
	link: {},
	tooltip: {
		enabled: false,
	},
	isElement: false,
};

class WorkareaHandler {
	handler: Handler;

	constructor(handler: Handler) {
		this.handler = handler;
		this.init();
	}

	/**
	 * Init workarea
	 */
	public init = () => {
		const { workareaOption } = this.handler;
		const mergedWorkareaOption = Object.assign({}, defaultWorkareaOption, workareaOption);
		const image = new Image(mergedWorkareaOption.width, mergedWorkareaOption.height);
		image.width = mergedWorkareaOption.width;
		image.height = mergedWorkareaOption.height;
		this.handler.workarea = new fabric.Image(image, mergedWorkareaOption) as WorkareaObject;
		this.handler.canvas.add(this.handler.workarea);
		this.handler.objects = this.handler.getObjects();
		this.handler.canvas.centerObject(this.handler.workarea);
		this.handler.canvas.renderAll();
	};

	/**
	 * Set the layout on workarea
	 * @param {WorkareaLayout} layout
	 * @returns
	 */
	public setLayout = (layout: WorkareaLayout) => {
		this.handler.workarea.set('layout', layout);
		const { _element, isElement, workareaWidth, workareaHeight } = this.handler.workarea;
		const { canvas } = this.handler;
		let scaleX = 1;
		let scaleY = 1;
		const isFixed = layout === 'fixed';
		const isResponsive = layout === 'responsive';
		const isFullscreen = layout === 'fullscreen';
		if (isElement) {
			if (isFixed) {
				scaleX = workareaWidth / _element.width;
				scaleY = workareaHeight / _element.height;
			} else if (isResponsive) {
				scaleX = canvas.getWidth() / _element.width;
				scaleY = canvas.getHeight() / _element.height;
				if (_element.height >= _element.width) {
					scaleX = scaleY;
				} else {
					scaleY = scaleX;
				}
			} else {
				scaleX = canvas.getWidth() / _element.width;
				scaleY = canvas.getHeight() / _element.height;
			}
		}
		this.handler.getObjects().forEach(obj => {
			const { id, player } = obj as VideoObject;
			if (id !== 'workarea') {
				const objScaleX = !isFullscreen ? 1 : scaleX;
				const objScaleY = !isFullscreen ? 1 : scaleY;
				const objWidth = obj.width * objScaleX * canvas.getZoom();
				const objHeight = obj.height * objScaleY * canvas.getZoom();
				const el = this.handler.elementHandler.findById(obj.id);
				this.handler.elementHandler.setSize(el, obj);
				if (player) {
					player.setPlayerSize(objWidth, objHeight);
				}
				obj.set({
					scaleX: !isFullscreen ? 1 : objScaleX,
					scaleY: !isFullscreen ? 1 : objScaleY,
				});
			}
		});
		if (isResponsive) {
			if (isElement) {
				const center = canvas.getCenter();
				this.handler.workarea.set({
					scaleX: 1,
					scaleY: 1,
				});
				this.handler.zoomHandler.zoomToPoint(new fabric.Point(center.left, center.top), scaleX);
			} else {
				this.handler.workarea.set({
					width: 0,
					height: 0,
					backgroundColor: 'rgba(255, 255, 255, 0)',
				});
			}
			canvas.centerObject(this.handler.workarea);
			canvas.renderAll();
			return;
		}
		if (isElement) {
			this.handler.workarea.set({
				width: _element.width,
				height: _element.height,
				scaleX,
				scaleY,
			});
		} else {
			const width = isFixed ? this.handler.workarea.workareaWidth : this.handler.canvas.getWidth();
			const height = isFixed ? this.handler.workarea.workareaHeight : this.handler.canvas.getHeight();
			this.handler.workarea.set({
				width,
				height,
				backgroundColor: 'rgba(255, 255, 255, 1)',
			});
			this.handler.canvas.renderAll();
			if (isFixed) {
				canvas.centerObject(this.handler.workarea);
			} else {
				this.handler.workarea.set({
					left: 0,
					top: 0,
				});
			}
		}
		canvas.centerObject(this.handler.workarea);
		const center = canvas.getCenter();
		canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
		this.handler.zoomHandler.zoomToPoint(new fabric.Point(center.left, center.top), 1);
		canvas.renderAll();
	};

	/**
	 * Set the responsive image on Workarea
	 * @param {string | File} [source]
	 * @param {boolean} [loaded]
	 * @returns
	 */
	public setResponsiveImage = (source: string | File, loaded?: boolean) => {
		const { canvas, workarea, editable } = this.handler;
		const imageFromUrl = (src: string) => {
			fabric.Image.fromURL(src, (img: any) => {
				let scaleX = canvas.getWidth() / img.width;
				let scaleY = canvas.getHeight() / img.height;
				if (img.height >= img.width) {
					scaleX = scaleY;
					if (canvas.getWidth() < img.width * scaleX) {
						scaleX = scaleX * (canvas.getWidth() / (img.width * scaleX));
					}
				} else {
					scaleY = scaleX;
					if (canvas.getHeight() < img.height * scaleX) {
						scaleX = scaleX * (canvas.getHeight() / (img.height * scaleX));
					}
				}
				img.set({
					originX: 'left',
					originY: 'top',
				});
				if (!img._element) {
					workarea.setElement(new Image());
					workarea.set({
						isElement: false,
						selectable: false,
					});
				} else {
					workarea.set({
						...img,
						isElement: true,
						selectable: false,
					});
				}
				if (!src) {
					scaleX = 1;
				}
				canvas.centerObject(workarea);
				if (editable && !loaded) {
					canvas.getObjects().forEach(obj => {
						const { id, player } = obj as VideoObject;
						if (id !== 'workarea') {
							const objWidth = obj.width * scaleX;
							const objHeight = obj.height * scaleY;
							const el = this.handler.elementHandler.findById(id);
							this.handler.elementHandler.setScaleOrAngle(el, obj);
							this.handler.elementHandler.setSize(el, obj);
							if (player) {
								player.setPlayerSize(objWidth, objHeight);
							}
							obj.set({
								scaleX: 1,
								scaleY: 1,
							});
							obj.setCoords();
						}
					});
				}
				const center = canvas.getCenter();
				canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
				this.handler.zoomHandler.zoomToPoint(new fabric.Point(center.left, center.top), scaleX);
				canvas.renderAll();
			});
		};
		if (!source) {
			workarea.set({
				src: null,
				file: null,
			});
			imageFromUrl(source as string);
			return;
		}
		if (source instanceof File) {
			const reader = new FileReader();
			reader.onload = () => {
				workarea.set({
					file: source,
				});
				imageFromUrl(reader.result as string);
			};
			reader.readAsDataURL(source);
		} else {
			workarea.set({
				src: source,
			});
			imageFromUrl(source);
		}
	};

	/**
	 * Set the image on Workarea
	 * @param {string | File} source
	 * @param {boolean} [loaded=false]
	 * @returns
	 */
	setImage = (source: string | File, loaded = false) => {
		const { canvas, workarea, editable } = this.handler;
		if (workarea.layout === 'responsive') {
			this.setResponsiveImage(source, loaded);
			return;
		}
		const imageFromUrl = (src: string) => {
			fabric.Image.fromURL(src, (img: any) => {
				let width = canvas.getWidth();
				let height = canvas.getHeight();
				if (workarea.layout === 'fixed') {
					width = workarea.width * workarea.scaleX;
					height = workarea.height * workarea.scaleY;
				}
				let scaleX = 1;
				let scaleY = 1;
				if (img._element) {
					scaleX = width / img.width;
					scaleY = height / img.height;
					img.set({
						originX: 'left',
						originY: 'top',
						scaleX,
						scaleY,
					});
					workarea.set({
						...img,
						isElement: true,
						selectable: false,
					});
				} else {
					workarea.setElement(new Image());
					workarea.set({
						width,
						height,
						scaleX,
						scaleY,
						isElement: false,
						selectable: false,
					});
				}
				canvas.centerObject(workarea);
				if (editable && !loaded) {
					const { layout } = workarea;
					canvas.getObjects().forEach(obj => {
						const { id, player } = obj as VideoObject;
						if (id !== 'workarea') {
							scaleX = layout !== 'fullscreen' ? 1 : scaleX;
							scaleY = layout !== 'fullscreen' ? 1 : scaleY;
							const objWidth = obj.width * scaleX;
							const objHeight = obj.height * scaleY;
							const el = this.handler.elementHandler.findById(id);
							this.handler.elementHandler.setSize(el, obj);
							if (player) {
								player.setPlayerSize(objWidth, objHeight);
							}
							obj.set({
								scaleX,
								scaleY,
							});
							obj.setCoords();
						}
					});
				}
				const center = canvas.getCenter();
				canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
				this.handler.zoomHandler.zoomToPoint(new fabric.Point(center.left, center.top), 1);
				canvas.renderAll();
			});
		};
		if (!source) {
			workarea.set({
				src: null,
				file: null,
			});
			imageFromUrl(source as string);
			return;
		}
		if (source instanceof File) {
			const reader = new FileReader();
			reader.onload = () => {
				workarea.set({
					file: source,
				});
				imageFromUrl(reader.result as string);
			};
			reader.readAsDataURL(source);
		} else {
			workarea.set({
				src: source,
			});
			imageFromUrl(source);
		}
	};
}

export default WorkareaHandler;
