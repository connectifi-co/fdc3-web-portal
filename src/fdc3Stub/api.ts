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
    AppIdentifier,
    PrivateChannel,
} from '@finos/fdc3';
import { sendMessage } from './sendMessage';
import { ListenerItem, ChannelTypes, ChannelData } from '../common/types';
import { TOPICS } from '../common/topics';
import { guid, targetToIdentifier } from '../common/util';



const contextListeners : Map<string, ListenerItem> = new Map();

const intentListeners :  Map<string, Map<string, ListenerItem>> = new Map();

export const createAPI = () : DesktopAgent => {
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
      if (type === 'intent' && intent) {
        this.intent = intent;
      }

      this.unsubscribe = () => {
        if (this.type === 'context') {
          contextListeners.delete(this.id);

          sendMessage(
            TOPICS.DROP_CONTEXT_LISTENER,
            {
              listenerId: this.id,
            },
          );
        } else if (this.type === 'intent' && this.intent) {
          const listeners = intentListeners.get(this.intent);
          if (listeners) {
            listeners.delete(this.id);
          }

          sendMessage(
              TOPICS.DROP_INTENT_LISTENER, 
              {
                listenerId: this.id,
                }
          );
        }
      };
    }

    unsubscribe: () => void;
  }

  interface ListenerItem {
    id?: string;
    handler?: ContextHandler;
    contextType?: string;
  }

  const createListenerItem = (
    id: string,
    handler: ContextHandler,
    contextType?: string,
  ): ListenerItem => {
    const listener: ListenerItem = {};
    listener.id = id;
    listener.handler = handler;
    listener.contextType = contextType;

    return listener;
  };

  const createChannelObject = (
    id: string,
    type: ChannelTypes,
    displayMetadata: DisplayMetadata,
  ): Channel => {
    const channel: Channel = {
      id: id,
      type: type,
      displayMetadata: displayMetadata,
      broadcast: async (context: Context) => {
        await sendMessage(
          TOPICS.BROADCAST,
          {
            context: context,
            channel: channel.id,
          }
        );
        return;
      },
      getCurrentContext: async (contextType?: string) => {
        const result = await sendMessage(
            TOPICS.GET_CURRENT_CONTEXT,
            {
              channel: channel.id,
              contextType: contextType,
            }
          );
        
        if (result.error){
            throw new Error(result.error.type);
        }

        return result.data as Context; 
        
      },

      addContextListener: async (
        contextType: ContextHandler | string | null,
        handler?: ContextHandler,
      ) => {
        const thisListener: ContextHandler = handler
          ? handler
          : (contextType as ContextHandler);
        const thisContextType = handler ? (contextType as string) : undefined;
        const listenerId: string = guid();

        console.log(
          '******************* addContextListenener for channel',
          channel,
        );

        contextListeners.set(
          listenerId,
          createListenerItem(listenerId, thisListener, thisContextType),
        );

        await sendMessage(
          TOPICS.ADD_CONTEXT_LISTENER,
          {
            listenerId: listenerId,
            channel: channel.id,
            contextType: thisContextType,
          }
        );
        return new FDC3Listener(TOPICS.CONTEXT, listenerId);
      },
    };

    return channel;
  };

  function openFunc(
    app: string,
    context?: Context | undefined,
  ): Promise<AppIdentifier>;
  function openFunc(
    app: AppIdentifier,
    context?: Context | undefined,
  ): Promise<AppIdentifier>;
  async function openFunc(
    app: string | AppIdentifier,
    context?: Context | undefined,
  ): Promise<AppIdentifier> {
    const target = targetToIdentifier(app);
    const result = await sendMessage(
        TOPICS.OPEN,
        {
          app: target,
          context: context,
        }
      );

      if (result.error) {
          throw new Error(result.error.type);
      }

      return result.data as AppIdentifier;
  }

  function raiseIntent(
    intent: string,
    context: Context,
    app?: AppIdentifier,
  ): Promise<IntentResolution>;
  function raiseIntent(
    intent: string,
    context: Context,
    app?: String,
  ): Promise<IntentResolution>;
  async function raiseIntent(
    intent: string,
    context: Context,
    app?: AppIdentifier | String,
  ): Promise<IntentResolution> {
    const target = targetToIdentifier(app);

    const result = await sendMessage(
        TOPICS.RAISE_INTENT,
        {
          intent: intent,
          context: context,
          app: target
        }
      );

      if (result.error) {
          throw new Error(result.error.type);
      }
      return (result.data as IntentResolution);
  
  }

  function raiseIntentForContext(
    context: Context,
    app?: AppIdentifier,
  ): Promise<IntentResolution>;
  function raiseIntentForContext(
    context: Context,
    app?: String,
  ): Promise<IntentResolution>;
  async function raiseIntentForContext(
    context: Context,
    app?: AppIdentifier | String,
  ): Promise<IntentResolution> {
    const target = targetToIdentifier(app);
    const result = await sendMessage(
        TOPICS.RAISE_INTENT_FOR_CONTEXT,
        {
          context: context,
          app: target,
        }
      );
      if (result.error) {
        throw new Error(result.error.type);
        }
        return (result.data as IntentResolution);
  }

  const desktopAgent: DesktopAgent = {
    getInfo: async () : Promise<ImplementationMetadata> => {
        const result= await sendMessage(
            TOPICS.GET_INFO,
            {}
          );
        
        if (result.error) {
            throw new Error(result.error.type);
        }
        return result.data as ImplementationMetadata;
    },

    open: openFunc,
    
    
    /*async (app: AppIdentifier, context?: Context) : Promise<AppIdentifier> => {
      const result = await sendMessage(
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
      await sendMessage(
        TOPICS.BROADCAST,
        { context: context }
      );
      return;
    },

    raiseIntent: raiseIntent,

    raiseIntentForContext: raiseIntentForContext,

    addContextListener: async (
      contextType: ContextHandler | string | null,
      handler?: ContextHandler,
    ): Promise<Listener> => {
      const thisListener: ContextHandler = handler
        ? handler
        : (contextType as ContextHandler);
      const thisContextType: string | undefined =
        contextType && handler ? (contextType as string) : undefined;
      const listenerId: string = guid();
      console.log('add context listener', listenerId);
      contextListeners.set(
        listenerId,
        createListenerItem(listenerId, thisListener, thisContextType),
      );

      await sendMessage(
        TOPICS.ADD_CONTEXT_LISTENER,
        {
          listenerId: listenerId,
          contextType: thisContextType,
        }
      );

      return new FDC3Listener('context', listenerId);
    },

    addIntentListener: async (intent: string, listener: ContextHandler): Promise<Listener> => {
      const listenerId: string = guid();
      intent = intent;
      if (!intentListeners.has(intent)) {
        intentListeners.set(intent, new Map());
      }
      const listeners = intentListeners.get(intent);
      if (listeners) {
        listeners.set(listenerId, createListenerItem(listenerId, listener));

       await sendMessage(
          TOPICS.ADD_INTENT_LISTENER,
          {
            listenerId: listenerId,
            intent: intent,
          }
        );
      }
      return new FDC3Listener('intent', listenerId, intent);
    },

    findIntent: async (
      intent: string,
      context: Context,
    ): Promise<AppIntent> => {
      const result = await sendMessage(
        TOPICS.FIND_INTENT,
        {
          intent: intent,
          context: context,
        }
      );
      if (result.error) {
          throw new Error(result.error.type);
      }
      return result.data as AppIntent;
    },

    findIntentsByContext: async (
      context: Context,
    ): Promise<Array<AppIntent>> => {
     const result = await sendMessage(
        TOPICS.FIND_INTENTS_BY_CONTEXT,
        {
          context: context,
        }
      );
      if (result.error) {
        throw new Error(result.error.type);
        }
        return result.data as Array<AppIntent>;
    },

    getSystemChannels: async (): Promise<Array<Channel>> => {
        const result = await sendMessage(
          TOPICS.GET_SYSTEM_CHANNELS,
          {}
        );
      
        if (result.error) {
            throw new Error(result.error.type);
        }
        const channels = (result.data as Array<ChannelData>).map((c: ChannelData) => {
          return createChannelObject(
            c.id,
            'user',
            c.displayMetadata || { name: c.id },
          );
        });
        return channels;
    },

    getUserChannels: async (): Promise<Array<Channel>> => {
      const result = await sendMessage(
        TOPICS.GET_SYSTEM_CHANNELS,
        {}
      );
    
      if (result.error) {
          throw new Error(result.error.type);
      }
      const channels = (result.data as Array<ChannelData>).map((c: ChannelData) => {
        return createChannelObject(
          c.id,
          'user',
          c.displayMetadata || { name: c.id },
        );
      });
      return channels;
    },

    getOrCreateChannel: async (channelId: string) => {
      const result = await sendMessage(
        TOPICS.GET_OR_CREATE_CHANNEL,
        { channel: channelId }
      );
      if (result.error){
          throw new Error(result.error.type);
      }
      const channel = result.data as ChannelData;
      return createChannelObject(
        channel.id,
        channel.type,
        channel.displayMetadata || { name: channel.id },
      );
    },

    joinChannel: async (channel: string) => {
        await sendMessage(
        TOPICS.JOIN_CHANNEL,
        {
          channel: channel,
        }
      );
      return;
    },

    joinUserChannel: async (channel: string) => {
        await sendMessage(
        TOPICS.JOIN_CHANNEL,
        {
          channel: channel,
        }
      );
      return;
    },

    leaveCurrentChannel: async () => {
      await sendMessage(
        TOPICS.LEAVE_CURRENT_CHANNEL,
        {}
      );
      return;
    },

    getCurrentChannel: async () => {
      const result = await sendMessage(
        TOPICS.GET_CURRENT_CHANNEL,
        {}
      );

      if (result.error){
          throw new Error(result.error.type);
      }

      const channel = result.data as ChannelData;

      return channel == null
        ? null
        : createChannelObject(
            channel.id,
            channel.type,
            channel.displayMetadata || { name: channel.id },
          );
    },

    findInstances: async (
        app: AppIdentifier,
      ): Promise<Array<AppIdentifier>> => {
        const result: Array<AppIdentifier> = [app];
        return result;
      },
  
      getAppMetadata: async (app: AppIdentifier): Promise<AppMetadata> => {
        return {
          name: '',
          appId: app.appId,
        };
      },

      createPrivateChannel: async (): Promise<PrivateChannel> => {
        const channelId = guid();
        return createChannelObject(channelId, 'private', {
          name: channelId,
        }) as PrivateChannel;
      },

  };

  return desktopAgent;
};
