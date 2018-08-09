import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, Button } from 'antd';
import Icon from '../Icon';

class AnimationList extends Component {
    static propTypes = {
        animations: PropTypes.array,
        onEdit: PropTypes.func,
        onDelete: PropTypes.func,
    }

    render() {
        const { animations, onEdit, onDelete } = this.props;
        return (
            <List
                dataSource={animations}
                renderItem={(animation) => {
                    const actions = [
                        <Button className="rde-action-btn" shape="circle" onClick={() => { onEdit(animation); }}>
                            <Icon name="edit" />
                        </Button>,
                        <Button className="rde-action-btn" shape="circle" onClick={() => { onDelete(animation.title); }}>
                            <Icon name="times" />
                        </Button>,
                    ];
                    return (
                        <List.Item actions={actions}>
                            <List.Item.Meta
                                title={animation.title}
                                description={animation.type}
                            />
                        </List.Item>
                    );
                }}
            />
        );
    }
}

export default AnimationList;
