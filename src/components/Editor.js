import React, { Component } from 'react';
import uuid from 'uuid/v4';

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
            <FlexBox className="rde-editor" flexDirection="row">
                <FlexItem flex="0 1 auto">
                    <Wireframe />
                </FlexItem>
                <FlexItem flex="0 1 auto">
                    <Items onAdd={onAdd} />
                </FlexItem>
                <FlexItem flex="0 1 auto">
                    <Canvas items={items} />
                </FlexItem>
                <FlexItem flex="0 1 auto">
                    <Properties />
                </FlexItem>
            </FlexBox>
        );
    }
}

export default Editor;
