import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, Button, Avatar } from 'antd';
import Icon from '../icon/Icon';

class StyleList extends Component {
    static propTypes = {
        styles: PropTypes.array,
        onEdit: PropTypes.func,
        onDelete: PropTypes.func,
    }

    render() {
        const { styles, onEdit, onDelete } = this.props;
        return (
            <List
                dataSource={styles}
                renderItem={(style, index) => {
                    const actions = [
                        <Button className="rde-action-btn" shape="circle" onClick={() => { onEdit(style, index); }}>
                            <Icon name="edit" />
                        </Button>,
                        <Button className="rde-action-btn" shape="circle" onClick={() => { onDelete(index); }}>
                            <Icon name="times" />
                        </Button>,
                    ];
                    const description = `fill: ${style.fill}, opacity: ${style.opacity}`;
                    return (
                        <List.Item actions={actions}>
                            <List.Item.Meta
                                avatar={<Avatar>{index}</Avatar>}
                                title={style.title}
                                description={description}
                            />
                        </List.Item>
                    );
                }}
            />
        );
    }
}

export default StyleList;
