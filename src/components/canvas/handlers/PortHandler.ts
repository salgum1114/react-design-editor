import Handler from './Handler';

class PortHandler {
    handler?: Handler;

    constructor(handler: Handler) {
        this.handler = handler;
    }

    create = (target) => {
        if (!target.createToPort) {
            return;
        }
        const toPort = target.createToPort(target.left + (target.width / 2), target.top);
        if (toPort) {
            toPort.on('mouseover', () => {
                if (this.handler.interactionMode === 'link' && this.handler.activeLine && this.handler.activeLine.class === 'line') {
                    if (toPort.links.some(link => link.fromNode.id ===  this.handler.activeLine.fromNode)) {
                        toPort.set({
                            fill: toPort.errorFill,
                        });
                        this.handler.canvas.renderAll();
                        return;
                    }
                    toPort.set({
                        fill: toPort.hoverFill,
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
        const fromPort = target.createFromPort(target.left + (target.width / 2), target.top + target.height);
        if (fromPort && fromPort.length) {
            fromPort.forEach((port) => {
                if (port) {
                    port.on('mouseover', () => {
                        if (port.enabled) {
                            if (this.handler.activeLine) {
                                port.set({
                                    fill: port.errorFill,
                                });
                                this.handler.canvas.renderAll();
                                return;
                            }
                            port.set({
                                fill: port.hoverFill,
                            });
                            this.handler.canvas.renderAll();
                            return;
                        }
                        port.set({
                            fill: port.errorFill,
                        });
                        this.handler.canvas.renderAll();
                    });
                    port.on('mouseout', () => {
                        port.set({
                            fill: port.originFill,
                        });
                        this.handler.canvas.renderAll();
                    });
                    this.handler.canvas.add(port);
                    port.setCoords();
                    this.handler.canvas.bringToFront(port);
                }
            });
        }
    }

    setCoords = (target) => {
        if (target.toPort) {
            const toCoords = {
                left: target.left + (target.width / 2),
                top: target.top,
            };
            target.toPort.set({
                ...toCoords,
            });
            target.toPort.setCoords();
            if (target.toPort.links.length) {
                target.toPort.links.forEach((link) => {
                    const fromPort = link.fromNode.fromPort.filter(port => port.id === link.fromPort)[0];
                    this.handler.linkHandler.setCoords(fromPort.left, fromPort.top, toCoords.left, toCoords.top, link);
                });
            }
        }
        if (target.fromPort) {
            const fromCoords = {
                left: target.left + (target.width / 2),
                top: target.top + target.height,
            };
            target.fromPort.forEach((port) => {
                const left = port.leftDiff ? fromCoords.left + port.leftDiff : fromCoords.left;
                const top = port.topDiff ? fromCoords.top + port.topDiff : fromCoords.top;
                port.set({
                    left,
                    top,
                });
                port.setCoords();
                if (port.links.length) {
                    port.links.forEach((link) => {
                        this.handler.linkHandler.setCoords(left, top, link.toNode.toPort.left, link.toNode.toPort.top, link);
                    });
                }
            });
        }
    }

    recreate = (target) => {
        const { fromPort, toPort } = target;
        if (target.ports) {
            target.ports.forEach((port) => {
                target.removeWithUpdate(port);
                this.handler.canvas.remove(port.fromPort);
            });
        }
        this.handler.canvas.remove(target.toPort);
        if (target.toPort) {
            target.toPort.links.forEach((link) => {
                this.handler.linkHandler.remove(link, 'from');
            });
        }
        if (target.fromPort) {
            target.fromPort.forEach((port) => {
                if (port.links.length) {
                    port.links.forEach((link) => {
                        this.handler.linkHandler.remove(link, 'to');
                    });
                }
            });
        }
        this.create(target);
        toPort.links.forEach((link) => {
            link.fromNode = link.fromNode.id;
            link.toNode = target.toPort.nodeId;
            this.handler.linkHandler.create(link);
        });
        fromPort.filter(op => target.fromPort.some(np => np.id === op.id)).forEach((port) => {
            port.links.forEach((link) => {
                if (link.fromPort === port.id) {
                    link.fromNode = port.nodeId;
                    link.toNode = link.toNode.id;
                    this.handler.linkHandler.create(link);
                    this.setCoords(target);
                }
            });
        });
    }
}

export default PortHandler;
