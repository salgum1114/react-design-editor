import anime from 'animejs';
import { fabric } from 'fabric';
import { code } from '../constants';
import { FabricEvent, FabricObject } from '../models';
import { NodeObject } from '../objects/Node';
import { VideoObject } from '../objects/Video';
import AbstractHandler from './AbstractHandler';

/**
 * Event Handler Class
 * @author salgum1114
 * @class EventHandler
 */
class EventHandler extends AbstractHandler {
	code: string;
	panning: boolean;
	currentTarget: FabricObject;

	constructor(handler: any) {
		super(handler);
		this.initialize();
	}

	/**
	 * Attch event on document
	 *
	 */
	protected initialize() {
		if (this.handler.editable) {
			// @ts-ignore
			this.canvas.on({
				'object:modified': this.modified,
				'object:scaling': this.scaling,
				'object:scaled': this.scaled,
				'object:moving': this.moving,
				'object:moved': this.moved,
				'object:rotating': this.rotating,
				'object:rotated': this.rotated,
				'mouse:wheel': this.mousewheel,
				'mouse:down': this.mousedown,
				'mouse:move': this.mousemove,
				'mouse:up': this.mouseup,
				'mouse:out': this.mouseout,
				'selection:cleared': this.selection,
				'selection:created': this.selection,
				'selection:updated': this.selection,
			});
		} else {
			// @ts-ignore
			this.canvas.on({
				'mouse:down': this.mousedown,
				'mouse:move': this.mousemove,
				'mouse:out': this.mouseout,
				'mouse:up': this.mouseup,
				'mouse:wheel': this.mousewheel,
			});
		}
		this.canvas.wrapperEl.tabIndex = 1000;
		this.canvas.wrapperEl.addEventListener('keydown', this.keydown, false);
		this.canvas.wrapperEl.addEventListener('keyup', this.keyup, false);
		this.canvas.wrapperEl.addEventListener('mousedown', this.onmousedown, false);
		this.canvas.wrapperEl.addEventListener('contextmenu', this.contextmenu, false);
		if (this.handler.keyEvent.clipboard) {
			document.addEventListener('paste', this.paste, false);
		}
	}

	/**
	 * Detach event on document
	 *
	 */
	public destroy = () => {
		if (this.handler.editable) {
			this.canvas.off({
				'object:modified': this.modified,
				'object:scaling': this.scaling,
				'object:moving': this.moving,
				'object:moved': this.moved,
				'object:rotating': this.rotating,
				'mouse:wheel': this.mousewheel,
				'mouse:down': this.mousedown,
				'mouse:move': this.mousemove,
				'mouse:up': this.mouseup,
				'mouse:out': this.mouseout,
				'selection:cleared': this.selection,
				'selection:created': this.selection,
				'selection:updated': this.selection,
			});
		} else {
			this.canvas.off({
				'mouse:down': this.mousedown,
				'mouse:move': this.mousemove,
				'mouse:out': this.mouseout,
				'mouse:up': this.mouseup,
				'mouse:wheel': this.mousewheel,
			});
			this.handler.getObjects().forEach(object => {
				object.off('mousedown', this.handler.eventHandler.object.mousedown);
				if (object.anime) {
					anime.remove(object);
				}
			});
		}
		this.canvas.wrapperEl.removeEventListener('keydown', this.keydown);
		this.canvas.wrapperEl.removeEventListener('keyup', this.keyup);
		this.canvas.wrapperEl.removeEventListener('mousedown', this.onmousedown);
		this.canvas.wrapperEl.removeEventListener('contextmenu', this.contextmenu);
		if (this.handler.keyEvent.clipboard) {
			this.canvas.wrapperEl.removeEventListener('paste', this.paste);
		}
	};

	/**
	 * Individual object event
	 *
	 */
	public object = {
		/**
		 * Mouse down event on object
		 * @param {FabricEvent} opt
		 */
		mousedown: (opt: FabricEvent) => {
			const { target } = opt;
			console.log(opt);
			if (target && target.link && target.link.enabled) {
				this.handler.onClick?.(this.canvas, target);
			}
		},
		/**
		 * Mouse double click event on object
		 * @param {FabricEvent} opt
		 */
		mousedblclick: (opt: FabricEvent) => {
			const { target } = opt;
			if (target) {
				this.handler.onDblClick?.(this.canvas, target);
			}
		},
	};

