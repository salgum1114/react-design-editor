import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';

import Properties from './Properties';
import Animations from './animations/Animations';
import Styles from './styles/Styles';
import DataSources from './datasources/DataSources';

class Definitions extends Component {
    handlers = {
        onChangeTab: (activeKey) => {
            this.setState({
                activeKey,
            });
        },
    }

    static propTypes = {
        canvasRef: PropTypes.any,
        selectedItem: PropTypes.object,
        onChange: PropTypes.func,
        onChangeAnimations: PropTypes.func,
        onChangeStyles: PropTypes.func,
        onChangeDataSources: PropTypes.func,
        animations: PropTypes.array,
        styles: PropTypes.array,
        dataSources: PropTypes.array,
    }

    state = {
        activeKey: 'properties',
    }

    getAnimations = () => this.animationsRef.state.animations;

    getStyles = () => this.stylesRef.state.styles;

    getDataSources = () => this.dataSourcesRef.state.dataSources;

    render() {
        const {
            onChange,
            selectedItem,
            canvasRef,
            animations,
            styles,
            dataSources,
            onChangeAnimations,
            onChangeStyles,
            onChangeDataSources,
        } = this.props;
        const { activeKey } = this.state;
        const { onChangeTab } = this.handlers;
        return (
            <Tabs activeKey={activeKey} onChange={onChangeTab}>
                <Tabs.TabPane tab="Properties" key="properties">
                    <Properties onChange={onChange} selectedItem={selectedItem} canvasRef={canvasRef} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Animations" key="animations">
                    <Animations ref={(c) => { this.animationsRef = c; }} animations={animations} onChangeAnimations={onChangeAnimations} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Styles" key="styles">
                    <Styles ref={(c) => { this.stylesRef = c; }} styles={styles} onChangeStyles={onChangeStyles} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="DataSources" key="datasources">
                    <DataSources ref={(c) => { this.dataSourcesRef = c; }} dataSources={dataSources} onChangeDataSources={onChangeDataSources} />
                </Tabs.TabPane>
            </Tabs>
        );
    }
}

export default Definitions;
