import { WebAgent } from "@/webAgent/main";
import {
  FDC3Message,
  LocalInstance,
  BroadcastData,
  FDC3ReturnError,
} from "@/common/types";
import { FDC3HandlerResult } from "./index";
import { TOPICS } from "@/common/topics";
import { DesktopAgent } from "@finos/fdc3";

export const broadcast = async (
  localAgent: WebAgent,
  message: FDC3Message
): Promise<FDC3HandlerResult > => {
  const thisInstance = localAgent.localInstances.get(message.source);
  const messageData = message.data as BroadcastData;

  // if there's no channel to broadcast to or if the channel is
  // "default" and broadcasting on default is not allowed, exit out
  const broadcastChannel = messageData.channel || thisInstance?.channel;
  if (
    !broadcastChannel ||
    (broadcastChannel === "default" && !localAgent.allowBroadcastOnDefault)
  ) {
    return;
  }

  const fdc3 = localAgent.fdc3 as DesktopAgent;

  // if we do have a non-default channel, broadcast externally on that specific channel
  if (fdc3 && broadcastChannel && broadcastChannel !== "default") {
    const remoteChannel = await fdc3.getOrCreateChannel(
      broadcastChannel as string
    );
    try {
      await remoteChannel?.broadcast(messageData.context);
    } catch (err) {
      return { data: {}, error: err as FDC3ReturnError };
    }
  }
  //if allowBroadcastOnDefault is set, and there isn't a channel scope, then broadcast externally on the fdc3 scope
  else if (localAgent.allowBroadcastOnDefault) {
    try {
      await fdc3.broadcast(messageData.context);
    } catch (err) {
      return { data: {}, error: err as FDC3ReturnError };
    }
  }

  // broadcast to all the other local instances which have context listeners
  localAgent.localInstances.forEach((instance: LocalInstance) => {
    // prevent echos
    if (instance.id !== message.source) {
      // iterate through listeners on the instance
      instance.contextListeners.forEach((listener, listenerId) => {
        const listenerChannel =
          listener.channel === "default"
            ? instance.channel || "default"
            : listener.channel;

        // ensure channels match and the context types are appropriate
        if (
          listenerChannel === broadcastChannel &&
          (messageData.context.type === "*" ||
            listener.contextType === "*" ||
            messageData.context.type === listener.contextType)
        ) {
          instance.source?.postMessage({
            topic: TOPICS.CONTEXT,
            data: {
              context: messageData.context,
              channel: messageData.channel,
              listenerId: listenerId,
            },
          });
        }
      });
    }
  });

  return;
};
