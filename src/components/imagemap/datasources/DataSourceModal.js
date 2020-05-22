import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input } from 'antd';

import Canvas from '../../canvas/Canvas';
import DataSourceProperty from '../properties/DataSourceProperty';

class DataSourceModal extends Component {
	static propTypes = {
		form: PropTypes.any,
		visible: PropTypes.bool,
		animation: PropTypes.object,
		onOk: PropTypes.func,
		onCancel: PropTypes.func,
	};

	state = {
		width: 150,
		height: 150,
	};

	componentDidMount() {
		this.waitForContainerRender(this.containerRef);
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		nextProps.form.resetFields();
	}

	waitForContainerRender = (container) => {
		setTimeout(() => {
			if (container) {
				this.setState({
					width: container.clientWidth,
					height: container.clientHeight,
				});
				return;
			}
			this.waitForContainerRender(this.containerRef);
		}, 5);
	};

	render() {
		const { form, visible, animation, onOk, onCancel, validateTitle, onChange } = this.props;
		const { width, height } = this.state;
		return (
			<Modal onOk={onOk} onCancel={onCancel} visible={visible}>
				<Form.Item
					label="Title"
					required
					colon={false}
					hasFeedback
					help={validateTitle.help}
					validateStatus={validateTitle.validateStatus}
				>
					<Input
						value={animation.title}
						onChange={(e) => {
							onChange(
								null,
								{ animation: { title: e.target.value } },
								{ animation: { ...animation, title: e.target.value } },
							);
						}}
					/>
				</Form.Item>
				{DataSourceProperty.render(this.canvasRef, form, { animation })}
				<div
					ref={(c) => {
						this.containerRef = c;
					}}
				>
					<Canvas ref={this.canvasRef} editable={false} width={width} height={height} />
				</div>
			</Modal>
		);
	}
}

export default Form.create({
	onValuesChange: (props, changedValues, allValues) => {
		const { onChange } = props;
		onChange(props, changedValues, allValues);
	},
})(DataSourceModal);
