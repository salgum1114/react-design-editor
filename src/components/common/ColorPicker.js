import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, Button } from 'antd';
import { SketchPicker } from 'react-color';

class ColorPicker extends Component {
    static propTypes = {
        valueType: PropTypes.oneOf([
            'string',
            'object',
        ]),
    }

    static defaultProps = {
        valueType: 'string',
    }

    handlers = {
        onChange: (color) => {
            const { onChange, valueType } = this.props;
            let newColor;
            if (valueType === 'string') {
                newColor = `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`;
            } else {
                newColor = color.rgb;
            }
            this.setState({
                color: newColor,
            }, () => {
                onChange(newColor);
            });
        },
    }

    state = {
        color: this.props.value || 'rgba(255, 255, 255, 1)',
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({
            color: nextProps.value || this.state.color,
        });
    }

    getBackgroundColor = (color) => {
        if (typeof color === 'string') {
            return color;
        }
        return `rgba(${color.r},${color.g},${color.b},${color.a})`;
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
                <Button style={{ background: this.getBackgroundColor(color) }} shape="circle" />
            </Popover>
        );
    }
}

export default ColorPicker;
