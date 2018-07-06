import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

import Icon from './Icon';
import { FlexBox, FlexItem } from './flex';

class CanvasList extends Component {
    static propTypes = {
        canvasRef: PropTypes.any,
        items: PropTypes.object,
        selectedItem: PropTypes.object,
    }

    renderActions = () => {
        return (
            <FlexItem className="rde-canvas-list-actions" flex="0 1 auto">
                <FlexBox justifyContent="space-between" alignItems="center">
                    <FlexBox flex="1" justifyContent="center">
                        <Button style={{ width: '100%', height: 30 }}>
                            <Icon name="arrow-up" />
                        </Button>
                    </FlexBox>
                    <FlexBox flex="1" justifyContent="center">
                        <Button style={{ width: '100%', height: 30 }}>
                            <Icon name="arrow-down" />
                        </Button>
                    </FlexBox>
                </FlexBox>
            </FlexItem>
        );
    }

    renderItem = () => {
        const { canvasRef, items, selectedItem } = this.props;
        return (
            Object.values(items).map((item) => {
                let icon;
                let title = '';
                if (item.type === 'i-text') {
                    icon = 'map-marker';
                    title = 'Marker';
                } else if (item.type === 'textbox') {
                    icon = 'font';
                    title = 'Text';
                } else if (item.type === 'image') {
                    icon = 'picture-o';
                    title = 'Image';
                } else if (item.type === 'triangle') {
                    icon = 'picture-o';
                    title = 'Triangle';
                } else if (item.type === 'rect') {
                    icon = 'picture-o';
                    title = 'Rect';
                } else if (item.type === 'circle') {
                    icon = 'picture-o';
                    title = 'Circle';
                } else if (item.type === 'polygon') {
                    icon = 'picture-o';
                    title = 'Polygon';
                } else if (item.type === 'line') {
                    icon = 'picture-o';
                    title = 'Line';
                }
                let className = 'rde-canvas-list-item';
                if (selectedItem && selectedItem.id === item.id) {
                    className += ' selected-item';
                }
                return (
                    <FlexItem key={item.id} className={className} flex="1" onClick={() => canvasRef.current.handlers.select(item)}>
                        <FlexBox alignItems="center">
                            <Icon className="rde-canvas-list-item-icon" name={icon} size={1.5} style={{ width: 32 }} />
                            <div className="rde-canvas-list-item-text">
                                {title}
                            </div>
                            <FlexBox className="rde-canvas-list-item-actions" flex="1" justifyContent="flex-end">
                                <Button shape="circle" onClick={(e) => { e.stopPropagation(); canvasRef.current.handlers.duplicateById(item.id); }}>
                                    <Icon name="clone" />
                                </Button>
                                <Button shape="circle" onClick={(e) => { e.stopPropagation(); canvasRef.current.handlers.removeById(item.id); }}>
                                    <Icon name="trash" />
                                </Button>
                            </FlexBox>
                        </FlexBox>
                    </FlexItem>
                );
            })
        );
    }

    render() {
        return (
            <FlexBox style={{ height: '100%' }} flexDirection="column">
                {this.renderActions()}
                <div className="rde-canvas-list-items">
                    {this.renderItem()}
                </div>
            </FlexBox>
        );
    }
}

export default CanvasList;
