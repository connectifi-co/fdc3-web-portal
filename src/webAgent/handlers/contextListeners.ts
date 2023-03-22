import { WebAgent } from "@/webAgent/main";
import { FDC3Message, ContextListenerData } from "@/common/types";
import { TOPICS } from "@/common/topics";
import { Context } from "@finos/fdc3";

export const addContextListener = async (
  localAgent: WebAgent,
  message: FDC3Message
) => {
  //get the instance
  const instance = localAgent.localInstances.get(message.source);
  const messageData = message.data as ContextListenerData;
  //register the listener
  if (instance) {
    instance.contextListeners.set(messageData.listenerId, {
      contextType: messageData.contextType || "*",
      handler: (context: Context) => {
        //send a context message to the listener source
        instance.source?.postMessage({
          topic: TOPICS.CONTEXT,
          data: {
            context: context,
            listenerId: messageData.listenerId,
          },
        });
      },
    });
  }

  //register with external FDC3

  if (localAgent.fdc3) {
    localAgent.fdc3.addContextListener(
      messageData.contextType || "*",
      (_context: Context) => {
        instance?.contextListeners?.get(messageData.listenerId);
      }
    );
  } else {
    document.addEventListener("fdc3Ready", () => {
      if (localAgent.fdc3) {
        localAgent.fdc3.addContextListener(
          messageData.contextType || "*",
          (context: Context) => {
            instance?.contextListeners?.forEach((listener) => {
              listener.handler.call(this, context);
            });
          }
        );
      }
    });
  }

  return;
};
