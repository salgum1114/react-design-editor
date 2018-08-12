import React, { Component } from 'react';
import { ResizeSensor } from 'css-element-queries';
import { Badge, Button, Spin } from 'antd';
import debounce from 'lodash/debounce';
import '../libs/fontawesome-5.2.0/css/all.css';

import Wireframe from './wireframe/Wireframe';
import Items from './Items';
import Canvas from './Canvas';
import FooterToolbar from './FooterToolbar';
import HeaderToolbar from './HeaderToolbar';
import Title from './Title';
import Preview from './Preview';

import '../styles/index.less';
import Definitions from './Definitions';

const propertiesToInclude = [
    'id',
    'name',
    'lock',
    'file',
    'src',
    'action',
    'tooltip',
    'animation',
    'layout',
    'workareaWidth',
    'workareaHeight',
    'videoLoadType',
    'autoplay',
    'shadow',
    'muted',
    'loop',
    'code',
    'icon',
    'userProperty',
];

class Editor extends Component {
    canvasHandlers = {
        onAdd: (target) => {
            if (target.type === 'activeSelection') {
                this.canvasHandlers.onSelect(null);
                return;
            }
            this.canvasRef.current.handlers.select(target);
        },
        onSelect: (target) => {
            if (target && target.id && target.id !== 'workarea' && target.type !== 'activeSelection') {
                this.setState({
                    selectedItem: target,
                });
                return;
            }
            this.setState({
                selectedItem: this.canvasRef.current.workarea,
            });
        },
        onRemove: (target) => {
            this.canvasHandlers.onSelect(null);
        },
        onModified: debounce((target) => {
            if (target && target.id && target.id !== 'workarea' && target.type !== 'activeSelection') {
                this.setState({
                    selectedItem: target,
                });
                return;
            }
            this.setState({
                selectedItem: this.canvasRef.current.workarea,
            });
        }, 300),
        onZoom: (zoom) => {
            this.setState({
                zoomRatio: zoom,
            });
        },
        onChange: (selectedItem, changedValues, allValues) => {
            const changedKey = Object.keys(changedValues)[0];
            const changedValue = changedValues[changedKey];
            console.log(selectedItem, changedValues, allValues);
            if (selectedItem.id === 'workarea') {
                this.canvasHandlers.onChangeWokarea(changedKey, changedValue, allValues);
                return;
            }
            if (changedKey === 'width' || changedKey === 'height') {
                this.canvasRef.current.handlers.scaleToResize(allValues.width, allValues.height);
                return;
            }
            if (changedKey === 'lock') {
                this.canvasRef.current.handlers.setObject({
                    lockMovementX: changedValue,
                    lockMovementY: changedValue,
                    hasControls: !changedValue,
                    hoverCursor: changedValue ? 'pointer' : 'move',
                    editable: !changedValue,
                    lock: changedValue,
                });
                return;
            }
            if (changedKey === 'file' || changedKey === 'src' || changedKey === 'code') {
                if (selectedItem.type === 'image') {
                    this.canvasRef.current.handlers.setImageById(selectedItem.id, changedValue);
                } else if (this.canvasRef.current.handlers.isElementType(selectedItem.type)) {
                    this.canvasRef.current.elementHandlers.setById(selectedItem.id, changedValue);
                }
                return;
            }
            if (changedKey === 'action') {
                this.canvasRef.current.handlers.set(changedKey, allValues.action);
                return;
            }
            if (changedKey === 'tooltip') {
                this.canvasRef.current.handlers.set(changedKey, allValues.tooltip);
                return;
            }
            if (changedKey === 'animation') {
                this.canvasRef.current.handlers.set(changedKey, allValues.animation);
                return;
            }
            if (changedKey === 'icon') {
                const { unicode, styles } = changedValue[Object.keys(changedValue)[0]];
                const uni = parseInt(unicode, 16);
                if (styles[0] === 'brands') {
                    this.canvasRef.current.handlers.set('fontFamily', 'Font Awesome 5 Brands');
                } else if (styles[0] === 'regular') {
                    this.canvasRef.current.handlers.set('fontFamily', 'Font Awesome 5 Regular');
                } else {
                    this.canvasRef.current.handlers.set('fontFamily', 'Font Awesome 5 Free');
                }
                this.canvasRef.current.handlers.set('text', String.fromCodePoint(uni));
                this.canvasRef.current.handlers.set('icon', changedValue);
                return;
            }
            if (changedKey === 'shadow') {
                if (allValues.shadow.enabled) {
                    this.canvasRef.current.handlers.setShadow(changedKey, allValues.shadow);
                } else {
                    this.canvasRef.current.handlers.setShadow(changedKey, null);
                }
                return;
            }
            if (changedKey === 'fontWeight') {
                this.canvasRef.current.handlers.set(changedKey, changedValue ? 'bold' : 'normal');
                return;
            }
            if (changedKey === 'fontStyle') {
                this.canvasRef.current.handlers.set(changedKey, changedValue ? 'italic' : 'normal');
                return;
            }
            if (changedKey === 'textAlign') {
                this.canvasRef.current.handlers.set(changedKey, Object.keys(changedValue)[0]);
                return;
            }
            this.canvasRef.current.handlers.set(changedKey, changedValue);
        },
        onChangeWokarea: (changedKey, changedValue, allValues) => {
            if (changedKey === 'layout') {
                this.canvasRef.current.workareaHandlers.setLayout(changedValue);
                return;
            }
            if (changedKey === 'file' || changedKey === 'src') {
                this.canvasRef.current.workareaHandlers.setImage(changedValue);
                return;
            }
            if (changedKey === 'width' || changedKey === 'height') {
                this.canvasRef.current.handlers.originScaleToResize(this.canvasRef.current.workarea, allValues.width, allValues.height);
                this.canvasRef.current.canvas.centerObject(this.canvasRef.current.workarea);
                return;
            }
            this.canvasRef.current.workarea.set(changedKey, changedValue);
            this.canvasRef.current.canvas.requestRenderAll();
        },
        onTooltip: (ref, target) => {
            const count = (Math.random() * 10) + 1;
            return (
                <div>
                    <div>
                        <div>
                            <Button>
                                {target.id}
                            </Button>
                            <Badge count={count} />
                        </div>
                    </div>
                </div>
            );
        },
        onAction: (canvas, target) => {
            const { action } = target;
            if (action.type === 'dashboard') {
            } else if (action.type === 'url') {
                if (action.state === 'current') {
                    document.location.href = action.url;
                    return;
                }
                window.open(action.url);
            }
        },
    }

