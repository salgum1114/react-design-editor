import React from "react";
import Icon from '../icon/Icon';
import { Button } from "antd";

export function UrlModalLabel(props) {
    return (
        <React.Fragment>
            <span style={{ marginRight: 8 }}>{i18n.t('common.url')}</span>
            <Button onClick={props.onClick} shape="circle" className="rde-action-btn">
                <Icon name="edit" />
            </Button>
        </React.Fragment>
    )
}