import { Button, Form, Input, Modal, Table } from 'antd';
import React from 'react';

import i18next from 'i18next';
import { Flex } from '../flex';
import Icon from '../icon/Icon';

interface EditTableProps {
	value?: Record<string, string>;
	userProperty?: Record<string, string>;
	form?: any;
	onChange?: (userProperty: Record<string, string>) => void;
}

interface EditTableState {
	userProperty: Record<string, string>;
	tempKey: string;
	originKey: string;
	tempValue: string;
	visible: boolean;
	current: 'add' | 'modify';
	validateStatus: '' | 'success' | 'error';
	help: string;
}

class EditTable extends React.Component<EditTableProps, EditTableState> {
	getCurrentValue = () => this.props.value || this.props.userProperty || {};

	state: EditTableState = {
		userProperty: this.getCurrentValue(),
		tempKey: '',
		originKey: '',
		tempValue: '',
		visible: false,
		current: 'add',
		validateStatus: '',
		help: '',
	};

	componentDidUpdate(prevProps: EditTableProps) {
		if (prevProps.value !== this.props.value || prevProps.userProperty !== this.props.userProperty) {
			this.setState({
				userProperty: this.getCurrentValue(),
			});
		}
	}

	getDataSource = (userProperty: Record<string, string>) => {
		return Object.keys(userProperty).map(key => ({
			key,
			value: userProperty[key],
		}));
	};

	handlers = {
		onOk: () => {
			const { tempKey, originKey, tempValue, current, validateStatus, userProperty } = this.state;
			if (validateStatus === 'error') {
				return;
			}

			const nextUserProperty = { ...userProperty };
			if (current === 'modify') {
				delete nextUserProperty[originKey];
			}
			nextUserProperty[tempKey] = tempValue;
			this.props.onChange?.(nextUserProperty);
			this.setState({
				visible: false,
				userProperty: nextUserProperty,
			});
		},
		onCancel: () => {
			this.modalHandlers.onHide();
		},
		onChangeKey: (value: string) => {
			const { current, userProperty, originKey } = this.state;
			let validateStatus: EditTableState['validateStatus'] = 'success';
			let help = '';

			if (
				(current === 'add' && Object.keys(userProperty).some(property => property === value)) ||
				(current === 'modify' && originKey !== value && userProperty[value])
			) {
				validateStatus = 'error';
				help = i18next.t('validation.already-property', { arg: i18next.t('common.key') });
			} else if (!value.length) {
				validateStatus = 'error';
				help = i18next.t('validation.enter-property', { arg: i18next.t('common.key') });
			}

			this.setState({ tempKey: value, validateStatus, help });
		},
	};

	modalHandlers = {
		onShow: () => {
			this.setState({ visible: true });
		},
		onHide: () => {
			this.setState({ visible: false });
		},
	};

	handleAdd = () => {
		this.setState({
			visible: true,
			tempKey: '',
			tempValue: '',
			current: 'add',
			validateStatus: '',
			help: '',
		});
	};

	handleEdit = (key: string) => {
		this.setState(prevState => ({
			visible: true,
			tempKey: key,
			originKey: key,
			tempValue: prevState.userProperty[key],
			current: 'modify',
			validateStatus: '',
			help: '',
		}));
	};

	handleDelete = (key: string) => {
		this.setState(prevState => {
			const nextUserProperty = { ...prevState.userProperty };
			delete nextUserProperty[key];
			this.props.onChange?.(nextUserProperty);
			return { userProperty: nextUserProperty };
		});
	};

	handleClear = () => {
		this.props.onChange?.({});
		this.setState({ userProperty: {} });
	};

	render() {
		const { userProperty, tempKey, tempValue, visible, validateStatus, help } = this.state;
		const { onOk, onCancel, onChangeKey } = this.handlers;

		return (
			<Flex flexDirection="column">
				<Flex justifyContent="flex-end">
					<Button className="rde-action-btn" shape="circle" onClick={this.handleAdd}>
						<Icon name="plus" />
					</Button>
					<Button className="rde-action-btn" shape="circle" onClick={this.handleClear}>
						<Icon name="times" />
					</Button>
				</Flex>
				<Table
					size="small"
					pagination={{ pageSize: 5 }}
					columns={
						[
							{ title: i18next.t('common.key'), dataIndex: 'key' },
							{ title: i18next.t('common.value'), dataIndex: 'value' },
							{
								title: '',
								dataIndex: 'action',
								render: (_text: unknown, record: { key: string }) => (
									<div>
										<Button
											className="rde-action-btn"
											shape="circle"
											onClick={() => this.handleEdit(record.key)}
										>
											<Icon name="edit" />
										</Button>
										<Button
											className="rde-action-btn"
											shape="circle"
											onClick={() => this.handleDelete(record.key)}
										>
											<Icon name="times" />
										</Button>
									</div>
								),
							},
						] as any
					}
					dataSource={this.getDataSource(userProperty)}
				/>
				<Modal onCancel={onCancel} onOk={onOk} open={visible}>
					<Form.Item
						required
						label={i18next.t('common.key')}
						colon={false}
						hasFeedback
						validateStatus={validateStatus}
						help={help}
					>
						<Input value={tempKey} onChange={event => onChangeKey(event.target.value)} />
					</Form.Item>
					<Form.Item label={i18next.t('common.value')} colon={false}>
						<Input value={tempValue} onChange={event => this.setState({ tempValue: event.target.value })} />
					</Form.Item>
				</Modal>
			</Flex>
		);
	}
}

export default EditTable;
