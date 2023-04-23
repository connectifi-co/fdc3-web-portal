import { createAPI, setListener } from "./api";
import { FDC3LocalInstance } from "./sendMessage";
import { RegisterInstanceReturn } from "@/common/types";
import { DesktopAgent } from "@finos/fdc3";

export const createWebAgentAPI = async (): Promise<DesktopAgent> => {
  
  //instantiate a local instance
  const connection = new FDC3LocalInstance();
  connection.setListener();
  const registrationResult = await connection.sendMessage("registerInstance");
  const instanceId = (registrationResult.data as RegisterInstanceReturn)
    .instanceId;
  console.log("*** API setting instanceId ", instanceId);
  connection.instanceId = instanceId;

  return createAPI(connection);
};
