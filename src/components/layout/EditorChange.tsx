import React from "react";
import { Flex } from "../flex";
import { Menu } from "antd";
import i18next from "i18next";

export function EditorChange(props) {
    return (
        <Flex style={{ marginLeft: 88 }}>
            <Menu
                mode="horizontal"
                theme="dark"
                style={{ background: 'transparent', fontSize: '16px' }}
                onClick={props.onClick}
                selectedKeys={[props.selectedKeys]}
            >
                <Menu.Item key="imagemap" style={{ color: '#fff' }}>
                    {i18next.t('imagemap.imagemap')}
                </Menu.Item>
                <Menu.Item key="workflow" style={{ color: '#fff' }}>
                    {i18next.t('workflow.workflow')}
                </Menu.Item>
            </Menu>
        </Flex>
    )
}