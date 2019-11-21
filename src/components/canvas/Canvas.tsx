import React, { Component } from 'react';
import { fabric } from 'fabric';
import uuid from 'uuid/v4';
import ResizeObserver from 'resize-observer-polyfill';

import { Handler } from './handlers';
import { HandlerOptions } from './handlers/Handler';
import { FabricCanvas } from './utils';

import '../../styles/core/tooltip.less';
import '../../styles/core/contextmenu.less';

const defaultCanvasOption = {
    preserveObjectStacking: true,
    width: 300,
    height: 150,
    selection: true,
    defaultCursor: 'default',
    backgroundColor: '#f3f3f3',
};

const defaultKeyboardEvent = {
    move: true,
    all: true,
    copy: true,
    paste: true,
    esc: true,
    del: true,
    clipboard: false,
    transaction: true,
};

export type CanvasProps = HandlerOptions & {
    responsive?: boolean;
};

class Canvas extends Component<CanvasProps> {
    public handler: Handler;
    public canvas: FabricCanvas;
    public container = React.createRef<HTMLDivElement>();
    private resizeObserver: ResizeObserver;
    static defaultProps: CanvasProps = {
        id: uuid(),
        editable: true,
        canvasOption: {
            selection: true,
        },
        defaultOption: {},
        activeSelection: {
            hasControls: true,
        },
        tooltip: null,
        zoomEnabled: true,
        minZoom: 30,
        maxZoom: 300,
        propertiesToInclude: [],
        workareaOption: {},
        gridOption: {
            enabled: false,
            grid: 10,
            snapToGrid: false,
        },
        guidelineOption: {
            enabled: true,
        },
        keyEvent: {},
        responsive: true,
    }

    state = {
        id: uuid(),
    }

    componentDidMount() {
        const { editable, canvasOption, width, height, keyEvent, guidelineOption, defaultOption, responsive, ...other } = this.props;
        const { id } = this.state;
        if (responsive) {
            this.createObserver();
        }
        const mergedCanvasOption = Object.assign({}, defaultCanvasOption, canvasOption, { width, height });
        this.canvas = new fabric.Canvas(`canvas_${id}`, mergedCanvasOption);
        this.canvas.setBackgroundColor(mergedCanvasOption.backgroundColor, this.canvas.renderAll.bind(this.canvas));
        this.canvas.renderAll();
        this.handler = new Handler({
            id,
            canvas: this.canvas,
            container: this.container.current,
            keyEvent: Object.assign({}, defaultKeyboardEvent, keyEvent),
            canvasOption: mergedCanvasOption,
            guidelineOption,
            editable,
            defaultOption,
            ...other,
        });
        this.handler.gridHandler.init();
        if (editable) {
            this.handler.transactionHandler.init();
            this.handler.interactionMode = 'selection';
            if (guidelineOption.enabled) {
                this.handler.guidelineHandler.init();
            }
        }
        this.handler.eventHandler.attachEventListener();
    }

    componentDidUpdate(prevProps: CanvasProps) {
        if (JSON.stringify(this.props.canvasOption) !== JSON.stringify(prevProps.canvasOption)) {
            this.handler.canvasOption = this.props.canvasOption;
            this.handler.canvas.setBackgroundColor(this.props.canvasOption.backgroundColor, this.canvas.renderAll.bind(this.handler.canvas));
            const { canvasOption: { width: currentWidth, height: currentHeight } } = this.props;
            const { canvasOption: { width: prevWidth, height: prevHeight } } = prevProps;
            if (!this.props.responsive && (currentWidth !== prevWidth || currentHeight !== prevHeight)) {
                this.handler.eventHandler.resize(currentWidth, currentHeight);
            }
            if (typeof this.props.canvasOption.selection === 'undefined') {
                this.canvas.selection = true;
            } else {
                this.canvas.selection = this.props.canvasOption.selection;
            }
        }
        if (!this.props.responsive && (this.props.width !== prevProps.width || this.props.height !== prevProps.height)) {
            this.handler.eventHandler.resize(this.props.width, this.props.height);
        }
        if (JSON.stringify(this.props.keyEvent) !== JSON.stringify(prevProps.keyEvent)) {
            this.handler.keyEvent = Object.assign({}, defaultKeyboardEvent, this.props.keyEvent);
        }
        if (JSON.stringify(this.props.fabricObjects) !== JSON.stringify(prevProps.fabricObjects)) {
            this.handler.fabricObjects = Object.assign({}, this.handler.fabricObjects, this.props.fabricObjects);
        } else if (JSON.stringify(this.props.workareaOption) !== JSON.stringify(prevProps.workareaOption)) {
            this.handler.workarea.set({
                ...this.props.workareaOption,
            });
        } else if (JSON.stringify(this.props.guidelineOption) !== JSON.stringify(prevProps.guidelineOption)) {
            if (this.props.guidelineOption.enabled) {
                this.canvas.on({
                    'before:render': this.handler.eventHandler.beforeRender,
                    'after:render': this.handler.eventHandler.afterRender,
                });
            } else {
                this.canvas.off({
                    'before:render': this.handler.eventHandler.beforeRender,
                    'after:render': this.handler.eventHandler.afterRender,
                });
            }
        }
    }

    componentWillUnmount() {
        this.handler.eventHandler.detachEventListener();
        this.cancelObserver();
        this.handler.clear(true);
        if (this.handler.tooltipHandler.tooltipEl) {
            document.body.removeChild(this.handler.tooltipHandler.tooltipEl);
        }
        if (this.handler.contextmenuHandler.contextmenuEl) {
            document.body.removeChild(this.handler.contextmenuHandler.contextmenuEl);
        }
    }

    createObserver = () => {
        this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
            const { width = 0, height = 0 } = entries[0] && entries[0].contentRect || {};
            this.handler.eventHandler.resize(width, height);
        });
        this.resizeObserver.observe(this.container.current);
    }

    cancelObserver = () => {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    render() {
        const { id } = this.state;
        return (
            <div
                ref={this.container}
                id={id}
                className="rde-canvas"
                style={{ width: '100%', height: '100%' }}
            >
                <canvas id={`canvas_${id}`} />
            </div>
        );
    }
}

export default Canvas;
