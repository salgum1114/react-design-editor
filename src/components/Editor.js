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
                })
                this.setState({
                    items: newItems,
                }, () => {
                    this.handlers.onSelect(null);
                });
            } else {
                const newItems = Object.assign({}, this.state.items, {
                    [obj.id]: obj,
                });
                this.setState({
                    items: newItems,
                }, () => {
                    this.handlers.onSelect(obj);
                });
            }
        },
        onSelect: (obj) => {
            if (obj && !obj._objects) {
                this.setState({
                    selectedItem: obj,
                });
                if (obj.id) {
                    this.canvasRef.current.handlers.select(obj);
                }
            } else {
                this.setState({
                    selectedItem: this.canvasRef.current.mainRect,
                });
            }
        },
        onRemove: (obj) => {
            delete this.state.items[obj.id];
            this.setState({
                items: this.state.items,
            }, () => {
                this.handlers.onSelect(null);
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
    }

    render() {
        const { items, selectedItem, canvasRect } = this.state;
        const { onAdd, onRemove, onSelect } = this.handlers;
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
                    <Properties selectedItem={selectedItem} />
                </aside>
            </div>
        );
    }
}

export default Editor;
