import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col } from 'antd';
import debounce from 'lodash/debounce';
import ReactAce from 'react-ace';
import 'brace/mode/javascript';
import 'brace/mode/html';
import 'brace/mode/css';
import 'brace/theme/chrome';

import AcePreview from './AcePreview';

const defaultStyle = {
    padding: 12,
};

class AceEditor extends Component {
    handlers = {
        onChangeHTML: debounce((value) => {
            this.setState({
                html: value,
            }, () => {
                if (this.props.onChangeHTML) {
                    this.props.onChangeHTML(value);
                }
            });
        }, 300),
        onChangeCSS: debounce((value) => {
            this.setState({
                css: value,
            }, () => {
                if (this.props.onChangeCSS) {
                    this.props.onChangeCSS(value);
                }
            });
        }, 300),
        onChangeJS: debounce((value) => {
            this.setState({
                js: value,
            }, () => {
                if (this.props.onChangeJS) {
                    this.props.onChangeJS(value);
                }
            });
        }, 300),
        getCodeValue: () => {
            const { html, css, js } = this.state;
            return {
                html,
                css,
                js,
            };
        },
    }

    static propTypes = {
        isHTML: PropTypes.bool,
        isCSS: PropTypes.bool,
        isJS: PropTypes.bool,
        isPreview: PropTypes.bool,
        html: PropTypes.string,
        css: PropTypes.string,
        js: PropTypes.string,
    }

    static defaultProps = {
        isHTML: true,
        isCSS: true,
        isJS: true,
        isPreview: true,
        html: '',
        css: '',
        js: '',
    }

    state = {
        html: this.props.html || '',
        css: this.props.css || '',
        js: this.props.js || '',
    }

    render() {
        const { isHTML, isCSS, isJS, isPreview } = this.props;
        const { html, css, js } = this.state;
        return (
            <Row>
                {
                    isHTML ? (
                        <Col span={12} style={defaultStyle}>
                            <Form.Item label="HTML" colon={false}>
                                <ReactAce
                                    mode="html"
                                    theme="chrome"
                                    width="100%"
                                    height="200px"
                                    defaultValue={html}
                                    value={html}
                                    editorProps={{
                                        $blockScrolling: true,
                                    }}
                                    onChange={this.handlers.onChangeHTML}
                                />
                            </Form.Item>
                        </Col>
                    ) : null
                }
                {
                    isCSS ? (
                        <Col span={12} style={defaultStyle}>
                            <Form.Item label="CSS" colon={false}>
                                <ReactAce
                                    mode="css"
                                    theme="chrome"
                                    width="100%"
                                    height="200px"
                                    defaultValue={css}
                                    value={css}
                                    editorProps={{
                                        $blockScrolling: true,
                                    }}
                                    onChange={this.handlers.onChangeCSS}
                                />
                            </Form.Item>
                        </Col>
                    ) : null
                }
                {
                    isJS ? (
                        <Col span={12} style={defaultStyle}>
                            <Form.Item label="JS" colon={false}>
                                <ReactAce
                                    mode="javascript"
                                    theme="chrome"
                                    width="100%"
                                    height="200px"
                                    defaultValue={js}
                                    value={js}
                                    editorProps={{
                                        $blockScrolling: true,
                                    }}
                                    onChange={this.handlers.onChangeJS}
                                />
                            </Form.Item>
                        </Col>
                    ) : null
                }
                {
                    isPreview ? (
                        <Col span={12} style={defaultStyle}>
                            <AcePreview html={html} css={css} js={js} />
                        </Col>
                    ) : null
                }
            </Row>
        );
    }
}

export default AceEditor;