	/**
	 * Modified event object
	 *
	 * @param {FabricEvent} opt
	 * @returns
	 */
	public modified = (opt: FabricEvent) => {
		const { target } = opt;
		if (!target) {
			return;
		}
		if (target.type === 'circle' && target.parentId) {
			return;
		}
		this.handler.onModified?.(target);
	};

	/**
	 * Moving event object
	 *
	 * @param {FabricEvent} opt
	 * @returns
	 */
	public moving = (opt: FabricEvent) => {
		const { target } = opt as any;
		if (this.handler.interactionMode === 'crop') {
			this.handler.cropHandler.moving(opt);
		} else {
			if (this.handler.editable && this.handler.guidelineOption.enabled) {
				this.handler.guidelineHandler.movingGuidelines(target);
			}
			if (target.type === 'activeSelection') {
				const activeSelection = target as fabric.ActiveSelection;
				activeSelection.getObjects().forEach((obj: any) => {
					const left = obj.left + target.left + target.width / 2;
					const top = obj.top + target.top + target.height / 2;
					if (obj.superType === 'node') {
						this.handler.portHandler.setCoords({ ...obj, left, top });
					} else if (obj.superType === 'element') {
						const { id } = obj;
						const el = this.handler.elementHandler.findById(id);
						// TODO... Element object incorrect position
						this.handler.elementHandler.setPositionByOrigin(el, obj, left, top);
					}
				});
				return;
			}
			if (target.superType === 'node') {
				this.handler.portHandler.setCoords(target);
			} else if (target.superType === 'element') {
				const { id } = target;
				const el = this.handler.elementHandler.findById(id);
				this.handler.elementHandler.setPosition(el, target);
			}
		}
	};

	/**
	 * Moved event object
	 *
	 * @param {FabricEvent} opt
	 */
	public moved = (opt: FabricEvent) => {
		const { target } = opt;
		this.handler.gridHandler.setCoords(target);
		if (!this.handler.transactionHandler.active) {
			this.handler.transactionHandler.save('moved');
		}
		if (target.superType === 'element') {
			const { id } = target;
			const el = this.handler.elementHandler.findById(id);
			this.handler.elementHandler.setPosition(el, target);
		}
	};

	/**
	 * Scaling event object
	 *
	 * @param {FabricEvent} opt
	 */
	public scaling = (opt: FabricEvent) => {
		const { target } = opt as any;
		if (this.handler.interactionMode === 'crop') {
			this.handler.cropHandler.resize(opt);
		}
		// TODO...this.handler.guidelineHandler.scalingGuidelines(target);
		if (target.superType === 'element') {
			const { id, width, height } = target;
			const el = this.handler.elementHandler.findById(id);
			// update the element
			this.handler.elementHandler.setScaleOrAngle(el, target);
			this.handler.elementHandler.setSize(el, target);
			this.handler.elementHandler.setPosition(el, target);
			const video = target as VideoObject;
			if (video.type === 'video' && video.player) {
				video.player.setPlayerSize(width, height);
			}
		}
	};

	/**
	 * Scaled event object
	 *
	 * @param {FabricEvent} opt
	 */
	public scaled = (_opt: FabricEvent) => {
		if (!this.handler.transactionHandler.active) {
			this.handler.transactionHandler.save('scaled');
		}
	};

	/**
	 * Rotating event object
	 *
	 * @param {FabricEvent} opt
	 */
	public rotating = (opt: FabricEvent) => {
		const { target } = opt as any;
		if (target.superType === 'element') {
			const { id } = target;
			const el = this.handler.elementHandler.findById(id);
			// update the element
			this.handler.elementHandler.setScaleOrAngle(el, target);
		}
	};

