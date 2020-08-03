import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'antd';

import { Flex } from '../../flex';
import DataSourceModal from './DataSourceModal';
import DataSourceList from './DataSourceList';
import Icon from '../../icon/Icon';

class DataSources extends Component {
	static propTypes = {
		dataSources: PropTypes.array,
	};

	static defaultProps = {
		dataSources: [],
	};

	constructor(props) {
		super(props);
		this.canvasRef = React.createRef();
	}

	state = {
		dataSource: {},
		visible: false,
		validateTitle: {
			validateStatus: '',
			help: '',
		},
		current: 'add',
	};

	handlers = {
		onOk: () => {
			if (this.state.validateTitle.validateStatus === 'error') {
				return;
			}
			if (!this.state.dataSource.title) {
				this.setState({
					validateTitle: this.handlers.onValid(),
				});
				return;
			}
			if (this.state.current === 'add') {
				if (Object.keys(this.state.dataSource).length === 1) {
					this.modalRef.validateFields((err, values) => {
						Object.assign(this.state.dataSource, values);
					});
				}
				this.props.dataSources.push(this.state.dataSource);
			} else {
				this.props.dataSources.splice(this.state.index, 1, this.state.dataSource);
			}
			this.setState(
				{
					visible: false,
					dataSource: {},
				},
				() => {
					this.props.onChangeDataSources(this.props.dataSources);
				},
			);
		},
		onCancel: () => {
			this.setState({
				visible: false,
				dataSource: {},
				validateTitle: {
					validateStatus: '',
					help: '',
				},
			});
		},
		onAdd: () => {
			this.setState({
				visible: true,
				dataSource: {},
				validateTitle: {
					validateStatus: '',
					help: '',
				},
				current: 'add',
			});
		},
		onEdit: (dataSource, index) => {
			this.setState({
				visible: true,
				dataSource,
				validateTitle: {
					validateStatus: '',
					help: '',
				},
				current: 'modify',
				index,
			});
		},
		onDelete: index => {
			this.props.dataSources.splice(index, 1);
			this.props.onChangeDataSources(this.props.dataSources);
		},
		onClear: () => {
			this.props.onChangeDataSources([]);
		},
		onChange: (props, changedValues, allValues) => {
			const field = Object.keys(changedValues)[0];
			const isTitle = field === 'title';
			if (isTitle) {
				this.setState({
					validateTitle: this.handlers.onValid(changedValues[field]),
				});
			}
			this.setState({
				dataSource: { title: this.state.dataSource.title, ...allValues },
			});
		},
		onValid: value => {
			if (!value || !value.length) {
				return {
					validateStatus: 'error',
					help: 'Please input title.',
				};
			}
			const exist = this.props.dataSources.some(dataSource => dataSource.title === value);
			if (!exist) {
				return {
					validateStatus: 'success',
					help: '',
				};
			}
			return {
				validateStatus: 'error',
				help: 'Already exist title.',
			};
		},
	};

	render() {
		const { dataSources } = this.props;
		const { visible, dataSource, validateTitle } = this.state;
		const { onOk, onCancel, onAdd, onEdit, onDelete, onClear, onChange, onValid } = this.handlers;
		return (
			<Form>
				<Flex flexDirection="column">
					<Flex justifyContent="flex-end" style={{ padding: 8 }}>
						<Button className="rde-action-btn" shape="circle" onClick={onAdd}>
							<Icon name="plus" />
						</Button>
						<Button className="rde-action-btn" shape="circle" onClick={onClear}>
							<Icon name="times" />
						</Button>
						<DataSourceModal
							ref={c => {
								this.modalRef = c;
							}}
							validateTitle={validateTitle}
							visible={visible}
							onOk={onOk}
							dataSource={dataSource}
							onCancel={onCancel}
							onChange={onChange}
							onValid={onValid}
						/>
					</Flex>
					<DataSourceList dataSources={dataSources} onEdit={onEdit} onDelete={onDelete} />
				</Flex>
			</Form>
		);
	}
}

export default DataSources;
