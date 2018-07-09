import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

import Icon from './Icon';
import { FlexBox, FlexItem } from './flex';

class CanvasList extends Component {
    static propTypes = {
        canvasRef: PropTypes.any,
        selectedItem: PropTypes.object,
    }

    renderActions = () => {
        const { canvasRef } = this.props;
        return (
            <FlexItem className="rde-canvas-list-actions" flex="0 1 auto">
                <FlexBox justifyContent="space-between" alignItems="center">
                    <FlexBox flex="1" justifyContent="center">
                        <Button style={{ width: '100%', height: 30 }} onClick={e => canvasRef.current.handlers.sendBackwards()}>
                            <Icon name="arrow-up" />
                        </Button>
                    </FlexBox>
                    <FlexBox flex="1" justifyContent="center">
                        <Button style={{ width: '100%', height: 30 }} onClick={e => canvasRef.current.handlers.bringForward()}>
                            <Icon name="arrow-down" />
                        </Button>
                    </FlexBox>
                </FlexBox>
            </FlexItem>
        );
    }

    renderItem = () => {
        const { canvasRef, selectedItem } = this.props;
        return canvasRef.current ? (
            canvasRef.current.canvas.getObjects().filter(obj => obj.type !== 'map').map((obj) => {
                let icon;
                let title = '';
                if (obj.type === 'i-text') {
                    icon = 'map-marker';
                    title = 'Marker';
                } else if (obj.type === 'textbox') {
                    icon = 'font';
                    title = 'Text';
                } else if (obj.type === 'image') {
                    icon = 'picture-o';
                    title = 'Image';
                } else if (obj.type === 'triangle') {
                    icon = 'picture-o';
                    title = 'Triangle';
                } else if (obj.type === 'rect') {
                    icon = 'picture-o';
                    title = 'Rect';
                } else if (obj.type === 'circle') {
                    icon = 'picture-o';
                    title = 'Circle';
                } else if (obj.type === 'polygon') {
                    icon = 'picture-o';
                    title = 'Polygon';
                } else if (obj.type === 'line') {
                    icon = 'picture-o';
                    title = 'Line';
                } else {
                    icon = 'picture-o';
                    title = 'Default';
                }
                let className = 'rde-canvas-list-item';
                if (selectedItem && selectedItem.id === obj.id) {
                    className += ' selected-item';
                }
                return (
                    <FlexItem key={obj.id} className={className} flex="1" onClick={() => canvasRef.current.handlers.select(obj)}>
                        <FlexBox alignItems="center">
                            <Icon className="rde-canvas-list-item-icon" name={icon} size={1.5} style={{ width: 32 }} />
                            <div className="rde-canvas-list-item-text">
                                {title}
                            </div>
                            <FlexBox className="rde-canvas-list-item-actions" flex="1" justifyContent="flex-end">
                                <Button shape="circle" onClick={(e) => { e.stopPropagation(); canvasRef.current.handlers.duplicateById(obj.id); }}>
                                    <Icon name="clone" />
                                </Button>
                                <Button shape="circle" onClick={(e) => { e.stopPropagation(); canvasRef.current.handlers.removeById(obj.id); }}>
                                    <Icon name="trash" />
                                </Button>
                            </FlexBox>
                        </FlexBox>
                    </FlexItem>
                );
            })
        ) : null;
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
