import { WebAgent } from "@/webAgent/main";
import { FDC3Message, LocalInstance, BroadcastData } from "@/common/types";
import { TOPICS } from "@/common/topics";

export const broadcast = async (localAgent: WebAgent, message: FDC3Message) => {
  const thisInstance = localAgent.localInstances.get(message.source);
  const messageData = message.data as BroadcastData;

  // send to external
  // if instance is 'joined' to a channel, or if this is a broadcast on a specific channel, get the channel and broadcast to it
  const broadcastChannel = messageData.channel || thisInstance?.channel;
  if ((!broadcastChannel || broadcastChannel === "default") && !localAgent.allowBroadcastOnDefault) {
    return;
  }

  if (localAgent.fdc3 && broadcastChannel && broadcastChannel !== "default" ) {
    const remoteChannel = await localAgent.fdc3.getOrCreateChannel(
      broadcastChannel as string
    );
    remoteChannel?.broadcast(messageData.context);
  }

  //handle locally
  //iterate through local instances
  localAgent.localInstances.forEach((instance: LocalInstance) => {
    //prevent echos
    let isMatch: boolean = instance.id !== message.source;
    
    //iterate through listeners on instance
    if (isMatch) {
      instance.contextListeners.forEach((listener, listenerId) => {
        //test channel
        const listenerChannel = listener.channel || instance.channel;
        isMatch = listenerChannel !== undefined && listenerChannel === broadcastChannel;

        //allow localconnections by default
        if (localAgent.allowBroadcastOnDefault) {
          isMatch = (listenerChannel === "default" && broadcastChannel === "default");
        }
        //test context type  - only if the channels line up!
        isMatch = 
            isMatch && (
            messageData.context.type === "*" ||
            listener.contextType === "*" ||
            messageData.context.type === listener.contextType
            );

        if (isMatch) {       
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
