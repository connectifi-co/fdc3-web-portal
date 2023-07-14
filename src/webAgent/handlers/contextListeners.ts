import { WebAgent } from "@/webAgent/main";
import { FDC3Message, ContextListenerData } from "@/common/types";
import { TOPICS } from "@/common/topics";
import { Context, Channel } from "@finos/fdc3";
import { ConnectifiDesktopAgent, ConnectifiEventTypes } from "@connectifi/agent-web";


export const addContextListener = async (
  localAgent: WebAgent,
  message: FDC3Message
) => {
  //get the instance
  const instance = localAgent.localInstances.get(message.source);
  const messageData = message.data as ContextListenerData;
  const loadCurrentContext = async () => {
    let channel : Channel | null | undefined;
    let context : Context | null | undefined;
    try {
      if (messageData.channel){
        channel = await localAgent.fdc3?.getOrCreateChannel(messageData.channel);
      }
      else {
        channel = await localAgent.fdc3?.getCurrentChannel();
      }
    } catch (err: any) {
      return {
        data: {},
        error: { type: err },
      };
    }
    if (channel){
      try {
        context = await channel?.getCurrentContext(messageData.contextType || "*");
      } catch (err: any) {
        return {
          data: {},
          error: { type: err },
        };
      }
      if (instance && context){
        instance.source?.postMessage({
          topic: TOPICS.CONTEXT,
          data: {
            context: context,
            channel: messageData.channel,
            listenerId: messageData.listenerId,
          },
        }, "*");
      }
    }
    return;
  };

  //register the listener
  if (instance) {
    instance.contextListeners.set(messageData.listenerId, {
      contextType: messageData.contextType || "*",
      channel: messageData.channel || 'default',
      handler: (context: Context) => {
        //send a context message to the listener source
        instance.source?.postMessage({
          topic: TOPICS.CONTEXT,
          data: {
            context: context,
            channel: messageData.channel,
            listenerId: messageData.listenerId,
          },
        }, "*");
      },
    });

    //if using Connectifi, add a onConnect listener to handle reconnects
    const agent : ConnectifiDesktopAgent = localAgent.fdc3 as ConnectifiDesktopAgent;
    if (localAgent.autosync && agent?.addEventListener) {
      agent.addEventListener(ConnectifiEventTypes.CONNECT,() => {
          loadCurrentContext();
      });
    }

    //send the current context immediately as well
    if (localAgent.autosync){ 
      loadCurrentContext();
    }
  }

  //register with external FDC3
  //handle setting listener on a channel scope
  const listenerHandler = (context: Context) => {
       instance?.contextListeners?.forEach((listener) => {
        let match = true;
        if (messageData.channel && messageData.channel !== listener.channel){
          match = false;
        }
        if (messageData.contextType && messageData.contextType !== listener.contextType){
          match = false;
        }
        if (match){
          listener.handler.call(this, context);
        }
      });
    };


    const setListener = async () => {
      if (! localAgent?.fdc3){
        return;
      }
  
      if (messageData.channel) {
        const channel = await localAgent.fdc3.getOrCreateChannel(messageData.channel);
        channel.addContextListener(
          messageData.contextType || "*",
          listenerHandler
        );
      } else {
        localAgent.fdc3.addContextListener(
          messageData.contextType || "*",
          listenerHandler
        );
        
      }
    };

    if (localAgent.fdc3) {
      await setListener();
    } else {
      document.addEventListener("fdc3Ready", async () => {
        if (localAgent.fdc3) {
          await setListener();
        }
      });
    }

  return;
  };
