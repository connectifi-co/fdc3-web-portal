import { createAPI, setListener } from "./api";
import { sendMessage, setInstanceId } from "./sendMessage";
import { RegisterInstanceReturn } from "@/common/types";
import { DesktopAgent } from "@finos/fdc3";

export const createWebAgentAPI = async (): Promise<DesktopAgent> => {
  setListener();

  const registrationResult = await sendMessage("registerInstance");
  const instanceId = (registrationResult.data as RegisterInstanceReturn)
    .instanceId;
  setInstanceId(instanceId);

  return createAPI();
};
