import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

import { FlexBox } from './flex';
import Icon from './Icon';

class Title extends Component {
    handlers = {
        onSave: () => {
            const { propertiesRef } = this.props;
            propertiesRef.validateFields((error, values) => {
                console.log(error, values);
            });
        },
        goGithub: () => {
            window.open('https://github.com/salgum1114/react-design-editor');
        },
    }

    static propTypes = {
        propertiesRef: PropTypes.any,
    }

    render() {
        return (
            <FlexBox style={{ background: 'linear-gradient(141deg,#23303e,#404040 51%,#23303e 75%)' }} flexWrap="wrap" flex="1" alignItems="center">
                <div style={{ marginLeft: 8 }} flex="0 1 auto">
                    <span style={{ color: '#fff', fontSize: 24, fontWeight: 500 }}>React Design Editor</span>
                    <Button
                        className="rde-action-btn"
                        style={{
                            color: 'white',
                        }}
                        shape="circle"
                        size="large"
                        onClick={this.handlers.goGithub}
                    >
                        <Icon name="github" prefix="fab" size={1.5} />
                    </Button>
                </div>
                <FlexBox style={{ marginRight: 8 }} flex="1" justifyContent="flex-end">
                    <Button
                        className="rde-action-btn"
                        style={{
                            marginRight: 8,
                            color: 'white',
                        }}
                        shape="circle"
                        size="large"
                        onClick={this.handlers.onSave}
                    >
                        <Icon name="save" size={1.5} />
                    </Button>
                    <Button
                        className="rde-action-btn"
                        style={{
                            color: 'white',
                        }}
                        shape="circle"
                        size="large"
                    >
                        <Icon name="times" size={1.5} />
                    </Button>
                </FlexBox>
            </FlexBox>
        );
    }
}

export default Title;
