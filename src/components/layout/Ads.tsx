import React from "react";
import { Flex } from "../flex";

export function Ads() {
    return (
        <Flex flex="1" justifyContent="flex-end">
            <ins
                className="adsbygoogle"
                style={{ display: 'inline-block', width: 600, height: 60 }}
                data-ad-client="ca-pub-8569372752842198"
                data-ad-slot="5790685139"
            />
        </Flex>
    )
}