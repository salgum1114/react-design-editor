import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Icon extends Component {
    static propTypes = {
        icon: PropTypes.string,
        color: PropTypes.string,
        style: PropTypes.object,
        className: PropTypes.string,
        size: PropTypes.number,
        innerIcon: PropTypes.string,
        innerColor: PropTypes.string,
        innerClassName: PropTypes.string,
        innerSize: PropTypes.number,
        widthFix: PropTypes.number,
    };

    static defaultProps = {
        icon: null,
        color: '',
        className: '',
        size: 1,
        innerIcon: null,
        innerColor: '',
        innerClassName: '',
        innerSize: 1,
        widthFix: null,
    };

    getIconHtml = (icon, className, size, color) => {
        const iconClassName = `fa fa-${icon} ${className}`;
        const iconStyle = Object.assign({}, this.props.style, {
            fontSize: `${size}em`,
            color,
        });
        return (<i className={iconClassName} style={iconStyle} />);
    }

    render() {
        const { color, size, className, innerIcon, innerColor, innerSize, innerClassName, widthFix } = this.props;
        let { icon } = this.props;
        if (icon.startsWith('icon-')) {
            icon = icon.substr('icon-'.length);
        }
        // const spanWidth = widthFix ? { width: `${widthFix}px` } : { width: '100%' };

        const iconHtml = this.getIconHtml(icon, className, size, color);
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
