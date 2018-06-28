import React, { Component } from 'react';
import uuid from 'uuid/v4';
import { ResizeSensor } from 'css-element-queries';

import Wireframe from './Wireframe';
import Items from './Items';
import Canvas from './Canvas';
import Properties from './Properties';
import FooterToolbar from './FooterToolbar';
import HeaderToolbar from './HeaderToolbar';

class Editor extends Component {
    state = {
        items: {},
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

    handlers = {
        onAdd: (type, key) => {
            const newItem = {
                [uuid()]: {
                    type,
                    key,
                },
            };
            const { items } = this.state;
            const newItems = Object.assign({}, items, newItem);
            this.setState({
                items: newItems,
            });
        },
    }

    render() {
        const { items, canvasRect } = this.state;
        const { onAdd } = this.handlers;
        return (
            <div className="rde-editor">
                <nav className="rde-wireframe">
                    <Wireframe />
                </nav>
                <aside className="rde-items">
                    <Items onAdd={onAdd} />
                </aside>
                <main
                    ref={(c) => { this.container = c; }}
                    className="rde-canvas-container"
                >
                    <Canvas items={items} width={canvasRect.width} height={canvasRect.height} />
                </main>
                <header style={{ width: canvasRect.width }} className="rde-canvas-header">
                    <HeaderToolbar />
                </header>
                <footer style={{ width: canvasRect.width }} className="rde-canvas-footer">
                    <FooterToolbar />
                </footer>
                <aside className="rde-properties">
                    <Properties />
                </aside>
            </div>
        );
    }
}

export default Editor;
