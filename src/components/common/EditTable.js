import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Table, Modal, Input, Form } from 'antd';
import i18n from 'i18next';

import Icon from '../icon/Icon';
import { FlexBox } from '../flex';

class EditTable extends Component {
    static propTypes = {
        userProperty: PropTypes.object,
        form: PropTypes.any,
        onChange: PropTypes.func,
    }

    static defaultProps = {
        userProperty: {},
    }

    state = {
        userProperty: this.props.userProperty,
        tempKey: '',
        originKey: '',
        tempValue: '',
        visible: false,
        current: 'add',
        validateStatus: '',
        help: '',
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({
            userProperty: nextProps.userProperty || {},
        });
    }

    getDataSource = (userProperty) => {
        return Object.keys(userProperty).map((key) => {
            return {
                key,
                value: userProperty[key],
            };
        });
    }

    handlers = {
        onOk: () => {
            const { onChange } = this.props;
            const { tempKey, originKey, tempValue, current, validateStatus } = this.state;
            if (validateStatus === 'error') {
                return;
            }
            if (current === 'modify') {
                delete this.state.userProperty[originKey];
            }
            const userProperty = Object.assign({}, this.state.userProperty, { [tempKey]: tempValue });
            if (onChange) {
                onChange(userProperty);
            }
            this.setState({
                visible: false,
                userProperty,
            });
        },
        onCancel: () => {
            this.modalHandlers.onHide();
        },
        onChangeKey: (value) => {
            let validateStatus = 'success';
            let help = '';
            if (this.state.current === 'add' && Object.keys(this.state.userProperty).some(p => p === value)
            || this.state.current === 'modify' && this.state.originKey !== value && this.state.userProperty[value]) {
                validateStatus = 'error';
                help = i18n.t('validation.already-property', { arg: i18n.t('common.key') });
            } else if (!value.length) {
                validateStatus = 'error';
                help = i18n.t('validation.enter-property', { arg: i18n.t('common.key') });
            } else {
                validateStatus = 'success';
                help = '';
            }
            this.setState({
                tempKey: value,
                validateStatus,
                help,
            });
        },
    }

    modalHandlers = {
        onShow: () => {
            this.setState({
                visible: true,
            });
        },
        onHide: () => {
            this.setState({
                visible: false,
            });
        },
    }

    handleAdd = () => {
        this.setState({
            visible: true,
            tempKey: '',
            tempValue: '',
            current: 'add',
            validateStatus: '',
            help: '',
        });
    }

    handleEdit = (key) => {
        this.setState({
            visible: true,
            tempKey: key,
            originKey: key,
            tempValue: this.state.userProperty[key],
            current: 'modify',
            validateStatus: '',
            help: '',
        });
    }

    handleDelete = (key) => {
        delete this.state.userProperty[key];
        this.setState({ userProperty: this.state.userProperty });
    }

    handleClear = () => {
        this.setState({ userProperty: {} });
    }

    render() {
        const { userProperty, tempKey, tempValue, visible, validateStatus, help } = this.state;
        const { onOk, onCancel, onChangeKey } = this.handlers;
        const columns = [
            {
                title: i18n.t('common.key'),
                dataIndex: 'key',
            },
            {
                title: i18n.t('common.value'),
                dataIndex: 'value',
            },
            {
                title: '',
                dataIndex: 'action',
                render: (text, record) => {
                    return (
                        <div>
                            <Button className="rde-action-btn" shape="circle" onClick={() => { this.handleEdit(record.key); }}>
                                <Icon name="edit" />
                            </Button>
                            <Button className="rde-action-btn" shape="circle" onClick={() => { this.handleDelete(record.key); }}>
                                <Icon name="times" />
                            </Button>
                        </div>
                    );
                },
            },
        ];
        return (
            <FlexBox flexDirection="column">
                <FlexBox justifyContent="flex-end">
                    <Button className="rde-action-btn" shape="circle" onClick={this.handleAdd}>
                        <Icon name="plus" />
                    </Button>
                    <Button className="rde-action-btn" shape="circle" onClick={this.handleClear}>
                        <Icon name="times" />
                    </Button>
                </FlexBox>
                <Table
                    size="small"
                    pagination={{
                        pageSize: 5,
                    }}
                    columns={columns}
                    dataSource={this.getDataSource(userProperty)}
                />
                <Modal
                    onCancel={onCancel}
                    onOk={onOk}
                    visible={visible}
                >
                    <Form.Item required label={i18n.t('common.key')} colon={false} hasFeedback validateStatus={validateStatus} help={help}>
                        <Input defaultValue={tempKey} value={tempKey} onChange={(e) => { onChangeKey(e.target.value); }} />
                    </Form.Item>
                    <Form.Item label={i18n.t('common.value')} colon={false}>
                        <Input defaultValue={tempValue} value={tempValue} onChange={(e) => { this.setState({ tempValue: e.target.value }); }} />
                    </Form.Item>
                </Modal>
            </FlexBox>
        );
    }
}

export default EditTable;