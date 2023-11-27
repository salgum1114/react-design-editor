import { Button, Tooltip } from "antd";
import i18next from "i18next";
import Icon from '../icon/Icon';
import React from "react";

export function GitHubButton(props) {
    return ( 
        <Tooltip title={i18next.t('action.go-github')} overlayStyle={{ fontSize: 16 }}>
            <Button
                className="rde-action-btn"
                style={{
                    color: 'white',
                }}
                shape="circle"
                size="large"
                onClick={props.onClick}
            >
                <Icon name="github" prefix="fab" size={1.5} />
            </Button>
        </Tooltip>
    )
}