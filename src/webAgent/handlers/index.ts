import { WebAgent } from "@/webAgent/main";
import {
  FDC3Message,
  FDC3SendMessageResolution,
  FDC3ReturnError,
} from "@/common/types";
import { TOPICS } from "@/common/topics";
import { addContextListener } from "./contextListeners";
import { broadcast } from "./broadcast";
import { raiseIntent, raiseIntentForContext } from "./raiseIntent";
import {
  getSystemChannels,
  joinChannel,
  getCurrentChannel,
  getCurrentContext,
  leaveCurrentChannel,
  getOrCreateChannel
} from "./channels";

export type FDC3Handler = (
  localAgent: WebAgent,
  message: FDC3Message
) => Promise<FDC3HandlerResult>;

export type FDC3HandlerResult = void | FDC3SendMessageResolution;

export const fdc3Handlers: Map<string, FDC3Handler> = new Map();

export const noFDC3ProviderError: FDC3ReturnError = {
  type: "NoFDC3Provider",
  message: "No FDC3 Provider Found.",
};

export const noProviderResult: FDC3HandlerResult = {
  data: {},
  error: noFDC3ProviderError,
};

fdc3Handlers.set(TOPICS.ADD_CONTEXT_LISTENER, addContextListener);
fdc3Handlers.set(TOPICS.BROADCAST, broadcast);
fdc3Handlers.set(TOPICS.GET_SYSTEM_CHANNELS, getSystemChannels);
fdc3Handlers.set(TOPICS.JOIN_CHANNEL, joinChannel);
fdc3Handlers.set(TOPICS.GET_OR_CREATE_CHANNEL, getOrCreateChannel);
fdc3Handlers.set(TOPICS.GET_CURRENT_CHANNEL, getCurrentChannel);
fdc3Handlers.set(TOPICS.GET_CURRENT_CONTEXT, getCurrentContext);
fdc3Handlers.set(TOPICS.LEAVE_CURRENT_CHANNEL, leaveCurrentChannel);
fdc3Handlers.set(TOPICS.RAISE_INTENT, raiseIntent);
fdc3Handlers.set(TOPICS.RAISE_INTENT_FOR_CONTEXT, raiseIntentForContext);
