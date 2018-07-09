import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

import Icon from './Icon';
import { FlexBox, FlexItem } from './flex';
import CanvasList from './CanvasList';

class HeaderToolbar extends Component {
    static propTypes = {
        canvasRef: PropTypes.any,
        selectedItem: PropTypes.object,
    }

    render() {
        const { canvasRef, selectedItem } = this.props;
        return (
            <FlexBox className="rde-canvas-toolbar-container" flex="1">
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-list">
                    <Button className="rde-canvas-toolbar-list-btn" shape="circle">
                        <Icon name="sitemap" />
                    </Button>
                    <div className="rde-canvas-list">
                        <CanvasList canvasRef={canvasRef} selectedItem={selectedItem} />
                    </div>
                </FlexItem>
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-alignment">
                    <Button shape="circle" onClick={e => canvasRef.current.handlers.sendBackwards()}>
                        <Icon name="arrow-up" />
                    </Button>
                    <Button shape="circle" onClick={e => canvasRef.current.handlers.bringForward()}>
                        <Icon name="arrow-down" />
                    </Button>
                    {/* <Button shape="circle"></Button>
                    <Button shape="circle"></Button>
                    <Button shape="circle"></Button> */}
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
                    {/* <Button shape="circle"></Button>
                    <Button shape="circle"></Button>
                    <Button shape="circle"></Button> */}
                </FlexItem>
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-operation">
                    <Button shape="circle" onClick={() => canvasRef.current.handlers.duplicate()}>
                        <Icon name="clone" />
                    </Button>
                    <Button shape="circle" onClick={() => canvasRef.current.handlers.remove()}>
                        <Icon name="trash" />
                    </Button>
                </FlexItem>
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-history">
                    <Button>
                        <Icon name="rotate-left" style={{ marginRight: 8 }} />Undo
                    </Button>
                    <Button>
                        Redo<Icon name="rotate-right" style={{ marginLeft: 8 }} />
                    </Button>
                </FlexItem>
            </FlexBox>
        );
    }
}

export default HeaderToolbar;
