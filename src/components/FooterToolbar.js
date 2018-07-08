import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Switch } from 'antd';

import Icon from './Icon';
import { FlexBox, FlexItem } from './flex';

class FooterToolbar extends Component {
    static propTypes = {
        canvasRef: PropTypes.any,
    }

    render() {
        const { canvasRef } = this.props;
        return (
            <FlexBox className="rde-canvas-toolbar-container" flex="1">
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-zoom">
                    <Button shape="circle" onClick={e => canvasRef.current.zoomOut()}>
                        <Icon name="search-minus" />
                    </Button>
                    <div>100%</div>
                    <Button shape="circle" onClick={e => canvasRef.current.zoomIn()}>
                        <Icon name="search-plus" />
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
                    <span style={{ marginRight: 8 }}>Preview</span>
                    <Switch />
                </FlexItem>
            </FlexBox>
        );
    }
}

export default FooterToolbar;
