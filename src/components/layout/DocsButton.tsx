import { Button, Tooltip } from "antd";
import i18next from "i18next";
import React from "react";
import Icon from "../icon/Icon";

export function DocsButton(props) {
    return (
        <Tooltip title={i18next.t('action.go-docs')} overlayStyle={{ fontSize: 16 }}>
            <Button
                className="rde-action-btn"
                style={{
                    color: 'white',
                }}
                shape="circle"
                size="large"
                onClick={props.onClick}
            >
                <Icon name="book" prefix="fas" size={1.5} />
            </Button>
        </Tooltip>
    )
}