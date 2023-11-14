export type DescriptorsType = "TRIGGER" | "LOGIC" | "DATA" | "ACTION"

export class WorkflowDescriptor {
    name: string;
    description: string;
    type: DescriptorsType;
    nodeClazz: string;
    defaultConfiguration: {
        scheduleType?: string;
        interval?: number;
        timeUnit?: string;
        payload?: string;
        outputCount?: number;
        delaySec?: number;
        jsScript?: string;
        routes?: string[];
        keyTemplate?: null;
        resultPath: string;
        operation: string;
        valueTemplate?: null;
        loggingLevel?: string;
        messageTemplate?: null;
        subjectTemplate?: string;
        receiversTemplate?: string;
        textTemplate?: string;
    };
    isEnabled: boolean;
    outPortType: string;
    outPorts: string[];
    icon: string; 
}