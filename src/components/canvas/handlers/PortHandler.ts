import Handler from './Handler';
import { NodeObject } from '../objects/Node';
import { PortObject } from '../objects/Port';

class PortHandler {
	handler?: Handler;

	constructor(handler: Handler) {
		this.handler = handler;
	}

	/**
	 * Create port
	 * @param {NodeObject} target
	 */
	create = (target: NodeObject) => {
		if (!target.createToPort) {
			return;
		}
		const toPort = target.createToPort(target.left + target.width / 2, target.top);
		if (toPort) {
			toPort.on('mouseover', () => {
				if (
					this.handler.interactionMode === 'link' &&
					this.handler.activeLine &&
					this.handler.activeLine.class === 'line'
				) {
					if (toPort.links.some(link => link.fromNode === this.handler.activeLine.fromNode)) {
						toPort.set({
							fill: 'red',
						});
						this.handler.canvas.renderAll();
						return;
					}
					toPort.set({
						fill: 'green',
					});
					this.handler.canvas.renderAll();
				}
			});
			toPort.on('mouseout', () => {
				toPort.set({
					fill: toPort.originFill,
				});
				this.handler.canvas.renderAll();
			});
			this.handler.canvas.add(toPort);
			toPort.setCoords();
			this.handler.canvas.bringToFront(toPort);
		}
		const fromPort = target.createFromPort(target.left + target.width / 2, target.top + target.height);
		if (fromPort && fromPort.length) {
			fromPort.forEach(port => {
				if (port) {
					port.on('mouseover', () => {
						if (this.handler.interactionMode !== 'link') {
							if (port.enabled) {
								if (this.handler.activeLine) {
									port.set({
										fill: 'red',
									});
									this.handler.canvas.renderAll();
									return;
								}
								port.set({
									fill: 'green',
								});
								this.handler.canvas.renderAll();
								return;
							}
							port.set({
								fill: 'red',
							});
							this.handler.canvas.renderAll();
						}
					});
					port.on('mouseout', () => {
						if (this.handler.interactionMode !== 'link') {
							port.set({
								fill: port.enabled ? port.originFill : port.hoverFill,
							});
						}
						this.handler.canvas.renderAll();
					});
					this.handler.canvas.add(port);
					port.setCoords();
					this.handler.canvas.bringToFront(port);
				}
			});
		}
	};

	/**
	 * Set coords port
	 * @param {NodeObject} target
	 */
	setCoords = (target: NodeObject) => {
		if (target.toPort) {
			const toCoords = {
				left: target.left + target.width / 2,
				top: target.top,
			};
			target.toPort.set({
				...toCoords,
			});
			target.toPort.setCoords();
			if (target.toPort.links.length) {
				target.toPort.links.forEach(link => {
					const fromPort = link.fromNode.fromPort.filter(port => port.id === link.fromPort.id)[0];
					this.handler.linkHandler.setCoords(fromPort.left, fromPort.top, toCoords.left, toCoords.top, link);
				});
			}
		}
		if (target.fromPort) {
			const fromCoords = {
				left: target.left + target.width / 2,
				top: target.top + target.height,
			};
			target.fromPort.forEach(port => {
				const left = port.leftDiff ? fromCoords.left + port.leftDiff : fromCoords.left;
				const top = port.topDiff ? fromCoords.top + port.topDiff : fromCoords.top;
				port.set({
					left,
					top,
				});
				port.setCoords();
				if (port.links.length) {
					port.links.forEach((link: any) => {
						this.handler.linkHandler.setCoords(
							left,
							top,
							link.toNode.toPort.left,
							link.toNode.toPort.top,
							link,
						);
					});
				}
			});
		}
	};

	/**
	 * Recreate port
	 * @param {NodeObject} target
	 */
	recreate = (target: NodeObject) => {
		const { fromPort, toPort } = target;
		const ports = target.ports as PortObject[];
		if (ports) {
			ports.forEach(port => {
				target.removeWithUpdate(port);
				this.handler.canvas.remove(port.fromPort);
			});
		}
		this.handler.canvas.remove(target.toPort);
		if (target.toPort) {
			target.toPort.links.forEach(link => {
				this.handler.linkHandler.remove(link, 'from');
			});
		}
		if (target.fromPort) {
			target.fromPort.forEach((port: any) => {
				if (port.links.length) {
					port.links.forEach((link: any) => {
						this.handler.linkHandler.remove(link, 'to');
					});
				}
			});
		}
		this.create(target);
		toPort.links.forEach((link: any) => {
			link.fromNode = link.fromNode.id;
			link.fromPort = link.fromPort.id;
			link.toNode = target.toPort.nodeId;
			link.toPort = target.toPort.id;
			this.handler.linkHandler.create(link);
		});
		fromPort
			.filter(op => target.fromPort.some(np => np.id === op.id))
			.forEach(port => {
				port.links.forEach((link: any) => {
					if (link.fromPort.id === port.id) {
						link.fromNode = port.nodeId;
						link.fromPort = port.id;
						link.toNode = link.toNode.id;
						link.toPort = link.toPort.id;
						this.handler.linkHandler.create(link);
						this.setCoords(target);
					}
				});
			});
	};
}

export default PortHandler;
