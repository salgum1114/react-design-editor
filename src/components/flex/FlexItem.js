/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

const FlexItem = (props) => {
    const { element: Element, className, style, children, onClick } = props;
    const classProps = {
    };

    if (className) {
        classProps.className = className;
    }
    return (
        <Element
            {...classProps}
            onClick={onClick}
            style={{ ...props, ...style }}
        >
            {children}
        </Element>
    );
};

FlexItem.propTypes = {
    element: PropTypes.oneOf([
        'article',
        'aside',
        'div',
        'figure',
        'footer',
        'header',
        'main',
        'nav',
        'section',
    ]),
    style: PropTypes.object,
    className: PropTypes.string,
    order: PropTypes.number,
    flexGrow: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    flexShrink: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    flexBasis: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    flex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    alignSelf: PropTypes.oneOf(['baseline', 'center', 'flex-end', 'flex-start', 'stretch']),
};

FlexItem.defaultProps = {
    element: 'div',
    style: {},
    className: '',
};


export default FlexItem;
