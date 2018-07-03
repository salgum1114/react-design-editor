import React, { Component } from 'react';
import { Popover, Button } from 'antd';
import { SketchPicker } from 'react-color';

class ColorPicker extends Component {
    handlers = {
        onChange: (color) => {
            const { onChange } = this.props;
            const { type } = this.props['data-__meta'].rules[0];
            let newColor;
            if (type === 'hex') {
                newColor = color.hex;
            } else if (type === 'rgb') {
                newColor = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
            } else if (type === 'rgba') {
                newColor = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
            } else {
                newColor = color;
            }
            this.setState({
                color: newColor,
            }, () => {
                onChange(newColor);
            });
        },
    }

    state = {
        color: this.props.value,
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
