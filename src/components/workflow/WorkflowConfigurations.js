import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';
import classnames from 'classnames';

import Icon from '../icon/Icon';
import WorkflowInfo from './WorkflowInfo';
import WorkflowGlobalParameters from './WorkflowGlobalParameters';
import CommonButton from '../common/CommonButton';

class WorkflowConfigurations extends Component {
    static propTypes = {
        canvasRef: PropTypes.any,
        selectedItem: PropTypes.object,
        workflow: PropTypes.object,
        onChange: PropTypes.func,
    }

    state = {
        collapse: false,
        activeKey: 'info',
    }

    handlers = {
        onCollapse: () => {
            this.setState({
                collapse: !this.state.collapse,
            });
        },
        onChange: (activeKey) => {
            this.setState({
                activeKey,
            });
        }
    }

    render() {
        const { canvasRef, selectedItem, workflow, onChange } = this.props;
        const { collapse, activeKey } = this.state;
        const className = classnames('rde-editor-configurations', {
            minimize: collapse,
        });
        return (
            <div className={className}>
                <CommonButton
                    className="rde-action-btn"
                    shape="circle"
                    icon={collapse ? 'angle-double-left' : 'angle-double-right'}
                    onClick={this.handlers.onCollapse}
                    style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}
                />
                <Tabs
                    tabPosition="right"
                    activeKey={activeKey}
                    onChange={this.handlers.onChange}
                    style={{ height: '100%' }}
                    tabBarStyle={{ marginTop: 60 }}
                >
                    <Tabs.TabPane tab={<Icon name="cog" />} key="info">
                        <WorkflowInfo workflow={workflow} onChange={onChange} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={<Icon name="globe" />} key="variables">
                        <WorkflowGlobalParameters workflow={workflow} onChange={onChange} />
                    </Tabs.TabPane>
                </Tabs>
            </div>
        );
    }
}

export default WorkflowConfigurations;
