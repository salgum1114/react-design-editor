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
                    <Button className="rde-action-btn" shape="circle">
                        <Icon name="layer-group" />
                    </Button>
                    <div className="rde-canvas-list">
                        <CanvasList canvasRef={canvasRef} selectedItem={selectedItem} />
                    </div>
                </FlexItem>
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-alignment">
                    <Button className="rde-action-btn" shape="circle" onClick={e => canvasRef.current.handlers.bringForward()}>
                        <Icon name="angle-up" />
                    </Button>
                    <Button className="rde-action-btn" shape="circle" onClick={e => canvasRef.current.handlers.sendBackwards()}>
                        <Icon name="angle-down" />
                    </Button>
                    <Button className="rde-action-btn" shape="circle" onClick={e => canvasRef.current.handlers.bringToFront()}>
                        <Icon name="angle-double-up" />
                    </Button>
                    <Button className="rde-action-btn" shape="circle" onClick={e => canvasRef.current.handlers.sendToBack()}>
                        <Icon name="angle-double-down" />
                    </Button>
                    {/* <Button shape="circle"></Button>
                    <Button shape="circle"></Button>
                    <Button shape="circle"></Button> */}
                </FlexItem>
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-interaction">
                    <Button className="rde-action-btn" shape="circle" onClick={e => canvasRef.current.modeHandlers.selection()}>
                        <Icon name="mouse-pointer" />
                    </Button>
                    <Button className="rde-action-btn" shape="circle" onClick={e => canvasRef.current.modeHandlers.grab()}>
                        <Icon name="hand-rock" />
                    </Button>
                    {/* <Button shape="circle"></Button>
                    <Button shape="circle"></Button>
                    <Button shape="circle"></Button> */}
                </FlexItem>
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-alignment">
                    <Button className="rde-action-btn" shape="circle" onClick={() => canvasRef.current.alignmentHandlers.left()}>
                        <Icon name="align-left" />
                    </Button>
                    <Button className="rde-action-btn" shape="circle" onClick={() => canvasRef.current.alignmentHandlers.center()}>
                        <Icon name="align-center" />
                    </Button>
                    <Button className="rde-action-btn" shape="circle" onClick={() => canvasRef.current.alignmentHandlers.right()}>
                        <Icon name="align-right" />
                    </Button>
                    {/* <Button shape="circle"></Button>
                    <Button shape="circle"></Button>
                    <Button shape="circle"></Button> */}
                </FlexItem>
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-group">
                    <Button className="rde-action-btn" shape="circle" onClick={() => canvasRef.current.handlers.duplicate()}>
                        <Icon name="object-group" />
                    </Button>
                    <Button className="rde-action-btn" shape="circle" onClick={() => canvasRef.current.handlers.remove()}>
                        <Icon name="object-ungroup" />
                    </Button>
                </FlexItem>
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-operation">
                    <Button className="rde-action-btn" shape="circle" onClick={() => canvasRef.current.handlers.duplicate()}>
                        <Icon name="clone" />
                    </Button>
                    <Button className="rde-action-btn" shape="circle" onClick={() => canvasRef.current.handlers.remove()}>
                        <Icon name="trash" />
                    </Button>
                </FlexItem>
                <FlexItem className="rde-canvas-toolbar rde-canvas-toolbar-history">
                    <Button className="rde-action-btn">
                        <Icon name="undo-alt" style={{ marginRight: 8 }} />Undo
                    </Button>
                    <Button className="rde-action-btn">
                        Redo<Icon name="redo-alt" style={{ marginLeft: 8 }} />
                    </Button>
                </FlexItem>
            </FlexBox>
        );
    }
}

export default HeaderToolbar;
