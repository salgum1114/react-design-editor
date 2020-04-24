import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactAce from 'react-ace';

import 'ace-builds/src-noconflict/mode-handlebars';
import 'ace-builds/src-noconflict/theme-github';

class InputTemplate extends Component {
	static propTypes = {
		defaultValue: PropTypes.string,
		value: PropTypes.string,
		width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		showLineNumbers: PropTypes.bool,
		newLineMode: PropTypes.bool,
		disabled: PropTypes.bool,
	};

	static defaultProps = {
		width: '100%',
		height: '200px',
		showLineNumbers: true,
		newLineMode: true,
		disabled: false,
	};

	state = {
		text: this.props.value || '',
	};

	componentDidMount() {
		if (!this.props.newLineMode) {
			this.aceRef.editor.keyBinding.addKeyboardHandler((data, hashId, keyString, keyCode, e) => {
				if (keyCode === 13) {
					return { command: 'null' }; // do nothing
				}
			});
		}
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		this.setState({
			text: nextProps.value,
		});
	}

	onChange = value => {
		const { onChange } = this.props;
		if (onChange) {
			onChange(value);
		}
		this.setState({
			text: value,
		});
	};

	render() {
		const { defaultValue, width, height, showLineNumbers, newLineMode, disabled } = this.props;
		const { text } = this.state;
		return (
			<ReactAce
				ref={c => {
					this.aceRef = c;
				}}
				mode="handlebars"
				theme="github"
				width={width}
				height={height}
				defaultValue={defaultValue || text}
				value={text}
				editorProps={{
					$blockScrolling: true,
				}}
				onChange={this.onChange}
				onValidate={this.onValidate}
				maxLines={!newLineMode ? 1 : null}
				setOptions={{
					showLineNumbers,
					newLineMode,
					readOnly: disabled,
				}}
			/>
		);
	}
}

export default InputTemplate;
