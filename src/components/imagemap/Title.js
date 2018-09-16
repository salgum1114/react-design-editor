import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Menu } from 'antd';

import { FlexBox } from '../flex';
import Icon from '../icon/Icon';

class Title extends Component {
    handlers = {
        onExport: () => {
            const { canvasRef, definitions } = this.props;
            const data = Object.assign({}, canvasRef.current.handlers.exportJSON(), definitions);
            this.exportRef.href = `data: text/json;charset-utf-8, ${encodeURIComponent(JSON.stringify(data))}`;
            this.exportRef.download = 'metadata.json';
        },
        onImport: (files) => {
            const { onLoading } = this.props;
            if (files && files.length) {
                onLoading(files);
            }
        },
        onCancel: () => {
            const { canvasRef } = this.props;
            canvasRef.current.handlers.clear();
        },
        goGithub: () => {
            window.open('https://github.com/salgum1114/react-design-editor');
        },
    }

    static propTypes = {
        definitions: PropTypes.object,
        canvasRef: PropTypes.any,
        onLoading: PropTypes.func,
    }

    render() {
        return (
            <FlexBox style={{ background: 'linear-gradient(141deg,#23303e,#404040 51%,#23303e 75%)' }} flexWrap="wrap" flex="1" alignItems="center">
                <FlexBox style={{ marginLeft: 8 }} flex="0 1 auto">
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
                </FlexBox>
                <FlexBox style={{ marginLeft: 88 }}>
                    <Menu mode="horizontal" theme="dark" style={{ background: 'transparent', fontSize: '16px' }} onClick={this.props.onClick} selectedKeys={[this.props.current]}>
                        <Menu.Item key="imagemap" style={{ color: '#fff' }}>{'Image Map'}</Menu.Item>
                        <Menu.Item key="workflow" style={{ color: '#fff' }}>{'Workflow'}</Menu.Item>
                    </Menu>
                </FlexBox>
                <FlexBox style={{ marginRight: 8 }} flex="1" justifyContent="flex-end">
                    <Button
                        className="rde-action-btn"
                        style={{
                            marginRight: 8,
                            color: 'white',
                        }}
                        shape="circle"
                        size="large"
                        onClick={this.handlers.onExport}
                    >
                        <a ref={(c) => { this.exportRef = c; }}>
                            <Icon name="file-export" size={1.5} />
                        </a>
                    </Button>
                    <Button
                        className="rde-action-btn"
                        style={{
                            marginRight: 16,
                            color: 'white',
                        }}
                        shape="circle"
                        size="large"
                        onClick={() => { this.fileRef.click(); }}
                    >
                        <input ref={(c) => { this.fileRef = c; }} accept=".json" type="file" hidden onChange={(e) => { this.handlers.onImport(e.target.files); }} />
                        <Icon name="file-import" size={1.5} />
                    </Button>
                    <Button
                        className="rde-action-btn"
                        style={{
                            color: 'white',
                        }}
                        shape="circle"
                        size="large"
                        onClick={this.handlers.onCancel}
                    >
                        <Icon name="times" size={1.5} />
                    </Button>
                </FlexBox>
            </FlexBox>
        );
    }
}

export default Title;
