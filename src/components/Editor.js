import React, { Component } from 'react';
import { ResizeSensor } from 'css-element-queries';

import Wireframe from './Wireframe';
import Items from './Items';
import Canvas from './Canvas';
import Properties from './Properties';
import FooterToolbar from './FooterToolbar';
import HeaderToolbar from './HeaderToolbar';

class Editor extends Component {
    handlers = {
        onAdd: (obj) => {
            if (obj.type === 'activeSelection') {
                const newItems = {};
                obj.forEachObject((obj) => {
                    Object.assign(newItems, this.state.items, {
                        [obj.id]: obj,
                    });
                });
                this.setState({
                    items: newItems,
                }, () => {
                    this.handlers.onSelect(null);
                });
                return;
            }
            const newItems = Object.assign({}, this.state.items, {
                [obj.id]: obj,
            });
            this.setState({
                items: newItems,
            }, () => {
                this.canvasRef.current.handlers.select(obj);
            });
        },
        onSelect: (opt) => {
            if (opt && opt.selected && opt.selected.length === 1) {
                this.setState({
                    selectedItem: opt.selected[0],
                });
                return;
            }
            this.setState({
                selectedItem: this.canvasRef.current.mainRect,
            });
        },
        onRemove: (obj) => {
            delete this.state.items[obj.id];
            this.setState({
                items: this.state.items,
            }, () => {
                this.handlers.onSelect(null);
            });
        },
        onModified: (opt) => {
            if (opt.target) {
                if (opt.target.type === 'activeSelection') {
                    const newItems = {};
                    opt.target.forEachObject((obj) => {
                        Object.assign(newItems, this.state.items, {
                            [obj.id]: obj,
                        });
                    });
                    this.setState({
                        items: newItems,
                    });
                    return;
                }
                const newItems = Object.assign({}, this.state.items, {
                    [opt.target.id]: opt.target,
                });
                this.setState({
                    items: newItems,
                });
                return;
            }
            const newItems = Object.assign({}, this.state.items, {
                [opt.id]: opt,
            });
            this.setState({
                items: newItems,
            });
        },
        onChange: (selectedItem, changedValues, allValues) => {
            const changedKey = Object.keys(changedValues)[0];
            const changedValue = changedValues[changedKey];
            console.log(selectedItem, changedKey, changedValue);
            if (!selectedItem.id) {
                this.handlers.onChangeCanvas(changedKey, changedValue);
                return;
            }
            if (changedKey === 'width' || changedKey === 'height') {
                this.canvasRef.current.handlers.scaleToResize(allValues.width, allValues.height);
            } else if (changedKey === 'image') {
                this.canvasRef.current.handlers.setImageById(selectedItem.id, changedValue);
            } else {
                this.canvasRef.current.handlers.set(changedKey, changedValue);
            }
        },
        onChangeCanvas: (changedKey, changedValue) => {
            if (changedKey === 'image') {
                this.canvasRef.current.handlers.setImageByObject(this.canvasRef.current.mainRect, changedValue);
                return;
            }
            this.canvasRef.current.mainRect.set(changedKey, changedValue);
            this.canvasRef.current.canvas.centerObject(this.canvasRef.current.mainRect);
            this.canvasRef.current.canvas.requestRenderAll();
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
            selectedItem: this.canvasRef.current.mainRect,
        });
    }

    render() {
        const { items, selectedItem, canvasRect } = this.state;
        const { onAdd, onRemove, onSelect, onModified, onChange } = this.handlers;
        return (
            <div className="rde-editor">
                <nav className="rde-wireframe">
                    <Wireframe />
                </nav>
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
                        onModified={onModified}
                        onAdd={onAdd}
                        onRemove={onRemove}
                        onSelect={onSelect}
                    />
                </main>
                <header style={{ width: canvasRect.width }} className="rde-canvas-header">
                    <HeaderToolbar canvasRef={this.canvasRef} items={items} selectedItem={selectedItem} onSelect={onSelect} />
                </header>
                <footer style={{ width: canvasRect.width }} className="rde-canvas-footer">
                    <FooterToolbar />
                </footer>
                <aside className="rde-properties">
                    <Properties ref={(c) => { this.propertiesRef = c; }} onChange={onChange} selectedItem={selectedItem} />
                </aside>
            </div>
        );
    }
}

export default Editor;
