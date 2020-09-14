import { fabric } from 'fabric';

import { Handler } from '.';
import { WorkareaLayout, WorkareaObject, FabricImage } from '../utils';
import { VideoObject } from '../objects/Video';

class WorkareaHandler {
	handler: Handler;

	constructor(handler: Handler) {
		this.handler = handler;
		this.initialize();
	}

	/**
	 * Initialize workarea
	 *
	 * @author salgum1114
	 */
	public initialize() {
		const { workareaOption } = this.handler;
		const image = new Image(workareaOption.width, workareaOption.height);
		image.width = workareaOption.width;
		image.height = workareaOption.height;
		this.handler.workarea = new fabric.Image(image, workareaOption) as WorkareaObject;
		this.handler.canvas.add(this.handler.workarea);
		this.handler.objects = this.handler.getObjects();
		this.handler.canvas.centerObject(this.handler.workarea);
		this.handler.canvas.renderAll();
	}

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
				const scales = this.calculateScale();
				scaleX = scales.scaleX;
				scaleY = scales.scaleY;
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
			const center = canvas.getCenter();
			if (isElement) {
				this.handler.workarea.set({
					scaleX: 1,
					scaleY: 1,
				});
				this.handler.zoomHandler.zoomToPoint(new fabric.Point(center.left, center.top), scaleX);
			} else {
				this.handler.workarea.set({
					width: workareaWidth,
					height: workareaHeight,
				});
				scaleX = canvas.getWidth() / workareaWidth;
				scaleY = canvas.getHeight() / workareaHeight;
				if (workareaHeight >= workareaWidth) {
					scaleX = scaleY;
				} else {
					scaleY = scaleX;
				}
				this.handler.zoomHandler.zoomToPoint(new fabric.Point(center.left, center.top), scaleX);
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
			const width = isFixed ? workareaWidth : this.handler.canvas.getWidth();
			const height = isFixed ? workareaHeight : this.handler.canvas.getHeight();
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
	public setResponsiveImage = async (source: string | File, loaded?: boolean) => {
		const imageFromUrl = async (src: string = '') => {
			return new Promise<WorkareaObject>(resolve => {
				fabric.Image.fromURL(src, (img: any) => {
					const { canvas, workarea, editable } = this.handler;
					const { workareaWidth, workareaHeight } = workarea;
					const { scaleX, scaleY } = this.calculateScale(img);
					if (img._element) {
						workarea.set({
							...img,
							isElement: true,
							selectable: false,
						});
					} else {
						const image = new Image(workareaWidth, workareaHeight);
						workarea.setElement(image);
						workarea.set({
							isElement: false,
							selectable: false,
							width: workareaWidth,
							height: workareaHeight,
						});
					}
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
					// 파일이 없을 경우 Canvas의 nextWidth, nextHeight 값이 변경되기 전 상태에서 zoomToFit이 동작함
					// 정상 동작 resize event logic => zoomToFit
					// 현재 동작 zoomToFit -> resize event logic
					this.handler.zoomHandler.zoomToFit();
					canvas.centerObject(workarea);
					resolve(workarea);
				});
			});
		};
		const { workarea } = this.handler;
		if (!source) {
			workarea.set({
				src: null,
				file: null,
			});
			return imageFromUrl(source as string);
		}
		if (source instanceof File) {
			return new Promise<WorkareaObject>(resolve => {
				const reader = new FileReader();
				reader.onload = () => {
					workarea.set({
						file: source,
					});
					imageFromUrl(reader.result as string).then(resolve);
				};
				reader.readAsDataURL(source);
			});
		} else {
			workarea.set({
				src: source,
			});
			return imageFromUrl(source);
		}
	};

	/**
	 * Set the image on Workarea
	 * @param {string | File} source
	 * @param {boolean} [loaded=false]
	 * @returns
	 */
	setImage = async (source: string | File, loaded = false) => {
		const { canvas, workarea, editable } = this.handler;
		if (workarea.layout === 'responsive') {
			return this.setResponsiveImage(source, loaded);
		}
		const imageFromUrl = async (src: string) => {
			return new Promise<WorkareaObject>(resolve => {
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
								scaleX = layout === 'fullscreen' ? scaleX : obj.scaleX;
								scaleY = layout === 'fullscreen' ? scaleY : obj.scaleY;
								const el = this.handler.elementHandler.findById(id);
								this.handler.elementHandler.setSize(el, obj);
								if (player) {
									const objWidth = obj.width * scaleX;
									const objHeight = obj.height * scaleY;
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
					const zoom = loaded || workarea.layout === 'fullscreen' ? 1 : this.handler.canvas.getZoom();
					canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
					this.handler.zoomHandler.zoomToPoint(new fabric.Point(center.left, center.top), zoom);
					canvas.renderAll();
					resolve(workarea);
				});
			});
		};
		if (!source) {
			workarea.set({
				src: null,
				file: null,
			});
			return imageFromUrl(source as string);
		}
		if (source instanceof File) {
			return new Promise<WorkareaObject>(resolve => {
				const reader = new FileReader();
				reader.onload = () => {
					workarea.set({
						file: source,
					});
					imageFromUrl(reader.result as string).then(resolve);
				};
				reader.readAsDataURL(source);
			});
		} else {
			workarea.set({
				src: source,
			});
			return imageFromUrl(source);
		}
	};

	/**
	 * Calculate scale to the image
	 *
	 * @param {FabricImage} [image]
	 * @returns
	 */
	public calculateScale = (image?: FabricImage) => {
		const { canvas, workarea } = this.handler;
		const { workareaWidth, workareaHeight } = workarea;
		const { _element } = image || workarea;
		const width = _element?.width || workareaWidth;
		const height = _element?.height || workareaHeight;
		let scaleX = canvas.getWidth() / width;
		let scaleY = canvas.getHeight() / height;
		if (height >= width) {
			scaleX = scaleY;
			if (canvas.getWidth() < width * scaleX) {
				scaleX = scaleX * (canvas.getWidth() / (width * scaleX));
			}
		} else {
			scaleY = scaleX;
			if (canvas.getHeight() < height * scaleX) {
				scaleX = scaleX * (canvas.getHeight() / (height * scaleX));
			}
		}
		return { scaleX, scaleY };
	};
}

export default WorkareaHandler;
