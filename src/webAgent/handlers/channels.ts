import { WebAgent } from "@/webAgent/main";
import {
  FDC3Message,
  CurrentContextData,
  ChannelMessageData,
  FDC3SendMessageResolution,
} from "@/common/types";
import { Context, Channel, Listener } from "@finos/fdc3";
import { noProviderResult } from "./index";
import { TOPICS } from "@/common/topics";

// get the channels from the fdc3 connection
export const getSystemChannels = async (
  localAgent: WebAgent
): Promise<void | FDC3SendMessageResolution> => {
  if (!localAgent.fdc3) {
    return noProviderResult;
  }
  const channels = await localAgent.fdc3.getUserChannels();
  return { data: channels };
};

export const getCurrentChannel = async (
  localAgent: WebAgent,
  message: FDC3Message
): Promise<void | FDC3SendMessageResolution> => {
  if (!localAgent.fdc3) {
    return noProviderResult;
  }

  const instance = localAgent.localInstances.get(message.source);
  const channelId = instance?.channel;
  let channel: Channel | undefined;
  if (!channelId || channelId === "default") {
    return;
  } else {
    try {
      channel = await localAgent.fdc3.getOrCreateChannel(channelId);
    } catch (err: any) {
      return {
        data: {},
        error: { type: err },
      };
    }
    //serialize back the channel
    return {
      data: {
        id: channel?.id,
        type: channel?.type,
        displayMetadata: channel?.displayMetadata,
      },
    };
  }
};

export const getCurrentContext = async (
  localAgent: WebAgent,
  message: FDC3Message
): Promise<void | FDC3SendMessageResolution> => {
  const fdc3 = localAgent.getFDC3();
  if (!fdc3) {
    return noProviderResult;
  }

  const data: CurrentContextData = message.data as CurrentContextData;

  const channelId = data.channel;
  const contextType = data.contextType;
  let channel: Channel | undefined;
  let context: Context | null | undefined;

  //keep all channel state with the fdc3 provider
  if (channelId) {
    try {
      channel = await fdc3.getOrCreateChannel(channelId);
    } catch (err: any) {
      return {
        data: {},
        error: { type: err },
      };
    }
    if (channel) {
      try {
        context = await channel.getCurrentContext(contextType);
        console.log("here!!!", context);
        console.log("get Current Context from Connection", context);
      } catch (err: any) {
        return {
          data: {},
          error: { type: err },
        };
      }
      if (context) {
        return { data: context };
      }
    }
  }

  return;
};

export const getOrCreateChannel = async (
  localAgent: WebAgent,
  message: FDC3Message
) => {
  const fdc3 = localAgent.getFDC3();
  if (!fdc3) {
    return noProviderResult;
  }
  const data: ChannelMessageData = message.data as ChannelMessageData;
  const channelId = data.channel;
  let channel: Channel | undefined;
  //get the channel from the provider

  try {
    channel = await fdc3.getOrCreateChannel(channelId);
  } catch (err: any) {
    return {
      data: {},
      error: { type: err },
    };
  }
  //serialize back the channel
  return {
    data: {
      id: channel?.id,
      type: channel?.type,
      displayMetadata: channel?.displayMetadata,
    },
  };
};

export const leaveCurrentChannel = async (
  localAgent: WebAgent,
  message: FDC3Message
) => {
  const fdc3 = localAgent.getFDC3();
  if (!fdc3) {
    return noProviderResult;
  }
  const instance = localAgent.localInstances.get(message.source);
  if (!instance) {
    return;
  }

  instance.channel = "default";
  instance.channelListener?.unsubscribe();

  return;
};

export const joinChannel = async (
  localAgent: WebAgent,
  message: FDC3Message
) => {
  const fdc3 = localAgent.getFDC3();
  if (!fdc3) {
    return noProviderResult;
  }
  const data: ChannelMessageData = message.data as ChannelMessageData;
  const channelId = data.channel;
  const instance = localAgent.localInstances.get(message.source);
  let channel: Channel | undefined;
  let listener: Listener | undefined;
  if (!instance) {
    return;
  }

  const joinListener = (context: Context) => {
    //match on listeners where channel is set to default and the context type matches
    let isMatch: boolean = false;
    instance.contextListeners.forEach((listener, listenerId) => {
      isMatch =
        (listener.channel || "default") === "default" &&
        (context.type === "*" ||
          listener.contextType === "*" ||
          context.type === listener.contextType);
      if (isMatch) {
        instance.source?.postMessage({
          topic: TOPICS.CONTEXT,
          data: {
            context: context,
            listenerId: listenerId,
          },
        }, "*");
      }
    });
  };
  try {
    channel = await fdc3.getOrCreateChannel(channelId);
  } catch (err: any) {
    return {
      data: {},
      error: { type: err },
    };
  }
  if (channel) {
    try {
      listener = await channel.addContextListener("*", joinListener);
    } catch (err: any) {
      return {
        data: {},
        error: { type: err },
      };
    }
  }
  instance.channel = channelId;
  //unsubscribe from any pre-existing channelListener
  if (instance.channelListener) {
    await instance.channelListener.unsubscribe();
  }
  instance.channelListener = listener;
  //get the current context for the new channel
  const current = await channel?.getCurrentContext();
  if (current) {
    instance.contextListeners.forEach((listener, listenerId) => {
      if (
        current.type === "*" ||
        listener.contextType === "*" ||
        current.type === listener.contextType
      ) {
        instance.source?.postMessage({
          topic: TOPICS.CONTEXT,
          data: {
            context: current,
            listenerId: listenerId,
          },
        }, "*");
      }
    });
  }

  return;
};
