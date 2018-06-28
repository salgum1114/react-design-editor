import React, { Component } from 'react';
import { Button, Switch } from 'antd';

import Icon from './Icon';
import { FlexBox, FlexItem } from './flex';

class FooterToolbar extends Component {
    render() {
        return (
            <FlexBox className="rde-canvas-toolbar-container" flex="1">
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-zoom">
                    <Button shape="circle">
                        <Icon name="search-plus" />
                    </Button>
                    <div>100%</div>
                    <Button shape="circle">
                        <Icon name="search-minus" />
                    </Button>
                </FlexItem>
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-pager">
                    <Button shape="circle">
                        <Icon name="angle-left" />
                    </Button>
                    <div>1 / 1</div>
                    <Button shape="circle">
                        <Icon name="angle-right" />
                    </Button>
                </FlexItem>
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-action">
                    <span>Preview</span>
                    <Switch />
                </FlexItem>
            </FlexBox>
        );
    }
}

export default FooterToolbar;
