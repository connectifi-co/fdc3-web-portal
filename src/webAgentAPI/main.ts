import { createAPI } from "./api";
import { FDC3LocalInstance } from "./sendMessage";
import { DesktopAgent } from "@finos/fdc3";

export const createWebAgentAPI = async (): Promise<DesktopAgent> => {
  
  //instantiate a local instance
  const connection = new FDC3LocalInstance();
  await connection.initConnection();
  return createAPI(connection);
};
