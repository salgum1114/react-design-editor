import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'antd';

import { FlexBox } from '../flex';
import AnimationList from './AnimationList';
import AnimationModal from './AnimationModal';
import Icon from '../icon/Icon';

class Animations extends Component {
    handlers = {
        onOk: () => {
            if (this.state.validateTitle.validateStatus === 'error') {
                return;
            }
            if (!this.state.animation.title) {
                this.setState({
                    validateTitle: this.handlers.onValid(),
                });
                return;
            }
            if (!this.state.animation.type) {
                this.state.animation.type = 'none';
            }
            if (this.state.current === 'add') {
                this.props.animations.push(this.state.animation);
            } else {
                this.props.animations.splice(this.state.index, 1, this.state.animation);
            }
            this.setState({
                visible: false,
                animation: {},
            }, () => {
                this.props.onChangeAnimations(this.props.animations);
            });
        },
        onCancel: () => {
            this.setState({
                visible: false,
                animation: {},
                validateTitle: {
                    validateStatus: '',
                    help: '',
                },
            });
        },
        onAdd: () => {
            this.setState({
                visible: true,
                animation: {},
                validateTitle: {
                    validateStatus: '',
                    help: '',
                },
                current: 'add',
            });
        },
        onEdit: (animation, index) => {
            this.setState({
                visible: true,
                animation,
                validateTitle: {
                    validateStatus: '',
                    help: '',
                },
                current: 'modify',
                index,
            });
        },
        onDelete: (index) => {
            this.props.animations.splice(index, 1);
            this.props.onChangeAnimations(this.props.animations);
        },
        onClear: () => {
            this.props.onChangeAnimations([]);
        },
        onChange: (props, changedValues, allValues) => {
            const fields = changedValues[Object.keys(changedValues)[0]];
            const field = Object.keys(fields)[0];
            const isTitle = field === 'title';
            if (isTitle) {
                this.setState({
                    validateTitle: this.handlers.onValid(fields[field]),
                });
            }
            this.setState({
                animation: { title: this.state.animation.title, ...allValues[Object.keys(allValues)[0]] },
            });
        },
        onValid: (value) => {
            if (!value || !value.length) {
                return {
                    validateStatus: 'error',
                    help: 'Please input title.',
                };
            }
            const exist = this.props.animations.some(animation => animation.title === value);
            if (!exist) {
                return {
                    validateStatus: 'success',
                    help: '',
                };
            }
            return {
                validateStatus: 'error',
                help: 'Already exist title.',
            };
        },
    }

    static propTypes = {
        animations: PropTypes.array,
    }

    static defaultProps = {
        animations: [],
    }

    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
    }

    state = {
        animation: {},
        visible: false,
        validateTitle: {
            validateStatus: '',
            help: '',
        },
        current: 'add',
    }

    render() {
        const { animations } = this.props;
        const { visible, animation, validateTitle } = this.state;
        const { onOk, onCancel, onAdd, onEdit, onDelete, onClear, onChange, onValid } = this.handlers;
        return (
            <Form>
                <FlexBox flexDirection="column">
                    <FlexBox justifyContent="flex-end" style={{ padding: 8 }}>
                        <Button className="rde-action-btn" shape="circle" onClick={onAdd}>
                            <Icon name="plus" />
                        </Button>
                        <Button className="rde-action-btn" shape="circle" onClick={onClear}>
                            <Icon name="times" />
                        </Button>
                        <AnimationModal validateTitle={validateTitle} visible={visible} onOk={onOk} animation={animation} onCancel={onCancel} onChange={onChange} onValid={onValid} />
                    </FlexBox>
                    <AnimationList animations={animations} onEdit={onEdit} onDelete={onDelete} />
                </FlexBox>
            </Form>
        );
    }
}

export default Animations;
