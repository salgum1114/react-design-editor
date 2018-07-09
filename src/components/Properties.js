import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Collapse } from 'antd';

import PropertyDefinition from './properties/PropertyDefinition';

const { Panel } = Collapse;

class Properties extends Component {
    static propTypes = {
        selectedItem: PropTypes.object,
    }

    componentWillReceiveProps(nextProps) {
        nextProps.form.resetFields();
    }

    render() {
        const { selectedItem, form } = this.props;
        const showArrow = false;
        return (
            <Form layout="horizontal">
                <Collapse bordered={false}>
                    {
                        selectedItem && selectedItem.id !== 'workarea' ? (
                            Object.keys(PropertyDefinition[selectedItem.type]).map((key) => {
                                return (
                                    <Panel key={key} header={PropertyDefinition[selectedItem.type][key].title} showArrow={showArrow}>
                                        {PropertyDefinition[selectedItem.type][key].component.render(form, selectedItem)}
                                    </Panel>
                                );
                            })
                        ) : Object.keys(PropertyDefinition.map).map((key) => {
                            return (
                                <Panel key={key} header={PropertyDefinition.map[key].title} showArrow={showArrow}>
                                    {PropertyDefinition.map[key].component.render(form, selectedItem)}
                                </Panel>
                            );
                        })
                    }
                </Collapse>
            </Form>
        );
    }
}

export default Form.create({
    onValuesChange: (props, changedValues, allValues) => {
        const { onChange, selectedItem } = props;
        onChange(selectedItem, changedValues, allValues);
    },
})(Properties);
