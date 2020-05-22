/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

const FlexBox = props => {
	const { element: Element, className, style, children } = props;
	const classProps = {};

	if (className) {
		classProps.className = className;
	}
	return (
		<Element {...classProps} style={{ ...props, ...style }}>
			{children}
		</Element>
	);
};

FlexBox.propTypes = {
	element: PropTypes.oneOf(['article', 'aside', 'div', 'figure', 'footer', 'header', 'main', 'nav', 'section']),
	style: PropTypes.object,
	className: PropTypes.string,
	display: PropTypes.oneOf(['flex', 'inline-flex']),
	flexDirection: PropTypes.oneOf(['column-reverse', 'column', 'row-reverse', 'row']),
	flexWrap: PropTypes.oneOf(['nowrap', 'wrap-reverse', 'wrap']),
	flexFlow: PropTypes.string,
	justifyContent: PropTypes.oneOf([
		'center',
		'flex-end',
		'flex-start',
		'space-around',
		'space-between',
		'space-evenly',
	]),
	alignItems: PropTypes.oneOf(['baseline', 'center', 'flex-end', 'flex-start', 'stretch']),
	alignContent: PropTypes.oneOf(['center', 'flex-end', 'flex-start', 'space-around', 'space-between', 'stretch']),
	order: PropTypes.number,
	flexGrow: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	flexShrink: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	flexBasis: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	flex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	alignSelf: PropTypes.oneOf(['baseline', 'center', 'flex-end', 'flex-start', 'stretch']),
};

FlexBox.defaultProps = {
	element: 'div',
	display: 'flex',
	style: {},
	className: '',
};

export default FlexBox;
