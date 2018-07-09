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
    'actionType',
    'imageLoadType',
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
        onChange: (selectedItem, changedValues, allValues) => {
            const changedKey = Object.keys(changedValues)[0];
            const changedValue = changedValues[changedKey];
            console.log(selectedItem, changedKey, changedValue);
            if (!selectedItem.id) {
                this.canvasHandlers.onChangeCanvas(changedKey, changedValue);
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
            } else if (changedKey === 'file' || changedKey === 'src') {
                this.canvasRef.current.handlers.setImageById(selectedItem.id, changedValue);
            }
            this.canvasRef.current.handlers.set(changedKey, changedValue);
        },
        onChangeCanvas: (changedKey, changedValue) => {
            if (changedKey === 'file' || changedKey === 'src') {
                this.canvasRef.current.handlers.setImageByObject(this.canvasRef.current.workarea, changedValue);
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
    }

    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
    }

    state = {
        items: {},
        selectedItem: null,
        canvasRect: {
            width: 0,
            height: 0,
        },
        preview: false,
    }

    componentDidMount() {
        new ResizeSensor(this.container, (e) => {
            const canvasRect = Object.assign({}, this.state.canvasRect, {
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
        const { preview, selectedItem, canvasRect } = this.state;
        const { onAdd, onRemove, onSelect, onModified, onChange } = this.canvasHandlers;
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
                            />
                        </main>
                        <header style={{ width: canvasRect.width }} className="rde-canvas-header">
                            <HeaderToolbar canvasRef={this.canvasRef} selectedItem={selectedItem} onSelect={onSelect} />
                        </header>
                        <footer style={{ width: canvasRect.width }} className="rde-canvas-footer">
                            <FooterToolbar canvasRef={this.canvasRef} preview={preview} onChangePreview={onChangePreview} />
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
