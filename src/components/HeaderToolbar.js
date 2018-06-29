import React, { Component } from 'react';
import { Button } from 'antd';

import Icon from './Icon';
import { FlexBox, FlexItem } from './flex';
import CanvasList from './CanvasList';

class HeaderToolbar extends Component {
    render() {
        return (
            <FlexBox className="rde-canvas-toolbar-container" flex="1">
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-list">
                    <Button className="rde-canvas-toolbar-list-btn" shape="circle">
                        <Icon name="sitemap" />
                    </Button>
                    <div className="rde-canvas-list">
                        <CanvasList />
                    </div>
                </FlexItem>
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-alignment">
                    <Button shape="circle">
                        <Icon name="align-left" />
                    </Button>
                    <Button shape="circle">
                        <Icon name="align-center" />
                    </Button>
                    <Button shape="circle">
                        <Icon name="align-right" />
                    </Button>
                    <Button shape="circle"></Button>
                    <Button shape="circle"></Button>
                    <Button shape="circle"></Button>
                </FlexItem>
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-operation">
                    <Button shape="circle">
                        <Icon name="clone" />
                    </Button>
                    <Button shape="circle">
                        <Icon name="trash" />
                    </Button>
                </FlexItem>
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-history">
                    <Button>
                        <Icon name="rotate-left" />Undo
                    </Button>
                    <Button>
                        Redo<Icon name="rotate-right" />
                    </Button>
                </FlexItem>
            </FlexBox>
        );
    }
}

export default HeaderToolbar;
