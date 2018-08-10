import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

import { FlexBox } from './flex';
import Icon from './Icon';

class Title extends Component {
    handlers = {
        onExport: () => {
            const { canvasRef } = this.props;
            const data = Object.assign({}, canvasRef.current.handlers.exportJSON(), this.props.definitions);
            this.setState({
                data,
            });
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

    state = {
        data: {},
    }

    render() {
        const data = `data: text/json;charset-utf-8, ${encodeURIComponent(JSON.stringify(this.state.data))}`;
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
                        onClick={this.handlers.onExport}
                    >
                        <a href={data} download="metadata.json">
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
