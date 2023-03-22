import { WebAgent } from "@/webAgent/main";
import { noProviderResult } from "./index";
import { FDC3Message, RaiseIntentData } from "@/common/types";

export const raiseIntent = async (
  localAgent: WebAgent,
  message: FDC3Message
) => {
  const fdc3 = localAgent.getFDC3();
  if (!fdc3) {
    return noProviderResult;
  }
  const messageData = message.data as RaiseIntentData;

  await fdc3.raiseIntent(
    messageData.intent,
    messageData.context || { type: "none" },
    messageData.target
  );

  return;
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

  await fdc3.raiseIntentForContext(
    messageData.context || { type: "none" },
    messageData.target
  );

  return;
};
