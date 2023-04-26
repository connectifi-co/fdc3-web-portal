import {
  AppIntent,
  Context,
  DesktopAgent,
  Listener,
  DisplayMetadata,
  AppMetadata,
  ContextHandler,
  Channel,
  ImplementationMetadata,
  IntentResolution,
} from "@finos/fdc3";
import {
  ChannelTypes,
  ChannelData
} from "@/common/types";
import { TOPICS } from "@/common/topics";
import { guid, targetToIdentifier } from "@/common/util";
import { FDC3LocalInstance } from "./sendMessage";





export const createAPI = (connection: FDC3LocalInstance): DesktopAgent => {

  



  /**
   *  the Listener class
   */
  class FDC3Listener implements Listener {
    private id: string;

    type: string;

    intent: string | null = null;

    constructor(type: string, listenerId: string, intent?: string) {
      this.id = listenerId;
      this.type = type;
      if (type === "intent" && intent) {
        this.intent = intent;
      }

      this.unsubscribe = () => {
        if (this.type === "context") {
          connection.contextListeners.delete(this.id);

          connection.sendMessage(TOPICS.DROP_CONTEXT_LISTENER, {
            listenerId: this.id,
          });
        } else if (this.type === "intent" && this.intent) {
          const listeners = connection.intentListeners.get(this.intent);
          if (listeners) {
            listeners.delete(this.id);
          }

          connection.sendMessage(TOPICS.DROP_INTENT_LISTENER, {
            listenerId: this.id,
          });
        }
      };
    }

    unsubscribe: () => void;
  }

  interface ListenerItem {
    id?: string;
    handler?: ContextHandler;
    contextType?: string;
    channel?: string;
  }

  const createListenerItem = (
    id: string,
    handler: ContextHandler,
    contextType?: string,
    channel?: string
  ): ListenerItem => {
    const listener: ListenerItem = {};
    listener.id = id;
    listener.handler = handler;
    listener.contextType = contextType;
    listener.channel = channel;
    return listener;
  };

  const createChannelObject = (
    id: string,
    type: ChannelTypes,
    displayMetadata: DisplayMetadata
  ): Channel => {
    const channel: Channel = {
      id: id,
      type: type,
      displayMetadata: displayMetadata,
      broadcast: async (context: Context) => {
        await connection.sendMessage(TOPICS.BROADCAST, {
          context: context,
          channel: channel.id,
        });
        return;
      },
      getCurrentContext: async (contextType?: string) => {
        const result = await connection.sendMessage(TOPICS.GET_CURRENT_CONTEXT, {
          channel: channel.id,
          contextType: contextType,
        });

        if (result.error) {
          throw new Error(result.error.type);
        }

        return result.data as Context;
      },

      addContextListener: (
        contextType: ContextHandler | string | null,
        handler?: ContextHandler
      ) => {
        const thisListener: ContextHandler = handler
          ? handler
          : (contextType as ContextHandler);
        const thisContextType = handler ? (contextType as string) : undefined;
        const listenerId: string = guid();

        connection.contextListeners.set(
          listenerId,
          createListenerItem(listenerId, thisListener, thisContextType, channel.id)
        );

        connection.sendMessage(TOPICS.ADD_CONTEXT_LISTENER, {
          listenerId: listenerId,
          channel: channel.id,
          contextType: thisContextType,
        });
        return new FDC3Listener(TOPICS.CONTEXT, listenerId);
      },
    };

    return channel;
  };

  async function openFunc(
    app: string | AppMetadata,
    context?: Context | undefined
  ): Promise<void> {
    const target = targetToIdentifier(app);
    const result = await connection.sendMessage(TOPICS.OPEN, {
      target: target,
      context: context,
    });

    if (result.error) {
      throw new Error(result.error.type);
    }

    return;
  }

  function raiseIntent(
    intent: string,
    context: Context,
    app?: AppMetadata
  ): Promise<IntentResolution>;
  function raiseIntent(
    intent: string,
    context: Context,
    app?: String
  ): Promise<IntentResolution>;
  async function raiseIntent(
    intent: string,
    context: Context,
    app?: AppMetadata | String
  ): Promise<IntentResolution> {
    const target = targetToIdentifier(app);

    const result = await connection.sendMessage(TOPICS.RAISE_INTENT, {
      intent: intent,
      context: context,
      target: target,
    });

    if (result.error) {
      throw new Error(result.error.type);
    }
    return result.data as IntentResolution;
  }

  function raiseIntentForContext(
    context: Context,
    app?: AppMetadata
  ): Promise<IntentResolution>;
  function raiseIntentForContext(
    context: Context,
    app?: String
  ): Promise<IntentResolution>;
  async function raiseIntentForContext(
    context: Context,
    app?: AppMetadata | String
  ): Promise<IntentResolution> {
    const target = targetToIdentifier(app);

    const result = await connection.sendMessage(TOPICS.RAISE_INTENT_FOR_CONTEXT, {
      context: context,
      target: target,
    });
    if (result.error) {
      throw new Error(result.error.type);
    }
    return result.data as IntentResolution;
  }

  const desktopAgent: DesktopAgent = {
    getInfo: (): ImplementationMetadata => {
      connection.sendMessage(TOPICS.GET_INFO, {}).then((result) => {
        if (result.error) {
          throw new Error(result.error.type);
        }
        return result.data as ImplementationMetadata;
      });

      return {
        fdc3Version: "1.2",
        provider: "FDC3Stub",
      };
    },

    open: openFunc,

    /*async (app: AppIdentifier, context?: Context) : Promise<AppIdentifier> => {
      const result = await connection.sendMessage(
        TOPICS.OPEN,
        {
          app: app,
          context: context,
        }
      );

      if (result.error) {
          throw new Error(result.error.type);
      }

      return result.data as AppIdentifier;
    },*/

    broadcast: async (context: Context) => {
      await connection.sendMessage(TOPICS.BROADCAST, { context: context });
      return;
    },

    raiseIntent: raiseIntent,

    raiseIntentForContext: raiseIntentForContext,

    addContextListener: (
      contextType: ContextHandler | string | null,
      handler?: ContextHandler
    ): Listener => {
      const thisListener: ContextHandler = handler
        ? handler
        : (contextType as ContextHandler);
      const thisContextType: string | undefined =
        contextType && handler ? (contextType as string) : undefined;
      const listenerId: string = guid();
      connection.contextListeners.set(
        listenerId,
        createListenerItem(listenerId, thisListener, thisContextType)
      );

      connection.sendMessage(TOPICS.ADD_CONTEXT_LISTENER, {
        listenerId: listenerId,
        contextType: thisContextType,
      });

      return new FDC3Listener("context", listenerId);
    },

    addIntentListener: (intent: string, listener: ContextHandler): Listener => {
      const listenerId: string = guid();
      intent = intent;
      if (!connection.intentListeners.has(intent)) {
        connection.intentListeners.set(intent, new Map());
      }
      const listeners = connection.intentListeners.get(intent);
      if (listeners) {
        listeners.set(listenerId, createListenerItem(listenerId, listener));

        connection.sendMessage(TOPICS.ADD_INTENT_LISTENER, {
          listenerId: listenerId,
          intent: intent,
        });
      }
      return new FDC3Listener("intent", listenerId, intent);
    },

    findIntent: async (
      intent: string,
      context: Context
    ): Promise<AppIntent> => {
      const result = await connection.sendMessage(TOPICS.FIND_INTENT, {
        intent: intent,
        context: context,
      });
      if (result.error) {
        throw new Error(result.error.type);
      }
      return result.data as AppIntent;
    },

    findIntentsByContext: async (
      context: Context
    ): Promise<Array<AppIntent>> => {
      const result = await connection.sendMessage(TOPICS.FIND_INTENTS_BY_CONTEXT, {
        context: context,
      });
      if (result.error) {
        throw new Error(result.error.type);
      }
      return result.data as Array<AppIntent>;
    },

    getSystemChannels: async (): Promise<Array<Channel>> => {
      const result = await connection.sendMessage(TOPICS.GET_SYSTEM_CHANNELS, {});

      if (result.error) {
        throw new Error(result.error.type);
      }
      const channels = (result.data as Array<ChannelData>).map(
        (c: ChannelData) => {
          return createChannelObject(
            c.id,
            "user",
            c.displayMetadata || { name: c.id }
          );
        }
      );
      return channels;
    },

    getOrCreateChannel: async (channelId: string) => {
      const result = await connection.sendMessage(TOPICS.GET_OR_CREATE_CHANNEL, {
        channel: channelId,
      });
      if (result.error) {
        throw new Error(result.error.type);
      }
      const channel = result.data as ChannelData;
      return createChannelObject(
        channel.id,
        channel.type,
        channel.displayMetadata || { name: channel.id }
      );
    },

    joinChannel: async (channel: string) => {
      await connection.sendMessage(TOPICS.JOIN_CHANNEL, {
        channel: channel,
      });
      return;
    },

    leaveCurrentChannel: async () => {
      await connection.sendMessage(TOPICS.LEAVE_CURRENT_CHANNEL, {});
      return;
    },

    getCurrentChannel: async () => {
      const result = await connection.sendMessage(TOPICS.GET_CURRENT_CHANNEL, {});

      if (result.error) {
        throw new Error(result.error.type);
      }

      const channel = result.data as ChannelData;

      return channel == null
        ? null
        : createChannelObject(
            channel.id,
            channel.type,
            channel.displayMetadata || { name: channel.id }
          );
    },
  };

  return desktopAgent;
};