	/**
	 * Rotated event object
	 *
	 * @param {FabricEvent} opt
	 */
	public rotated = (_opt: FabricEvent) => {
		if (!this.handler.transactionHandler.active) {
			this.handler.transactionHandler.save('rotated');
		}
	};

	/**
	 * Moing object at keyboard arrow key down event
	 *
	 * @param {KeyboardEvent} e
	 * @returns
	 */
	public arrowmoving = (e: KeyboardEvent) => {
		const activeObject = this.canvas.getActiveObject() as FabricObject;
		if (!activeObject) {
			return false;
		}
		if (activeObject.id === 'workarea') {
			return false;
		}
		if (e.code === code.ARROW_UP) {
			activeObject.set('top', activeObject.top - 2);
			activeObject.setCoords();
			this.canvas.renderAll();
			return true;
		} else if (e.code === code.ARROW_DOWN) {
			activeObject.set('top', activeObject.top + 2);
			activeObject.setCoords();
			this.canvas.renderAll();
			return true;
		} else if (e.code === code.ARROW_LEFT) {
			activeObject.set('left', activeObject.left - 2);
			activeObject.setCoords();
			this.canvas.renderAll();
			return true;
		} else if (e.code === code.ARROW_RIGHT) {
			activeObject.set('left', activeObject.left + 2);
			activeObject.setCoords();
			this.canvas.renderAll();
			return true;
		}
		if (this.handler.onModified) {
			this.handler.onModified(activeObject);
		}
		return true;
	};

	/**
	 * Zoom at mouse wheel event
	 *
	 * @param {FabricEvent<WheelEvent>} opt
	 * @returns
	 */
	public mousewheel = (opt: FabricEvent) => {
		const event = opt.e as WheelEvent;
		const { zoomEnabled } = this.handler;
		if (event.ctrlKey) {
			if (!zoomEnabled) {
				return;
			}
			const delta = event.deltaY;
			let zoomRatio = this.canvas.getZoom();
			if (delta > 0) {
				zoomRatio -= this.handler.zoomStep;
			} else {
				zoomRatio += this.handler.zoomStep;
			}
			this.handler.zoomHandler.zoomToPoint(
				new fabric.Point(this.canvas.getWidth() / 2, this.canvas.getHeight() / 2),
				zoomRatio,
			);
		} else {
			const deltaY = event.deltaY / 2;
			const [scaleX, skewY, skewX, scaleY, panX, panY] = this.canvas.viewportTransform;
			this.canvas.setViewportTransform([
				scaleX,
				skewY,
				skewX,
				scaleY,
				event.shiftKey ? panX - deltaY : panX,
				event.shiftKey ? panY : panY - deltaY,
			]);
		}
		this.canvas.requestRenderAll();
		event.preventDefault();
		event.stopPropagation();
	};

