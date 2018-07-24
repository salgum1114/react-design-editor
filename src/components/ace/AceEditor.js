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
                htmlAnnotations: this.htmlRef.editor.getSession().getAnnotations(),
            }, () => {
                if (this.props.onChangeHTML) {
                    this.props.onChangeHTML(value);
                }
            });
        }, 500),
        onChangeCSS: debounce((value) => {
            this.setState({
                css: value,
                cssAnnotations: this.cssRef.editor.getSession().getAnnotations(),
            }, () => {
                if (this.props.onChangeCSS) {
                    this.props.onChangeCSS(value);
                }
            });
        }, 500),
        onChangeJS: debounce((value) => {
            this.setState({
                js: value,
                jsAnnotations: this.jsRef.editor.getSession().getAnnotations(),
            }, () => {
                if (this.props.onChangeJS) {
                    this.props.onChangeJS(value);
                }
            });
        }, 500),
        onValidateHTML: (annotations) => {
            let i = annotations.length;
            const len = annotations.length;
            while (i--) {
                if (/doctype first\. Expected/.test(annotations[i].text)) {
                    annotations.splice(i, 1);
                } else if (/Unexpected End of file\. Expected/.test(annotations[i].text)) {
                    annotations.splice(i, 1);
                }
            }
            if (len > annotations.length) {
                this.htmlRef.editor.getSession().setAnnotations(annotations);
            }
        },
        getAnnotations: () => {
            const { htmlAnnotations, cssAnnotations, jsAnnotations } = this.state;
            return {
                htmlAnnotations,
                cssAnnotations,
                jsAnnotations,
            };
        },
        getCodes: () => {
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
        html: this.props.html,
        css: this.props.css,
        js: this.props.js,
        htmlAnnotations: [],
        cssAnnotations: [],
        jsAnnotations: [],
    }

    componentWillUnmount() {
        this.htmlRef.editor.destroy();
        this.cssRef.editor.destroy();
        this.jsRef.editor.destroy();
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
                                    ref={(c) => { this.htmlRef = c; }}
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
                                    ref={(c) => { this.cssRef = c; }}
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
                                    ref={(c) => { this.jsRef = c; }}
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
                            <Form.Item label="Preview" colon={false}>
                                <AcePreview html={html} css={css} js={js} />
                            </Form.Item>
                        </Col>
                    ) : null
                }
            </Row>
        );
    }
}

export default AceEditor;
