import React, { Component } from 'react';

import { FlexBox } from '../flex';
import DataSourceModal from './DataSourceModal';
import DataSourceList from './DataSourceList';

class DataSources extends Component {
    state = {
        dataSources: [],
    }

    render() {
        const { dataSources } = this.state;
        return (
            <FlexBox flexDirection="column">
                <FlexBox justifyContent="flex-end">
                    <DataSourceModal />
                </FlexBox>
                <DataSourceList dataSources={dataSources} />
            </FlexBox>
        );
    }
}

export default DataSources;
