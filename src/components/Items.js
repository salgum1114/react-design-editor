import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'antd';
import uuid from 'uuid/v4';

import { FlexBox, FlexItem } from './flex';

import Icon from './Icon';

const { Panel } = Collapse;

const MARKER = [
    {
        key: 'default',
        type: 'itext',
        icon: 'map-marker',
        title: 'Marker',
        option: {
            text: '\uf041', // map-marker
            fontFamily: 'FontAwesome',
            fontSize: 60,
            width: 30,
            height: 30,
            editable: false,
            name: 'New marker',
        },
    },
];

const TEXT = [
    {
        key: 'default',
        type: 'textbox',
        icon: 'font',
        title: 'Text',
        option: {
            text: 'Input text',
            name: 'New text',
        },
    },
];

const IMAGE = [
    {
        key: 'default',
        type: 'image',
        icon: 'picture-o',
        title: 'Image',
        option: {
            width: 400,
            height: 400,
            name: 'New image',
            src: '/images/sample/transparentBg.png',
        },
    },
];

const SHAPE = [
    // {
    //     key: 'line',
    //     icon: 'picture-o',
    //     title: 'Line',
    // },
    // {
    //     key: 'polygon',
    //     icon: 'picture-o',
    //     title: 'Polygon',
    // },
    {
        key: 'default-triangle',
        type: 'triangle',
        icon: 'picture-o',
        title: 'Triangle',
        option: {
            width: 30,
            height: 30,
            name: 'New shape',
        },
    },
    {
        key: 'default-rect',
        type: 'rect',
        icon: 'picture-o',
        title: 'Rectangle',
        option: {
            width: 40,
            height: 40,
            name: 'New shape',
        },
    },
    {
        key: 'default-circle',
        type: 'circle',
        icon: 'picture-o',
        title: 'Circle',
        option: {
            radius: 30,
            name: 'New shape',
        },
    },
];

class Items extends Component {
    handlers = {
        onClickItem: (item) => {
            const { canvasRef } = this.props;
            const id = uuid();
            const option = Object.assign({}, item.option, { id });
            const newItem = Object.assign({}, item, { option });
            canvasRef.current.handlers.add(newItem);
        },
    }

    static propTypes = {
        canvasRef: PropTypes.any,
    }

    renderItems = (type, items) => (
        <FlexBox flexWrap="wrap">
            {
                items.map(item => (
                    <FlexItem key={item.key} onClick={e => this.handlers.onClickItem(item)} className="rde-item" flex="0 1 auto">
                        <Icon name={item.icon} size={3} />
                        <div className="rde-item-text">
                            {item.title}
                        </div>
                    </FlexItem>
                ))
            }
        </FlexBox>
    )

    render() {
        const showArrow = false;
        return (
            <div>
                <Collapse bordered={false}>
                    <Panel showArrow={showArrow} header="Marker">
                        {this.renderItems('MARKER', MARKER)}
                    </Panel>
                    <Panel showArrow={showArrow} header="Text">
                        {this.renderItems('TEXT', TEXT)}
                    </Panel>
                    <Panel showArrow={showArrow} header="Image">
                        {this.renderItems('IMAGE', IMAGE)}
                    </Panel>
                    <Panel showArrow={showArrow} header="Shape">
                        {this.renderItems('SHAPE', SHAPE)}
                    </Panel>
                </Collapse>
            </div>
        );
    }
}

export default Items;
