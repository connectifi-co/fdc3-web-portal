import { WebAgent } from "@/webAgent/main";
import { FDC3Message, LocalInstance, BroadcastData } from "@/common/types";
import { TOPICS } from "@/common/topics";

export const broadcast = async (localAgent: WebAgent, message: FDC3Message) => {
  const thisInstance = localAgent.localInstances.get(message.source);
  const messageData = message.data as BroadcastData;

  // if there's no channel to broadcast to or if the channel is 
  // "default" and broadcasting on default is not allowed, exit out
  const broadcastChannel = messageData.channel || thisInstance?.channel;
  if (!broadcastChannel || (broadcastChannel === "default" && !localAgent.allowBroadcastOnDefault)) {
    return;
  }

  // if we do have a non-default channel, broadcast externally
  if (localAgent.fdc3 && broadcastChannel && broadcastChannel !== "default" ) {
    const remoteChannel = await localAgent.fdc3.getOrCreateChannel(
      broadcastChannel as string
    );
    remoteChannel?.broadcast(messageData.context);
  }

  // broadcast to all the other local intances which have context listeners
  localAgent.localInstances.forEach((instance: LocalInstance) => {

    // prevent echos
    if (instance.id !== message.source) {

      // iterate through listeners on the instance
      instance.contextListeners.forEach((listener, listenerId) => {
        const listenerChannel = listener.channel || instance.channel;

        // ensure channels match and the context types are appropriate
        if (
          listenerChannel === broadcastChannel && (
          messageData.context.type === "*" ||
          listener.contextType === "*" ||
          messageData.context.type === listener.contextType)
        ) {
          instance.source?.postMessage({
            topic: TOPICS.CONTEXT,
            data: {
              context: messageData.context,
              listenerId: listenerId,
            },
          });
        }
      });
    }
  });

  return;
};