    handlers = {
        onChangePreview: (checked) => {
            this.setState({
                preview: typeof checked === 'object' ? false : checked,
            }, () => {
                if (this.state.preview) {
                    setTimeout(() => {
                        const data = this.canvasRef.current.handlers.exportJSON().objects.filter((obj) => {
                            if (!obj.id) {
                                return false;
                            }
                            return true;
                        });
                        const json = JSON.stringify(data);
                        this.preview.canvasRef.current.handlers.importJSON(json);
                    }, 0);
                    return;
                }
                this.preview.canvasRef.current.handlers.clear(true);
            });
        },
        onLoading: (files) => {
            this.setState({
                loading: true,
            }, () => {
                setTimeout(() => {
                    const reader = new FileReader();
                    reader.onprogress = (e) => {
                        if (e.lengthComputable) {                                            
                            const progress = parseInt(((e.loaded / e.total) * 100), 10);
                            this.handlers.onProgress(progress);
                        }
                    };
                    reader.onload = (e) => {
                        const { objects, animations, styles, dataSources } = JSON.parse(e.target.result);
                        this.setState({
                            animations,
                            styles,
                            dataSources,
                        });
                        if (objects) {
                            this.canvasRef.current.handlers.clear(true);
                            const data = objects.filter((obj) => {
                                if (!obj.id) {
                                    return false;
                                }
                                return true;
                            });
                            this.canvasRef.current.handlers.importJSON(JSON.stringify(data));
                        }
                    };
                    reader.onloadend = () => {
                        this.setState({
                            loading: false,
                        });
                    };
                    reader.readAsText(files[0]);
                }, 500);
            });
        },
        onProgress: (progress) => {
            this.setState({
                progress,
            });
        },
        onChangeAnimations: (animations) => {
            this.setState({
                animations,
            });
        },
        onChangeStyles: (styles) => {
            this.setState({
                styles,
            });
        },
        onChangeDataSources: (dataSources) => {
            this.setState({
                dataSources,
            });
        },
    }

    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
    }

    state = {
        selectedItem: null,
        zoomRatio: 1,
        canvasRect: {
            width: 0,
            height: 0,
        },
        preview: false,
        loading: false,
        progress: 0,
        animations: [],
        styles: [],
        dataSources: [],
    }

    componentDidMount() {
        this.resizeSensor = new ResizeSensor(this.container, () => {
            const { canvasRect: currentCanvasRect } = this.state;
            const canvasRect = Object.assign({}, currentCanvasRect, {
                width: this.container.clientWidth,
                height: this.container.clientHeight,
            });
            this.setState({
                canvasRect,
            });
        });
        this.setState({
            canvasRect: {
                width: this.container.clientWidth,
                height: this.container.clientHeight,
            },
            selectedItem: this.canvasRef.current.workarea,
        });
    }

    getDefinitions = () => ({
        animations: this.getAnimations(),
        styles: this.getStyles(),
        dataSources: this.getDataSources(),
    })

    getAnimations = () => this.state.animations;

    getStyles = () => this.state.styles;

    getDataSources = () => this.state.dataSources;

    render() {
        const { preview, selectedItem, canvasRect, zoomRatio, loading, progress, animations, styles, dataSources } = this.state;
        const { onAdd, onRemove, onSelect, onModified, onChange, onZoom, onTooltip, onAction } = this.canvasHandlers;
        const { onChangePreview, onLoading, onChangeAnimations, onChangeStyles, onChangeDataSources } = this.handlers;
        return (
            <div className="rde-main">
                <Spin size="large" spinning={loading} tip={`${progress}%`}>
                    <div className="rde-title">
                        <Title propertiesRef={this.propertiesRef} canvasRef={this.canvasRef} onLoading={onLoading} definitions={this.getDefinitions()} />
                    </div>
                    <div className="rde-content">
                        <div className="rde-editor">
                            {/* <nav className="rde-wireframe">
                                <Wireframe canvasRef={this.canvasRef} />
                            </nav> */}
                            <aside className="rde-items">
                                <Items canvasRef={this.canvasRef} />
                            </aside>
                            <header style={{ width: canvasRect.width }} className="rde-canvas-header">
                                <HeaderToolbar canvasRef={this.canvasRef} selectedItem={selectedItem} onSelect={onSelect} />
                            </header>
                            <main
                                ref={(c) => { this.container = c; }}
                                className="rde-canvas-container"
                            >
                                <Canvas
                                    ref={this.canvasRef}
                                    width={canvasRect.width}
                                    height={canvasRect.height}
                                    propertiesToInclude={propertiesToInclude}
                                    onModified={onModified}
                                    onAdd={onAdd}
                                    onRemove={onRemove}
                                    onSelect={onSelect}
                                    onZoom={onZoom}
                                    onTooltip={onTooltip}
                                    onAction={onAction}
                                />
                            </main>
                            <footer style={{ width: canvasRect.width }} className="rde-canvas-footer">
                                <FooterToolbar canvasRef={this.canvasRef} preview={preview} onChangePreview={onChangePreview} zoomRatio={zoomRatio} />
                            </footer>
                            <aside className="rde-definitions">
                                <Definitions
                                    ref={(c) => { this.definitionsRef = c; }}
                                    onChange={onChange}
                                    selectedItem={selectedItem}
                                    canvasRef={this.canvasRef}
                                    onChangeAnimations={onChangeAnimations}
                                    onChangeStyles={onChangeStyles}
                                    onChangeDataSources={onChangeDataSources}
                                    animations={animations}
                                    styles={styles}
                                    dataSources={dataSources}
                                />
                            </aside>
                        </div>
                    </div>
                </Spin>
                <Preview ref={(c) => { this.preview = c; }} preview={preview} onChangePreview={onChangePreview} onTooltip={onTooltip} onAction={onAction} />
            </div>
        );
    }
}

export default Editor;
