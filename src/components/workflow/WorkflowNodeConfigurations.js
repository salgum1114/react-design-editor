import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Divider, Input } from 'antd';
import i18n from 'i18next';

import { FlexBox } from '../flex';
import NodeDescriptor from './configuration/NodeDescriptor';
import NodeAction from './configuration/NodeAction';
import NodeConfiguration from './configuration/NodeConfiguration';
import Scrollbar from '../common/Scrollbar';

class WorkflowNodeConfigurations extends Component {
    static propTypes = {
        canvasRef: PropTypes.any,
        selectedItem: PropTypes.object,
        workflow: PropTypes.object,
        descriptors: PropTypes.object,
        onChange: PropTypes.func,
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.selectedItem && nextProps.selectedItem) {
            if (this.props.selectedItem.id !== nextProps.selectedItem.id) {
                nextProps.form.resetFields();
            }
        }
    }

    render() {
        const { canvasRef, workflow, selectedItem, form } = this.props;
        return (
            <Scrollbar>
                <Form layout="horizontal">
                    {
                        selectedItem ? (
                            <React.Fragment>
                                <NodeDescriptor workflow={workflow} selectedItem={selectedItem} />
                                <FlexBox flexDirection="column" style={{ margin: '8px 16px' }}>
                                    <Form.Item
                                        label={i18n.t('common.name')}
                                        colon={false}
                                    >
                                        {
                                            form.getFieldDecorator('name', {
                                                initialValue: selectedItem.name,
                                                rules: [
                                                    { required: true, message: i18n.t('validation.enter-property', { arg: i18n.t('common.name') }) },
                                                ],
                                            })(<Input minLength={0} maxLength={30} placeholder={i18n.t('workflow.node-name-required')} />)
                                        }
                                    </Form.Item>
                                    <Form.Item
                                        label={i18n.t('common.description')}
                                        colon={false}
                                    >
                                        {
                                            form.getFieldDecorator('description', {
                                                initialValue: selectedItem.description,
                                            })(<Input.TextArea style={{ maxHeight: 200 }} placeholder={i18n.t('workflow.node-description-required')} />)
                                        }
                                    </Form.Item>
                                </FlexBox>
                                <Divider>{i18n.t('workflow.node-configuration')}</Divider>
                                <FlexBox flexDirection="column" style={{ height: '100%', overflowY: 'hidden', margin: '8px 16px' }}>
                                    <NodeConfiguration
                                        canvasRef={canvasRef}
                                        form={form}
                                        selectedItem={selectedItem}
                                        workflow={workflow}
                                    />
                                </FlexBox>
                                <NodeAction workflow={workflow} selectedItem={selectedItem} canvasRef={canvasRef} />
                            </React.Fragment>
                        ) : null
                    }
                </Form>
            </Scrollbar>
        );
    }
}

export default Form.create({
    onValuesChange: (props, changedValues, allValues) => {
        const { onChange, selectedItem } = props;
        onChange(selectedItem, changedValues, allValues);
    },
})(WorkflowNodeConfigurations);
