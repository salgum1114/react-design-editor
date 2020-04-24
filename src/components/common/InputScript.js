import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactAce from 'react-ace';
import debounce from 'lodash/debounce';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';

class InputScript extends Component {
	static propTypes = {
		defaultValue: PropTypes.string,
		value: PropTypes.string,
		width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		onChange: PropTypes.func,
		onValidate: PropTypes.func,
		disabled: PropTypes.bool,
	};

	static defaultProps = {
		width: '100%',
		height: '200px',
		disabled: false,
	};

	state = {
		text: this.props.value || '',
	};

	componentDidMount() {
		this.debouncedValidate = debounce(errors => {
			const { onValidate } = this.props;
			if (onValidate) {
				onValidate(errors);
			}
			const { onChange } = this.props;
			if (onChange) {
				onChange(this.state.text);
			}
		}, 200);
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if (nextProps.value !== this.props.value) {
			this.setState({
				text: nextProps.value,
			});
		}
	}

	onChange = (value, e) => {
		if (this.debouncedValidate) {
			this.debouncedValidate();
		}
		this.setState({
			text: value,
		});
	};

	onValidate = annotations => {
		if (annotations.length) {
			const errors = annotations
				.filter(annotation => annotation.type === 'error')
				.map(annotation => {
					return new Error(`${annotation.row}:${annotation.column} ${annotation.text} error`);
				});
			this.debouncedValidate(errors);
		}
	};

	render() {
		const { defaultValue, width, height, dsiabled } = this.props;
		const { text } = this.state;
		return (
			<ReactAce
				ref={c => {
					this.aceRef = c;
				}}
				mode="javascript"
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
				readOnly={dsiabled}
			/>
		);
	}
}

export default InputScript;
