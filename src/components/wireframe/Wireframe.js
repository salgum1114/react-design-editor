import React, { Component } from 'react';
import { FlexBox } from '../flex';

class Wireframe extends Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
    }

    render() {
        const { canvasRef: { current } } = this.props;
        if (current) {
            return (
                <FlexBox flexDirection="column">
                    <div ref={this.container} flex="0 1 auto" style={{ margin: 8 }}>
                        <img width="144" height="150" src={current.handlers.exportPNG()} />
                    </div>
                </FlexBox>
            );
        }
        return null;
    }
}

export default Wireframe;
