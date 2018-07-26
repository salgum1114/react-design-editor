import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Icon extends Component {
    static propTypes = {
        name: PropTypes.string,
        color: PropTypes.string,
        style: PropTypes.object,
        className: PropTypes.string,
        size: PropTypes.number,
        innerIcon: PropTypes.string,
        innerColor: PropTypes.string,
        innerClassName: PropTypes.string,
        innerSize: PropTypes.number,
        prefix: PropTypes.string,
    };

    static defaultProps = {
        name: null,
        color: '',
        className: '',
        size: 1,
        innerIcon: null,
        innerColor: '',
        innerClassName: '',
        innerSize: 1,
        prefix: 'fas',
    };

    getIconHtml = (prefix, name, className, size, color) => {
        const iconClassName = `${prefix} fa-${name} ${className}`;
        const iconStyle = Object.assign({}, this.props.style, {
            fontSize: `${size}em`,
            color,
        });
        return (<i className={iconClassName} style={iconStyle} />);
    }

    render() {
        const { color, size, className, innerIcon, innerColor, innerSize, innerClassName, prefix } = this.props;
        let { name } = this.props;
        if (name.startsWith('icon-')) {
            name = name.substr('icon-'.length);
        }
        const iconHtml = this.getIconHtml(prefix, name, className, size, color);
        let innerIconHtml = null;
        if (innerIcon) {
            innerIconHtml = this.getIconHtml(innerIcon, innerClassName, innerSize, innerColor);
        } else {
            return iconHtml;
        }
        return (
            <span className="fa-stack">
                {iconHtml}
                {innerIconHtml}
            </span>
        );
    }
}

export default Icon;
