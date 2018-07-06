import React, { Component } from 'react';
import { Button } from 'antd';

import { FlexBox } from './flex';
import Icon from './Icon';

class Title extends Component {
    handlers = {
        onSave: () => {

        },
    }

    render() {
        return (
            <FlexBox flexWrap="wrap" flex="1" alignItems="center">
                <div style={{ marginLeft: 8 }} flex="0 1 auto">
                    <span style={{ color: '#001936', fontSize: 24, fontWeight: 500 }}>React Design Editor</span>
                </div>
                <FlexBox style={{ marginRight: 8 }} flex="1" justifyContent="flex-end">
                    <Button style={{ marginRight: 8 }} size="large">
                        <Icon name="save" />
                    </Button>
                    <Button size="large">
                        <Icon name="times" />
                    </Button>
                </FlexBox>
            </FlexBox>
        );
    }
}

export default Title;
