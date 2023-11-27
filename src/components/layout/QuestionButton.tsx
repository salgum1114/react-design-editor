import { Button, Tooltip } from "antd";
import i18next from "i18next";
import React from "react";
import Icon from "../icon/Icon";

export function QuestionButton(props) {
    return (
        <Tooltip title={i18next.t('action.shortcut-help')} overlayStyle={{ fontSize: 16 }}>
            <Button
                className="rde-action-btn"
                style={{
                    color: 'white',
                }}
                shape="circle"
                size="large"
                onClick={props.onClick}
            >
                <Icon name="question" prefix="fas" size={1.5} />
            </Button>
        </Tooltip>
    )
}