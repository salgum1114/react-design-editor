import React, { Component } from 'react';
import { Form, Collapse } from 'antd';
import MarkerProperty from './MarkerProperty';
import GeneralProperty from './GeneralProperty';
import StyleProperty from './StyleProperty';
import TooltipProperty from './TooltipProperty';
import ImageProperty from './ImageProperty';
import TextProperty from './TextProperty';
import MapProperty from './MapProperty';
import ActionProperty from './ActionProperty';

const { Panel } = Collapse;

class PropertyForm extends Component {
    render() {
        const { type, form } = this.props;
        const showArrow = false;
        return (
            <Form layout="horizontal">
                <Collapse bordered={false}>
                    <Panel header="Map" showArrow={showArrow}>
                        {MapProperty.render(form)}
                    </Panel>
                    <Panel header="General" showArrow={showArrow}>
                        {GeneralProperty.render(form)}
                    </Panel>
                    <Panel header="Marker" showArrow={showArrow}>
                        {MarkerProperty.render(form)}
                    </Panel>
                    <Panel header="Image" showArrow={showArrow}>
                        {ImageProperty.render(form)}
                    </Panel>
                    <Panel header="Text" showArrow={showArrow}>
                        {TextProperty.render(form)}
                    </Panel>
                    <Panel header="Action" showArrow={showArrow}>
                        {ActionProperty.render(form)}
                    </Panel>
                    <Panel header="Tooltip" showArrow={showArrow}>
                        {TooltipProperty.render(form)}
                    </Panel>
                    <Panel header="Style" showArrow={showArrow}>
                        {StyleProperty.render(form)}
                    </Panel>
                </Collapse>
            </Form>
        );
    }
}

export default Form.create()(PropertyForm);
