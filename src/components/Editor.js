import React, { Component } from 'react';
import { ResizeSensor } from 'css-element-queries';
import debounce from 'lodash/debounce';
import classnames from 'classnames';

import Wireframe from './Wireframe';
import Items from './Items';
import Canvas from './Canvas';
import Properties from './Properties';
import FooterToolbar from './FooterToolbar';
import HeaderToolbar from './HeaderToolbar';
import Title from './Title';
import Preview from './Preview';

const propertiesToInclude = [
    'id',
    'name',
    'lock',
    'file',
    'action',
    'tooltip',
];

class Editor extends Component {
    canvasHandlers = {
        onAdd: (obj) => {
            if (obj.type === 'activeSelection') {
                this.canvasHandlers.onSelect(null);
                return;
            }
            this.canvasRef.current.handlers.select(obj);
        },
        onSelect: (opt) => {
            if (opt && opt.selected && opt.selected.length === 1) {
                this.setState({
                    selectedItem: opt.selected[0],
                });
                return;
            }
            this.setState({
                selectedItem: this.canvasRef.current.workarea,
            });
        },
        onRemove: (obj) => {
            this.canvasHandlers.onSelect(null);
        },
        onModified: debounce((opt) => {
            if (opt.type !== 'activeSelection') {
                this.setState({
                    selectedItem: opt,
                });
                return;
            }
            this.setState({
                selectedItem: this.canvasRef.current.workarea,
            });
        }, 300),
        onZoom: (zoom) => {
            this.setState({
                zoomRatio: zoom,
            });
        },
        onChange: (selectedItem, changedValues, allValues) => {
            const changedKey = Object.keys(changedValues)[0];
            const changedValue = changedValues[changedKey];
            console.log(selectedItem, changedKey, changedValue);
            if (selectedItem.id === 'workarea') {
                this.canvasHandlers.onChangeCanvas(changedKey, changedValue, allValues);
                return;
            }
            if (changedKey === 'width' || changedKey === 'height') {
                this.canvasRef.current.handlers.scaleToResize(allValues.width, allValues.height);
                return;
            }
            if (changedKey === 'lock') {
                this.canvasRef.current.handlers.setObject({
                    lockMovementX: changedValue,
                    lockMovementY: changedValue,
                    hasControls: !changedValue,
                    hoverCursor: changedValue ? 'pointer' : 'move',
                    editable: !changedValue,
                });
                return;
            }
            if (changedKey === 'file' || changedKey === 'src') {
                this.canvasRef.current.handlers.setImageById(selectedItem.id, changedValue);
                return;
            }
            if (changedKey === 'action') {
                this.canvasRef.current.handlers.set(changedKey, allValues.action);
                return;
            }
            if (changedKey === 'tooltip') {
                this.canvasRef.current.handlers.set(changedKey, allValues.tooltip);
                return;
            }
            this.canvasRef.current.handlers.set(changedKey, changedValue);
        },
        onChangeCanvas: (changedKey, changedValue, allValues) => {
            if (changedKey === 'file' || changedKey === 'src') {
                this.canvasRef.current.handlers.setWorkareaImage(this.canvasRef.current.workarea, changedValue);
                return;
            }
            if (changedKey === 'width' || changedKey === 'height') {
                this.canvasRef.current.handlers.originScaleToResize(this.canvasRef.current.workarea, allValues.width, allValues.height);
                this.canvasRef.current.canvas.centerObject(this.canvasRef.current.workarea);
                return;
            }
            this.canvasRef.current.workarea.set(changedKey, changedValue);
            this.canvasRef.current.canvas.centerObject(this.canvasRef.current.workarea);
            this.canvasRef.current.canvas.requestRenderAll();
        },
    }

    handlers = {
        onChangePreview: (checked) => {
            this.setState({
                preview: typeof checked === 'object' ? false : checked,
            });
        },
        onClickObject: (opt) => {
            console.log(opt);
        },
    }

    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
    }

    state = {
        selectedItem: null,
        zoomRatio: 1,
        canvasRect: {
            width: 0,
            height: 0,
        },
        preview: false,
    }

    componentDidMount() {
        this.resizeSensor = new ResizeSensor(this.container, (e) => {
            const { canvasRect: currentCanvasRect } = this.state;
            const canvasRect = Object.assign({}, currentCanvasRect, {
                width: this.container.clientWidth,
                height: this.container.clientHeight,
            });
            this.setState({
                canvasRect,
            });
        });
        this.setState({
            selectedItem: this.canvasRef.current.workarea,
        });
    }

    render() {
        const { preview, selectedItem, canvasRect, zoomRatio } = this.state;
        const { onAdd, onRemove, onSelect, onModified, onChange, onZoom } = this.canvasHandlers;
        const { onChangePreview } = this.handlers;
        const previewClassName = classnames('rde-canvas-preview', { preview });
        return (
            <div className="rde-main">
                <div className="rde-title">
                    <Title propertiesRef={this.propertiesRef} />
                </div>
                <div className="rde-content">
                    <div className="rde-editor">
                        {/* <nav className="rde-wireframe">
                            <Wireframe canvasRef={this.canvasRef} />
                        </nav> */}
                        <aside className="rde-items">
                            <Items canvasRef={this.canvasRef} />
                        </aside>
                        <main
                            ref={(c) => { this.container = c; }}
                            className="rde-canvas-container"
                        >
                            <Canvas
                                ref={this.canvasRef}
                                width={canvasRect.width}
                                height={canvasRect.height}
                                propertiesToInclude={propertiesToInclude}
                                onModified={onModified}
                                onAdd={onAdd}
                                onRemove={onRemove}
                                onSelect={onSelect}
                                onZoom={onZoom}
                            />
                        </main>
                        <header style={{ width: canvasRect.width }} className="rde-canvas-header">
                            <HeaderToolbar canvasRef={this.canvasRef} selectedItem={selectedItem} onSelect={onSelect} />
                        </header>
                        <footer style={{ width: canvasRect.width }} className="rde-canvas-footer">
                            <FooterToolbar canvasRef={this.canvasRef} preview={preview} onChangePreview={onChangePreview} zoomRatio={zoomRatio} />
                        </footer>
                        <aside className="rde-properties">
                            <Properties ref={(c) => { this.propertiesRef = c; }} onChange={onChange} selectedItem={selectedItem} />
                        </aside>
                    </div>
                </div>
                <div className={previewClassName}>
                    <Preview canvasRef={this.canvasRef} preview={preview} onChangePreview={onChangePreview} />
                </div>
            </div>
        );
    }
}

export default Editor;
