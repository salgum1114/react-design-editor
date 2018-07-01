import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Collapse } from 'antd';

import PropertyDefinition from './properties/PropertyDefinition';

const { Panel } = Collapse;

class Properties extends Component {
    static propTypes = {
        selectedItem: PropTypes.object,
    }

    render() {
        const { selectedItem, form } = this.props;
        const showArrow = false;
        return (
            <Form layout="horizontal">
                <Collapse bordered={false}>
                    {
                        selectedItem ? (
                            Object.keys(PropertyDefinition[selectedItem.type]).map((key) => {
                                return (
                                    <Panel key={key} header={PropertyDefinition[selectedItem.type][key].title} showArrow={showArrow}>
                                        {PropertyDefinition[selectedItem.type][key].component.render(form, selectedItem)}
                                    </Panel>
                                )
                            })
                        ) : null
                    }
                </Collapse>
            </Form>
        );
    }
}

export default Form.create({
    onFieldsChange: (props, changedFields) => {
        console.log(props, changedFields);
    },
})(Properties);