	/**
	 * Mouse down event on object
	 *
	 * @param {FabricEvent<MouseEvent>} opt
	 * @returns
	 */
	public mousedown = (opt: FabricEvent) => {
		const { e: event, target, subTargets } = opt as FabricEvent<MouseEvent>;
		const { editable } = this.handler;
		if (event.altKey && editable && !this.handler.interactionHandler.isDrawingMode()) {
			this.handler.interactionHandler.grab();
			this.panning = true;
			return;
		}
		if (this.handler.interactionMode === 'grab') {
			this.panning = true;
			return;
		}
		if (editable) {
			if (this.handler.prevTarget && this.handler.prevTarget.superType === 'link') {
				this.handler.prevTarget.setColor(
					this.handler.prevTarget.originStroke || this.handler.prevTarget.stroke,
				);
			}
			if (
				this.handler.interactionMode !== 'link' &&
				target?.superType === 'node' &&
				subTargets.length &&
				subTargets[0] === target._objects[target._objects.length - 1]
			) {
				this.canvas.discardActiveObject();
				this.canvas.requestRenderAll();
				this.handler.onClick?.(this.canvas, target, subTargets[0]);
				return;
			}
			if (target && target.type === 'fromPort') {
				this.handler.linkHandler.init(target);
				return;
			}
			if (
				target &&
				this.handler.interactionMode === 'link' &&
				(target.type === 'toPort' || target.superType === 'node')
			) {
				let toPort;
				if (target.superType === 'node') {
					toPort = target.toPort;
				} else {
					toPort = target;
				}
				this.handler.linkHandler.generate(toPort);
				return;
			}
			this.handler.guidelineHandler.viewportTransform = this.canvas.viewportTransform;
			this.handler.guidelineHandler.zoom = this.canvas.getZoom();
			if (this.handler.interactionMode === 'selection') {
				if (target && target.superType === 'link') {
					target.line.set({ stroke: target.selectedStroke || 'green' });
					target.arrow.set({ fill: target.selectedStroke || 'green' });
				}
				this.handler.prevTarget = target;
				return;
			}
			if (this.handler.interactionMode === 'polygon') {
				if (target && this.handler.pointArray.length && target.id === this.handler.pointArray[0].id) {
					this.handler.drawingHandler.polygon.generate(this.handler.pointArray);
				} else {
					this.handler.drawingHandler.polygon.addPoint(opt);
				}
			} else if (this.handler.interactionMode === 'line') {
				if (this.handler.pointArray.length && this.handler.activeLine) {
					this.handler.drawingHandler.line.generate(opt);
				} else {
					this.handler.drawingHandler.line.addPoint(opt);
				}
			} else if (this.handler.interactionMode === 'arrow') {
				if (this.handler.pointArray.length && this.handler.activeLine) {
					this.handler.drawingHandler.arrow.generate(opt);
				} else {
					this.handler.drawingHandler.arrow.addPoint(opt);
				}
			}
		}
	};

