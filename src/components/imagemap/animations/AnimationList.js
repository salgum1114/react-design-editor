import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, Button, Avatar } from 'antd';

import Icon from '../../icon/Icon';

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
                renderItem={(animation, index) => {
                    const actions = [
                        <Button className="rde-action-btn" shape="circle" onClick={() => { onEdit(animation, index); }}>
                            <Icon name="edit" />
                        </Button>,
                        <Button className="rde-action-btn" shape="circle" onClick={() => { onDelete(index); }}>
                            <Icon name="times" />
                        </Button>,
                    ];
                    return (
                        <List.Item actions={actions}>
                            <List.Item.Meta
                                avatar={<Avatar>{index}</Avatar>}
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
