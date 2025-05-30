import warning from 'warning';
import { Link, LinkObject } from '../objects';
import { NodeObject } from '../objects/Node';
import { PortObject } from '../objects/Port';
import Handler from './Handler';

export interface LinkOption {
	/**
	 * Link Type
	 * @type {string}
	 */
	type: string;
	/**
	 * FromNode id of Link
	 * @type {string}
	 */
	fromNodeId?: string;
	/**
	 * FromPort id of Link
	 * @type {string}
	 */
	fromPortId?: string;
	/**
	 * ToNode id of Link
	 * @type {string}
	 */
	toNodeId?: string;
	/**
	 * ToPort id of Link
	 * @type {string}
	 */
	toPortId?: string;
}

/**
 * Link Handler Class
 * @author salgum1114
 * @class LinkHandler
 */
class LinkHandler {
	private port: PortObject = null;
	handler: Handler;

	constructor(handler: Handler) {
		this.handler = handler;
	}

	/**
	 * On source port click, start link
	 * @param {PortObject} port
	 */
	init = (port: PortObject) => {
		if (this.isDrawing()) {
			return;
		}
		if (this.isConnected(port)) {
			return;
		}
		this.port = port;
		this.port.set({ fill: port.selectFill });
		this.handler.interactionHandler.linking();
		const { left, top, nodeId, id } = port;
		const fromPort = { left, top, id };
		const toPort = { left, top };
		const fromNode = this.handler.objectMap[nodeId];
		this.handler.activeLine = new Link(fromNode, fromPort, toPort, toPort, {
			strokeWidth: 4,
			fill: '#999999',
			stroke: '#999999',
			class: 'line',
			originX: 'center',
			originY: 'center',
			selectable: false,
			hasBorders: false,
			hasControls: false,
			evented: false,
		});
		this.handler.canvas.add(this.handler.activeLine);
	};

	/**
	 * End drawing link.
	 */
	finish = (link?: LinkObject) => {
		if (!link) {
			this.port.set({ fill: this.port.originFill });
		}
		this.handler.interactionHandler.selection();
		this.handler.canvas.remove(this.handler.activeLine);
		this.handler.activeLine = null;
		this.handler.canvas.renderAll();
	};

	/**
	 * On dest port click, finish link
	 * @param {PortObject} port
	 */
	generate = (port: PortObject) => {
		if (!port) {
			warning(!port, 'Does not exist target port.');
			return;
		}
		if (this.isDuplicate(port)) {
			return;
		}
		if (this.isSameNode(port)) {
			return;
		}
		const link = this.create({
			type: 'link',
			fromNodeId: this.handler.activeLine.fromNode.id,
			fromPortId: this.handler.activeLine.fromPort.id,
			toNodeId: port.nodeId,
			toPortId: port.id,
		});
		this.finish(link);
		// TODO...
		// Save transactions unconditionally
		if (!this.handler.transactionHandler.active) {
			this.handler.transactionHandler.save('add');
		}
	};

	/**
	 * Add link in Canvas
	 * @param {LinkOption} option
	 * @param {boolean} [loaded=false]
	 * @returns
	 */
	create = (option: LinkOption, loaded = false) => {
		const fromNode = this.handler.objectMap[option.fromNodeId] as NodeObject;
		const fromPort = fromNode.fromPort.filter(port => port.id === option.fromPortId || !port.id)[0];
		const toNode = this.handler.objectMap[option.toNodeId] as NodeObject;
		const { toPort } = toNode;
		const link = this.handler.fabricObjects[option.type].create(fromNode, fromPort, toNode, toPort, {
			...option,
		}) as LinkObject;
		this.handler.canvas.add(link);
		this.handler.objects = this.handler.getObjects();
		const { editable } = this.handler;
		if (this.handler.onAdd && editable && !loaded) {
			this.handler.onAdd(link);
		}
		this.handler.canvas.renderAll();
		link.setPort(fromNode, fromPort, toNode, toPort);
		this.handler.portHandler.setCoords(fromNode);
		this.handler.portHandler.setCoords(toNode);
		this.handler.canvas.requestRenderAll();
		this.handler.canvas.sendToBack(link);
		return link;
	};

	/**
	 * When the link is deleted, linked FromNode delete
	 * @param {LinkObject} link
	 */
	removeFrom = (link: LinkObject) => {
		if (link.fromPort) {
			let index = -1;
			if (link.fromPort.links.length) {
				link.fromPort.links.some((portLink: any, i: number) => {
					if (link.id === portLink.id) {
						index = i;
						return true;
					}
					return false;
				});
				if (index > -1) {
					link.fromPort.links.splice(index, 1);
				}
			}
			link.setPortEnabled(link.fromNode, link.fromPort, true);
		}
	};

	/**
	 * When the link is deleted, linked ToNode delete
	 * @param {LinkObject} link
	 */
	removeTo = (link: LinkObject) => {
		if (link.toNode.toPort.links.length) {
			let index = -1;
			link.toNode.toPort.links.some((portLink: any, i: number) => {
				if (link.id === portLink.id) {
					index = i;
					return true;
				}
				return false;
			});
			if (index > -1) {
				link.toNode.toPort.links.splice(index, 1);
			}
			link.setPortEnabled(link.toNode, link.toNode.toPort, true);
		}
	};

	/**
	 * When the link is deleted, linked node delete
	 * @param {LinkObject} link
	 */
	removeAll = (link: LinkObject) => {
		this.removeFrom(link);
		this.removeTo(link);
	};

	/**
	 * Remove link in canvas
	 * @param {LinkObject} link
	 * @param {string} [type]
	 */
	remove = (link: LinkObject, type?: string) => {
		if (type === 'from') {
			this.removeFrom(link);
		} else if (type === 'to') {
			this.removeTo(link);
		} else {
			this.removeAll(link);
		}
		this.handler.canvas.remove(link);
		this.handler.objects = this.handler.getObjects();
	};

	/**
	 * Check if there is a port connected
	 * @param {PortObject} port
	 * @returns
	 */
	isConnected = (port: PortObject) => {
		warning(port.enabled, 'A connected node already exists.');
		return !port.enabled;
	};

	/**
	 * Check if select same node
	 * @param {PortObject} port
	 * @returns
	 */
	isSameNode = (port: PortObject) => {
		const validate = port.nodeId === this.handler.activeLine.fromNode.id;
		warning(!validate, 'Cannot select the same node.');
		return validate;
	};

	/**
	 * Check if select same node
	 * @param {PortObject} port
	 * @returns
	 */
	isDuplicate = (port: PortObject) => {
		const validate = port.links.some(link => link.fromNode.id === this.handler.activeLine.fromNode.id);
		warning(!validate, 'Duplicate connections cannot be made.');
		return validate;
	};

	/**
	 * Check if draw the link
	 * @returns
	 */
	isDrawing = () => {
		const validate = this.handler.interactionMode === 'link' && this.handler.activeLine;
		warning(!validate, 'Already drawing links.');
		return validate;
	};
}

export default LinkHandler;
