import React, { Component } from 'react';
import { Button, Divider } from 'antd';

import Icon from './Icon';
import { FlexBox, FlexItem } from './flex';

class CanvasList extends Component {
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
        return (
            <React.Fragment>
                <FlexItem className="rde-canvas-list-item" flex="1">
                    <FlexBox alignItems="center">
                        <Icon className="rde-canvas-list-item-icon" name="map-marker" size={1.5} style={{ width: 32 }} />
                        <div className="rde-canvas-list-item-text">Marker #1</div>
                        <FlexBox className="rde-canvas-list-item-actions" flex="1" justifyContent="flex-end">
                            <Button shape="circle">
                                <Icon name="clone" />
                            </Button>
                            <Button shape="circle">
                                <Icon name="trash" />
                            </Button>
                        </FlexBox>
                    </FlexBox>
                </FlexItem>
                <FlexItem className="rde-canvas-list-item" flex="1">
                    <FlexBox alignItems="center">
                        <Icon className="rde-canvas-list-item-icon" name="picture-o" size={1.5} style={{ width: 32 }} />
                        <div className="rde-canvas-list-item-text">Image #1</div>
                        <FlexBox className="rde-canvas-list-item-actions" flex="1" justifyContent="flex-end">
                            <Button shape="circle">
                                <Icon name="clone" />
                            </Button>
                            <Button shape="circle">
                                <Icon name="trash" />
                            </Button>
                        </FlexBox>
                    </FlexBox>
                </FlexItem>
            </React.Fragment>
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
