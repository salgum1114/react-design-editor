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
        const idCropping = canvasRef.current ? canvasRef.current.interactionMode === 'crop' : false;
        return (
            <FlexItem className="rde-canvas-list-actions" flex="0 1 auto">
                <FlexBox justifyContent="space-between" alignItems="center">
                    <FlexBox flex="1" justifyContent="center">
                        <Button className="rde-action-btn" style={{ width: '100%', height: 30 }} disabled={idCropping} onClick={e => canvasRef.current.handlers.sendBackwards()}>
                            <Icon name="arrow-up" />
                        </Button>
                    </FlexBox>
                    <FlexBox flex="1" justifyContent="center">
                        <Button className="rde-action-btn" style={{ width: '100%', height: 30 }} disabled={idCropping} onClick={e => canvasRef.current.handlers.bringForward()}>
                            <Icon name="arrow-down" />
                        </Button>
                    </FlexBox>
                </FlexBox>
            </FlexItem>
        );
    }

    renderItem = () => {
        const { canvasRef, selectedItem } = this.props;
        const idCropping = canvasRef.current ? canvasRef.current.interactionMode === 'crop' : false;
        return canvasRef.current ? (
            canvasRef.current.canvas.getObjects().filter((obj) => {
                if (obj.id === 'workarea') {
                    return false;
                }
                if (obj.id) {
                    return true;
                }
                return false;
            }).map((obj) => {
                let icon;
                let title = '';
                let prefix = 'fas';
                if (obj.type === 'i-text') {
                    icon = 'map-marker-alt';
                    title = 'Marker';
                } else if (obj.type === 'textbox') {
                    icon = 'font';
                    title = 'Text';
                } else if (obj.type === 'image') {
                    icon = 'image';
                    title = 'Image';
                } else if (obj.type === 'triangle') {
                    icon = 'image';
                    title = 'Triangle';
                } else if (obj.type === 'rect') {
                    icon = 'image';
                    title = 'Rect';
                } else if (obj.type === 'circle') {
                    icon = 'circle';
                    title = 'Circle';
                } else if (obj.type === 'polygon') {
                    icon = 'draw-polygon';
                    title = 'Polygon';
                } else if (obj.type === 'line') {
                    icon = 'image';
                    title = 'Line';
                } else if (obj.type === 'element') {
                    icon = 'html5';
                    title = 'Element';
                    prefix = 'fab';
                } else if (obj.type === 'iframe') {
                    icon = 'window-maximize';
                    title = 'iframe';
                } else if (obj.type === 'video') {
                    icon = 'video';
                    title = 'Video';
                } else {
                    icon = 'image';
                    title = 'Default';
                }
                let className = 'rde-canvas-list-item';
                if (selectedItem && selectedItem.id === obj.id) {
                    className += ' selected-item';
                }
                return (
                    <FlexItem key={obj.id} className={className} flex="1" onClick={() => canvasRef.current.handlers.select(obj)}>
                        <FlexBox alignItems="center">
                            <Icon className="rde-canvas-list-item-icon" name={icon} size={1.5} style={{ width: 32 }} prefix={prefix} />
                            <div className="rde-canvas-list-item-text">
                                {title}
                            </div>
                            <FlexBox className="rde-canvas-list-item-actions" flex="1" justifyContent="flex-end">
                                <Button className="rde-action-btn" shape="circle" disabled={idCropping} onClick={(e) => { e.stopPropagation(); canvasRef.current.handlers.duplicateById(obj.id); }}>
                                    <Icon name="clone" />
                                </Button>
                                <Button className="rde-action-btn" shape="circle" disabled={idCropping} onClick={(e) => { e.stopPropagation(); canvasRef.current.handlers.removeById(obj.id); }}>
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
