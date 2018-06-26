import React, { Component } from 'react';
import uuid from 'uuid/v4';
import { Row, Col } from 'antd';

import { FlexBox, FlexItem } from './flex';
import Wireframe from './Wireframe';
import Items from './Items';
import Canvas from './Canvas';
import Properties from './Properties';

class Editor extends Component {
    state = {
        items: {},
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
        const { items } = this.state;
        const { onAdd } = this.handlers;
        return (
            <Row className="rde-editor">
                <Col span={2} className="rde-wireframe">
                    <Wireframe />
                </Col>
                <Col span={4} className="rde-items">
                    <Items onAdd={onAdd} />
                </Col>
                <Col span={12} className="rde-canvas">
                    <Canvas items={items} />
                </Col>
                <Col span={6} className="rde-properties">
                    <Properties />
                </Col>
            </Row>
        );
    }
}

export default Editor;
