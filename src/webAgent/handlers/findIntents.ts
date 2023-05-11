import { WebAgent } from "@/webAgent/main";
import { FDC3Message } from "@/common/types"
import { noProviderResult } from "./index";
import { FindIntentContextData, FindIntentData } from "@/common/types";

export const findIntentsByContext = async (localAgent: WebAgent, message: FDC3Message) => {
    const fdc3 = localAgent.getFDC3();
    if (!fdc3) {
        return noProviderResult;
    }
    const messageData = message.data as FindIntentContextData;

    try {
        const appIntentData = await fdc3.findIntentsByContext(messageData.context);
        return {
            data: appIntentData
        }
    } catch (err: any) {
        return {
            data: {},
            error: { type: err }
        }
    }
}

export const findIntent = async (localAgent: WebAgent, message: FDC3Message) => {
    const fdc3 = localAgent.getFDC3();
    if (!fdc3) {
        return noProviderResult;
    }
    const messageData = message.data as FindIntentData;

    try {
        const appIntentData = await fdc3.findIntent(messageData.intent);
        return {
            data: appIntentData
        }
    } catch (err: any) {
        return {
            data: {},
            error: { type: err }
        }
    }
}