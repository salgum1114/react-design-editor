import { NodeObject } from '../objects/Node';
import AbstractHandler from './AbstractHandler';

class PortHandler extends AbstractHandler {
	constructor(handler: any) {
		super(handler);
	}

	/**
	 * Create port
	 * @param {NodeObject} target
	 */
	create = (target: NodeObject) => {
		const toPort = target.createToPort?.(target.left + target.width / 2, target.top);
		if (toPort) {
			toPort.on('mouseover', () => {
				if (
					this.handler.interactionMode === 'link' &&
					this.handler.activeLine &&
					this.handler.activeLine.class === 'line'
				) {
					if (toPort.nodeId === this.handler.activeLine.fromNode?.id) {
						toPort.set({ fill: toPort.disabledFill });
						this.handler.canvas.renderAll();
						return;
					}
					toPort.set({ fill: toPort.enabledFill });
					this.handler.canvas.renderAll();
				}
			});
			toPort.on('mouseout', () => {
				toPort.set({ fill: toPort.connected ? toPort.connectedFill : toPort.originFill });
				this.handler.canvas.renderAll();
			});
			this.handler.canvas.add(toPort);
			toPort.setCoords();
			this.handler.canvas.bringToFront(toPort);
		}
		const fromPort = target.createFromPort?.(target.left + target.width / 2, target.top + target.height);
		if (fromPort && fromPort.length) {
			fromPort.forEach(port => {
				if (port) {
					port.on('mouseover', () => {
						if (this.handler.interactionMode !== 'link') {
							if (port.enabled) {
								if (this.handler.activeLine) {
									port.set({ fill: port.disabledFill });
									this.handler.canvas.renderAll();
									return;
								}
								port.set({ fill: port.enabledFill });
								this.handler.canvas.renderAll();
								return;
							}
							port.set({ fill: port.disabledFill });
							this.handler.canvas.renderAll();
						}
					});
					port.on('mouseout', () => {
						port.set({ fill: port.connected ? port.connectedFill : port.originFill });
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
			const left = target.left + target.width / 2;
			const top = target.top;

			target.toPort.setPosition(left, top);
			target.toPort.setCoords();

			if (target.toPort.links.length) {
				target.toPort.links.forEach(link => {
					const fromPort = link.fromNode.fromPort.filter(port => port.id === link.fromPort.id)[0];
					link.update(fromPort, target.toPort);
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

				port.setPosition(left, top);
				port.setCoords();

				if (port.links.length) {
					port.links.forEach(link => {
						link.update(port, link.toNode.toPort);
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
		const { fromPort, toPort, ports } = target;
		ports?.forEach(port => {
			target.removeWithUpdate(port);
			this.handler.canvas.remove(port.fromPort);
		});
		this.handler.canvas.remove(target.toPort);
		if (target.toPort) {
			target.toPort.links.forEach(link => this.handler.linkHandler.remove(link, 'from'));
		}
		if (target.fromPort) {
			target.fromPort.forEach((port: any) => {
				if (port.links.length) {
					port.links.forEach((link: any) => this.handler.linkHandler.remove(link, 'to'));
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
