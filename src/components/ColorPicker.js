import React, { Component } from 'react';
import { Popover, Button } from 'antd';
import { SketchPicker } from 'react-color';

class ColorPicker extends Component {
    handlers = {
        onChange: (color) => {
            const { onChange } = this.props;
            this.setState({
                color: `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`,
            }, () => {
                onChange(`rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`);
            });
        },
    }

    state = {
        color: this.props.value || '#fff',
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            color: nextProps.value || this.state.value,
        });
    }

    render() {
        const { color } = this.state;
        const { onChange } = this.handlers;
        return (
            <Popover
                trigger="click"
                placement="bottom"
                content={<SketchPicker color={color} onChange={onChange} />}
            >
                <Button style={{ background: color }} shape="circle" />
            </Popover>
        );
    }
}

export default ColorPicker;