	/**
	 * Mouse move event on canvas
	 *
	 * @param {FabricEvent<MouseEvent>} opt
	 * @returns
	 */
	public mousemove = (opt: FabricEvent) => {
		const event = opt as FabricEvent<MouseEvent>;
		if (this.handler.interactionMode === 'grab' && this.panning) {
			this.handler.interactionHandler.moving(event.e);
			this.canvas.requestRenderAll();
		}
		if (!this.handler.editable && event.target) {
			if (event.target.superType === 'element') {
				return;
			}
			if (event.target.id !== 'workarea') {
				if (event.target !== this.handler.target) {
					this.handler.tooltipHandler.show(event.target);
				}
			} else {
				this.handler.tooltipHandler.hide(event.target);
			}
		}
		if (this.handler.interactionMode === 'polygon') {
			if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
				const pointer = this.canvas.getPointer(event.e);
				this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
				const points = this.handler.activeShape.get('points');
				points[this.handler.pointArray.length] = {
					x: pointer.x,
					y: pointer.y,
				};
				this.handler.activeShape.set({
					points,
				});
				this.canvas.requestRenderAll();
			}
		} else if (this.handler.interactionMode === 'line') {
			if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
				const pointer = this.canvas.getPointer(event.e);
				this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
			}
			this.canvas.requestRenderAll();
		} else if (this.handler.interactionMode === 'arrow') {
			if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
				const pointer = this.canvas.getPointer(event.e);
				this.handler.activeLine.set({ x2: pointer.x, y2: pointer.y });
			}
			this.canvas.requestRenderAll();
		} else if (this.handler.interactionMode === 'link') {
			if (this.handler.activeLine && this.handler.activeLine.class === 'line') {
				const pointer = this.canvas.getPointer(event.e);
				this.handler.activeLine.update(this.handler.activeLine.fromPort, { left: pointer.x, top: pointer.y });
			}
			this.canvas.requestRenderAll();
		}
		return;
	};

	/**
	 * Mouse up event on canvas
	 *
	 * @param {FabricEvent<MouseEvent>} opt
	 * @returns
	 */
	public mouseup = (opt: FabricEvent) => {
		const event = opt as FabricEvent<MouseEvent>;
		if (this.handler.interactionMode === 'grab') {
			this.panning = false;
			return;
		}
		const { target, e } = event;
		if (this.handler.interactionMode === 'selection') {
			if (target && e.shiftKey && target.superType === 'node') {
				const node = target as NodeObject;
				this.canvas.discardActiveObject();
				const nodes = [] as NodeObject[];
				this.handler.nodeHandler.getNodePath(node, nodes);
				const activeSelection = new fabric.ActiveSelection(nodes, {
					canvas: this.canvas,
					...this.handler.activeSelectionOption,
				});
				this.canvas.setActiveObject(activeSelection);
				this.canvas.requestRenderAll();
			}
		}
		if (this.handler.editable && this.handler.guidelineOption.enabled) {
			this.handler.guidelineHandler.verticalLines.length = 0;
			this.handler.guidelineHandler.horizontalLines.length = 0;
		}
		this.canvas.renderAll();
	};

	/**
	 * Mouse out event on canvas
	 *
	 * @param {FabricEvent<MouseEvent>} opt
	 */
	public mouseout = (opt: FabricEvent) => {
		const { target } = opt as FabricEvent<MouseEvent>;
		if (!target) {
			this.handler.tooltipHandler.hide();
		}
	};

	/**
	 * Selection event event on canvas
	 *
	 * @param {FabricEvent} opt
	 */
	public selection = (opt: FabricEvent<FabricObject<fabric.ActiveSelection>>) => {
		const { activeSelectionOption } = this.handler;
		const { target } = opt;
		if (target && target.type === 'activeSelection') {
			target.set({ ...activeSelectionOption });
		}
		this.currentTarget = target;
		this.handler.onSelect?.(target);
	};

	/**
	 * Called resize event on canvas
	 *
	 * @param {number} nextWidth
	 * @param {number} nextHeight
	 * @returns
	 */
	public resize = (nextWidth: number, nextHeight: number) => {
		this.canvas.setWidth(nextWidth).setHeight(nextHeight);
		this.canvas.setBackgroundColor(
			this.handler.canvasOption.backgroundColor,
			this.canvas.renderAll.bind(this.canvas),
		);
		if (!this.handler.workarea) {
			return;
		}
		const diffWidth = nextWidth / 2 - this.handler.width / 2;
		const diffHeight = nextHeight / 2 - this.handler.height / 2;
		this.handler.width = nextWidth;
		this.handler.height = nextHeight;
		if (this.handler.workarea.layout === 'fixed') {
			this.canvas.centerObject(this.handler.workarea);
			this.handler.workarea.setCoords();
			if (this.handler.gridOption.enabled) {
				return;
			}
			this.canvas.getObjects().forEach((obj: FabricObject) => {
				if (obj.id !== 'workarea') {
					const left = obj.left + diffWidth;
					const top = obj.top + diffHeight;
					obj.set({
						left,
						top,
					});
					obj.setCoords();
					if (obj.superType === 'element') {
						const { id } = obj;
						const el = this.handler.elementHandler.findById(id);
						// update the element
						this.handler.elementHandler.setPosition(el, obj);
					}
				}
			});
			this.canvas.requestRenderAll();
			return;
		}
		if (this.handler.workarea.layout === 'responsive') {
			const { scaleX } = this.handler.workareaHandler.calculateScale();
			const center = this.canvas.getCenter();
			const deltaPoint = new fabric.Point(diffWidth, diffHeight);
			this.canvas.relativePan(deltaPoint);
			this.handler.zoomHandler.zoomToPoint(new fabric.Point(center.left, center.top), scaleX);
			return;
		}
		const scaleX = nextWidth / this.handler.workarea.width;
		const scaleY = nextHeight / this.handler.workarea.height;
		const diffScaleX = nextWidth / (this.handler.workarea.width * this.handler.workarea.scaleX);
		const diffScaleY = nextHeight / (this.handler.workarea.height * this.handler.workarea.scaleY);
		this.handler.workarea.set({
			scaleX,
			scaleY,
		});
		this.canvas.getObjects().forEach((obj: any) => {
			const { id } = obj;
			if (obj.id !== 'workarea') {
				const left = obj.left * diffScaleX;
				const top = obj.top * diffScaleY;
				const newScaleX = obj.scaleX * diffScaleX;
				const newScaleY = obj.scaleY * diffScaleY;
				obj.set({
					scaleX: newScaleX,
					scaleY: newScaleY,
					left,
					top,
				});
				obj.setCoords();
				if (obj.superType === 'element') {
					const video = obj as VideoObject;
					const { width, height } = obj;
					const el = this.handler.elementHandler.findById(id);
					this.handler.elementHandler.setSize(el, obj);
					if (video.player) {
						video.player.setPlayerSize(width, height);
					}
					this.handler.elementHandler.setPosition(el, obj);
				}
			}
		});
		this.canvas.renderAll();
	};

	/**
	 * Paste event on canvas
	 *
	 * @param {ClipboardEvent} e
	 * @returns
	 */
	public paste = async (e: ClipboardEvent) => {
		if (this.canvas.wrapperEl !== document.activeElement) {
			return false;
		}
		if (e.preventDefault) {
			e.preventDefault();
		}
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		const clipboardData = e.clipboardData;
		if (clipboardData.types.length) {
			clipboardData.types.forEach((clipboardType: string) => {
				if (clipboardType === 'text/plain') {
					const textPlain = clipboardData.getData('text/plain');
					try {
						const objects = JSON.parse(textPlain);
						const {
							gridOption: { grid = 10 },
							isCut,
						} = this.handler;
						const padding = isCut ? 0 : grid;
						if (objects && Array.isArray(objects)) {
							const filteredObjects = objects.filter(obj => obj !== null);
							if (filteredObjects.length === 1) {
								const obj = filteredObjects[0];
								if (typeof obj.cloneable !== 'undefined' && !obj.cloneable) {
									return;
								}
								obj.left = obj.properties.left + padding;
								obj.top = obj.properties.top + padding;
								const createdObj = this.handler.add(obj, false, true);
								this.canvas.setActiveObject(createdObj as FabricObject);
								this.canvas.requestRenderAll();
								this.handler.onAdd?.(createdObj);
							} else {
								const nodes = [] as any[];
								const targets = [] as any[];
								objects.forEach(obj => {
									if (!obj) {
										return;
									}
									if (obj.superType === 'link') {
										obj.fromNodeId = nodes[obj.fromNodeIndex].id;
										obj.toNodeId = nodes[obj.toNodeIndex].id;
									} else {
										obj.left = obj.properties.left + padding;
										obj.top = obj.properties.top + padding;
									}
									const createdObj = this.handler.add(obj, false, true);
									if (obj.superType === 'node') {
										nodes.push(createdObj);
									} else {
										targets.push(createdObj);
									}
								});
								const activeSelection = new fabric.ActiveSelection(nodes.length ? nodes : targets, {
									canvas: this.canvas,
									...this.handler.activeSelectionOption,
								});
								this.canvas.setActiveObject(activeSelection);
								this.canvas.requestRenderAll();
								this.handler.onAdd?.(activeSelection);
							}
							if (!this.handler.transactionHandler.active) {
								this.handler.transactionHandler.save('paste');
							}
							this.handler.isCut = false;
							this.handler.copy();
						}
					} catch (error) {
						console.error(error);
						// const item = {
						//     id: uuv4id(),
						//     type: 'textbox',
						//     text: textPlain,
						// };
						// this.handler.add(item, true);
					}
				} else if (clipboardType === 'text/html') {
					// Todo ...
					// const textHtml = clipboardData.getData('text/html');
					// console.log(textHtml);
				} else if (clipboardType === 'Files') {
					// Array.from(clipboardData.files).forEach((file) => {
					//     const { type } = file;
					//     if (type === 'image/png' || type === 'image/jpeg' || type === 'image/jpg') {
					//         const item = {
					//             id: uuid(),
					//             type: 'image',
					//             file,
					//             superType: 'image',
					//         };
					//         this.handler.add(item, true);
					//     } else {
					//         console.error('Not supported file type');
					//     }
					// });
				}
			});
		}
		return true;
	};

	/**
	 * Keydown event on document
	 *
	 * @param {KeyboardEvent} e
	 */
	public keydown = (e: KeyboardEvent) => {
		const { keyEvent, editable } = this.handler;
		if (!Object.keys(keyEvent).length) {
			return;
		}
		const { clipboard, grab } = keyEvent;
		if (this.handler.interactionHandler.isDrawingMode()) {
			if (this.handler.shortcutHandler.isEscape(e)) {
				if (this.handler.interactionMode === 'polygon') {
					this.handler.drawingHandler.polygon.finish();
				} else if (this.handler.interactionMode === 'line') {
					this.handler.drawingHandler.line.finish();
				} else if (this.handler.interactionMode === 'arrow') {
					this.handler.drawingHandler.arrow.finish();
				} else if (this.handler.interactionMode === 'link') {
					this.handler.linkHandler.finish();
				}
			}
			return;
		}
		if (this.handler.shortcutHandler.isW(e) && grab) {
			this.code = e.code;
			this.handler.interactionHandler.grab();
			return;
		}
		if ((this.handler.shortcutHandler.isSpace(e) || e.altKey) && editable && grab) {
			this.handler.interactionHandler.grab();
			return;
		}
		if (this.handler.shortcutHandler.isEscape(e)) {
			if (this.handler.interactionMode === 'selection') {
				this.canvas.discardActiveObject();
				this.canvas.renderAll();
			}
			this.handler.tooltipHandler.hide();
		}
		if (this.canvas.wrapperEl !== document.activeElement) {
			return;
		}
		if (editable) {
			if (this.handler.shortcutHandler.isQ(e)) {
				this.code = e.code;
			} else if (this.handler.shortcutHandler.isDelete(e)) {
				this.handler.remove();
			} else if (this.handler.shortcutHandler.isArrow(e)) {
				this.arrowmoving(e);
			} else if (this.handler.shortcutHandler.isCtrlA(e)) {
				e.preventDefault();
				this.handler.selectAll();
			} else if (this.handler.shortcutHandler.isCtrlC(e)) {
				e.preventDefault();
				this.handler.copy();
			} else if (this.handler.shortcutHandler.isCtrlV(e) && !clipboard) {
				e.preventDefault();
				this.handler.paste();
			} else if (this.handler.shortcutHandler.isCtrlX(e)) {
				e.preventDefault();
				this.handler.cut();
			} else if (this.handler.shortcutHandler.isCtrlZ(e)) {
				e.preventDefault();
				this.handler.transactionHandler.undo();
			} else if (this.handler.shortcutHandler.isCtrlY(e)) {
				e.preventDefault();
				this.handler.transactionHandler.redo();
			} else if (this.handler.shortcutHandler.isPlus(e)) {
				e.preventDefault();
				this.handler.zoomHandler.zoomIn();
			} else if (this.handler.shortcutHandler.isMinus(e)) {
				e.preventDefault();
				this.handler.zoomHandler.zoomOut();
			} else if (this.handler.shortcutHandler.isO(e)) {
				e.preventDefault();
				this.handler.zoomHandler.zoomOneToOne();
			} else if (this.handler.shortcutHandler.isP(e)) {
				e.preventDefault();
				this.handler.zoomHandler.zoomToFit();
			}
			return;
		}
		return;
	};

	/**
	 * Key up event on canvas
	 *
	 * @param {KeyboardEvent} _e
	 */
	public keyup = (e: KeyboardEvent) => {
		if (this.handler.interactionHandler.isDrawingMode()) {
			return;
		}
		if (!this.handler.shortcutHandler.isW(e)) {
			this.handler.interactionHandler.selection();
		}
	};

	/**
	 * Context menu event on canvas
	 *
	 * @param {MouseEvent} e
	 */
	public contextmenu = (e: MouseEvent) => {
		e.preventDefault();
		const { editable, onContext } = this.handler;
		if (editable && onContext) {
			const target = this.canvas.findTarget(e, false) as FabricObject;
			if (target && target.type !== 'activeSelection') {
				this.handler.select(target);
			}
			this.handler.contextmenuHandler.show(e, target);
		}
	};

	/**
	 * Mouse down event on canvas
	 *
	 * @param {MouseEvent} _e
	 */
	public onmousedown = (_e: MouseEvent) => {
		this.handler.contextmenuHandler.hide();
	};
}

export default EventHandler;
