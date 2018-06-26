import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'antd';
import { FlexBox, FlexItem } from './flex';

import Icon from './Icon';

const { Panel } = Collapse;

const MARKER = [
    {
        key: 'default',
        icon: 'map-marker',
        title: 'Marker',
    },
];

const TEXT = [
    {
        key: 'default',
        icon: 'font',
        title: 'Text',
    },
];

const IMAGE = [
    {
        key: 'default',
        icon: 'picture-o',
        title: 'Image',
    },
];

const DRAWING = [
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
        key: 'triangle',
        icon: 'picture-o',
        title: 'Triangle',
    },
    {
        key: 'rect',
        icon: 'picture-o',
        title: 'Rectangle',
    },
    {
        key: 'circle',
        icon: 'picture-o',
        title: 'Circle',
    },
];

class Items extends Component {
    static propTypes = {
        onAdd: PropTypes.func,
    }

    handlers = {
        onClickItem: (type, key) => {
            const { onAdd } = this.props;
            onAdd(type, key);
        },
    }

    renderItems = (type, items) => (
        <FlexBox flexWrap="wrap">
            {
                items.map(item => (
                    <FlexItem key={item.key} onClick={e => this.handlers.onClickItem(type, item.key)} className="rde-item" flex="0 1 auto">
                        <Icon icon={item.icon} size={3} />
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
            <div className="rde-items">
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
                    <Panel showArrow={showArrow} header="Drawing">
                        {this.renderItems('DRAWING', DRAWING)}
                    </Panel>
                </Collapse>
            </div>
        );
    }
}

export default Items;
