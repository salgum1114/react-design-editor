import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';

import Properties from './Properties';
import Animations from './animations/Animations';
import Styles from './styles/Styles';
import DataSources from './datasources/DataSources';

class Definitions extends Component {
    static propTypes = {
        canvasRef: PropTypes.any,
        selectedItem: PropTypes.object,
        onChange: PropTypes.func,
        animations: PropTypes.array,
        styles: PropTypes.array,
        dataSources: PropTypes.array,
    }

    state = {
        activeKey: 'properties',
    }

    handlers = {
        onChangeTab: (activeKey) => {
            this.setState({
                activeKey,
            });
        },
    }

    getAnimations = () => {
        return this.animationsRef.state.animations;
    }

    getStyles = () => {
        return this.stylesRef.state.styles;
    }

    getDataSources = () => {
        return this.dataSourcesRef.state.dataSources;
    }

    render() {
        const { onChange, selectedItem, canvasRef } = this.props;
        const { activeKey } = this.state;
        const { onChangeTab } = this.handlers;
        return (
            <Tabs className="rde-definitions-tabs" activeKey={activeKey} onChange={onChangeTab}>
                <Tabs.TabPane tab="Properties" key="properties">
                    <Properties onChange={onChange} selectedItem={selectedItem} canvasRef={canvasRef} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Animations" key="animations">
                    <Animations ref={(c) => { this.animationsRef = c; }} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Styles" key="styles">
                    <Styles ref={(c) => { this.stylesRef = c; }} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="DataSources" key="datasources">
                    <DataSources ref={(c) => { this.dataSourcesRef = c; }} />
                </Tabs.TabPane>
            </Tabs>
        );
    }
}

export default Definitions;
