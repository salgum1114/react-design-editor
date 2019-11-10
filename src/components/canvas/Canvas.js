import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { fabric } from 'fabric';
import uuid from 'uuid/v4';
import anime from 'animejs';

import CanvasObjects from './CanvasObjects';
import { Handler } from './handlers';

import '../../styles/core/tooltip.less';
import '../../styles/core/contextmenu.less';

const defaultCanvasOption = {
    preserveObjectStacking: true,
    width: 300,
    height: 150,
    selection: true,
    defaultCursor: 'default',
    backgroundColor: '#fff',
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

class Canvas extends Component {
    static propsTypes = {
        fabricObjects: PropTypes.object,
        editable: PropTypes.bool,
        canvasOption: PropTypes.object,
        defaultOption: PropTypes.object,
        activeSelection: PropTypes.object,
        tooltip: PropTypes.any,
        zoomEnabled: PropTypes.bool,
        minZoom: PropTypes.number,
        maxZoom: PropTypes.number,
        propertiesToInclude: PropTypes.array,
        guidelineOption: PropTypes.obj,
        workareaOption: PropTypes.obj,
        gridOption: PropTypes.obj,
        onModified: PropTypes.func,
        onAdd: PropTypes.func,
        onRemove: PropTypes.func,
        onSelect: PropTypes.func,
        onZoom: PropTypes.func,
        onTooltip: PropTypes.func,
        onLink: PropTypes.func,
        onDblClick: PropTypes.func,
        keyEvent: PropTypes.object,
    }

    static defaultProps = {
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
    }

    state = {
        id: uuid(),
    }

    componentDidMount() {
        const { id } = this.state;
        const { editable, canvasOption, keyEvent, guidelineOption, fabricObjects, defaultOption, ...other } = this.props;
        const mergedCanvasOption = Object.assign({}, defaultCanvasOption, canvasOption);
        this.canvas = new fabric.Canvas(`canvas_${id}`, mergedCanvasOption);
        this.canvas.setBackgroundColor(mergedCanvasOption.backgroundColor, this.canvas.renderAll.bind(this.canvas));
        this.canvas.renderAll();
        this.handler = new Handler({
            id,
            canvas: this.canvas,
            container: React.createRef().current,
            fabricObjects: CanvasObjects(fabricObjects, defaultOption),
            keyEvent: Object.assign({}, defaultKeyboardEvent, keyEvent),
            canvasOption: mergedCanvasOption,
            guidelineOption,
            editable,
            defaultOption,
            ...other,
        });
        this.handler.gridHandler.init();
        const {
            modified,
            moving,
            moved,
            scaling,
            rotating,
            mousewheel,
            mousedown,
            mousemove,
            mouseup,
            mouseout,
            selection,
            beforeRender,
            afterRender,
        } = this.handler.eventHandler;
        if (editable) {
            this.handler.transactionHandler.init();
            this.handler.interactionMode = 'selection';
            this.panning = false;
            if (guidelineOption.enabled) {
                this.handler.guidelineHandler.init();
            }
            this.canvas.on({
                'object:modified': modified,
                'object:scaling': scaling,
                'object:moving': moving,
                'object:moved': moved,
                'object:rotating': rotating,
                'mouse:wheel': mousewheel,
                'mouse:down': mousedown,
                'mouse:move': mousemove,
                'mouse:up': mouseup,
                'selection:cleared': selection,
                'selection:created': selection,
                'selection:updated': selection,
                'before:render': guidelineOption.enabled ? beforeRender : null,
                'after:render': guidelineOption.enabled ? afterRender : null,
            });
        } else {
            this.canvas.on({
                'mouse:down': mousedown,
                'mouse:move': mousemove,
                'mouse:out': mouseout,
                'mouse:up': mouseup,
                'mouse:wheel': mousewheel,
            });
        }
        this.handler.eventHandler.attachEventListener();
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(this.props.canvasOption) !== JSON.stringify(prevProps.canvasOption)) {
            const { canvasOption: { width: currentWidth, height: currentHeight } } = this.props;
            const { canvasOption: { width: prevWidth, height: prevHeight } } = prevProps;
            if (currentWidth !== prevWidth || currentHeight !== prevHeight) {
                this.handler.eventHandler.resize(currentWidth, currentHeight);
            }
            this.canvas.setBackgroundColor(this.props.canvasOption.backgroundColor, this.canvas.renderAll.bind(this.canvas));
            if (typeof this.props.canvasOption.selection === 'undefined') {
                this.canvas.selection = true;
            } else {
                this.canvas.selection = this.props.canvasOption.selection;
            }
        }
        if (JSON.stringify(this.props.keyEvent) !== JSON.stringify(prevProps.keyEvent)) {
            this.handler.keyEvent = Object.assign({}, defaultKeyboardEvent, this.props.keyEvent);
        }
        if (JSON.stringify(this.props.fabricObjects) !== JSON.stringify(prevProps.fabricObjects)) {
            this.handler.fabricObjects = CanvasObjects(this.props.fabricObjects);
        } else if (JSON.stringify(this.props.workareaOption) !== JSON.stringify(prevProps.workareaOption)) {
            this.workarea.set({
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
        const { editable } = this.props;
        const {
            modified,
            moving,
            moved,
            scaling,
            rotating,
            mousewheel,
            mousedown,
            mousemove,
            mouseup,
            mouseout,
            selection,
            beforeRender,
            afterRender,
        } = this.handler.eventHandler;
        if (editable) {
            this.canvas.off({
                'object:modified': modified,
                'object:scaling': scaling,
                'object:moving': moving,
                'object:moved': moved,
                'object:rotating': rotating,
                'mouse:wheel': mousewheel,
                'mouse:down': mousedown,
                'mouse:move': mousemove,
                'mouse:up': mouseup,
                'selection:cleared': selection,
                'selection:created': selection,
                'selection:updated': selection,
                'before:render': beforeRender,
                'after:render': afterRender,
            });
        } else {
            this.canvas.off({
                'mouse:down': mousedown,
                'mouse:move': mousemove,
                'mouse:out': mouseout,
                'mouse:up': mouseup,
                'mouse:wheel': mousewheel,
            });
            this.handler.getObjects().forEach((object) => {
                object.off('mousedown', this.handler.eventHandler.object.mousedown);
                if (object.anime) {
                    anime.remove(object);
                }
            });
        }
        this.handler.clear(true);
        if (this.handler.tooltipHandler.tooltipEl) {
            document.body.removeChild(this.handler.tooltipHandler.tooltipEl);
        }
        if (this.handler.contextmenuHandler.contextmenuEl) {
            document.body.removeChild(this.handler.contextmenuHandler.contextmenuEl);
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
