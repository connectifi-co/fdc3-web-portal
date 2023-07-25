import { WebAgent } from "@/webAgent/main";
import { noProviderResult } from "./index";
import { FDC3Message, RaiseIntentData } from "@/common/types";
import { IntentResolution } from "@finos/fdc3";

export const raiseIntent = async (
  localAgent: WebAgent,
  message: FDC3Message
) => {
  const fdc3 = localAgent.getFDC3();
  if (!fdc3) {
    return noProviderResult;
  }
  const messageData = message.data as RaiseIntentData;
  let resolution: IntentResolution | undefined;
  try {
    resolution = await fdc3.raiseIntent(
      messageData.intent,
      messageData.context || { type: "none" },
      messageData.target
    );
  } catch (err: any) {
    return {
      data: {},
      error: { type: err },
    };
  }
  return {
    data: {
      version: resolution?.version,
      intent: resolution?.intent,
      source: resolution?.source,
    },
  };
};

export const raiseIntentForContext = async (
  localAgent: WebAgent,
  message: FDC3Message
) => {
  const fdc3 = localAgent.getFDC3();
  if (!fdc3) {
    return noProviderResult;
  }
  const messageData = message.data as RaiseIntentData;
  let resolution: IntentResolution | undefined;
  try {
    resolution = await fdc3.raiseIntentForContext(
      messageData.context || { type: "none" },
      messageData.target
    );
  } catch (err: any) {
    return {
      data: {},
      error: { type: err },
    };
  }
  return {
    data: {
      version: resolution?.version,
      intent: resolution?.intent,
      source: resolution?.source,
    },
  };
};
