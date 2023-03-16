import {
  Context,
  ContextHandler,
  DisplayMetadata,
  AppMetadata,
  Listener
} from "@finos/fdc3";

/*
 * LocalInstance Type
 *  - id
 *  - channel
 *  - contextListeners (Map listenerId, ContextListener)
 *  - intentListeners (Map listenerId, IntentListener)
 *
 * ChannelInstance Type
 *  - id
 *  - type
 *  - context (Map contextType, Context) only stores current context (by type)
 *
 * ContextListener Type
 *  - contextType
 *  - channel ?
 *
 * IntentListener Type
 * - intent
 * - contextType ?
 *
 */

export interface LocalInstance {
  id: string;
  channel: string;
  contextListeners: Map<string, ContextListener>;
  intentListeners: Map<string, IntentListener>;
  channelListener?: Listener; //listener to proxy for the 'joined' channel
  source: MessageEventSource | null;
}

export interface ChannelInstance {
  id: string;
  type: "user" | "app" | "private";
  context: Map<string, Context>;
}

export interface ContextListener {
  contextType: string;
  channel?: string;
  handler: (context: Context) => void;
}

export interface IntentListener {
  intent: string;
  contextType?: string;
}

//type for the callback to the return (ack/nack) handler
export interface FDC3ReturnMessage {
  topic: string;
  data?: FDC3ReturnMessageData;
  error?: FDC3ReturnError;
}

//type ultimately returned to sendMessage in the stub (API)
export interface FDC3SendMessageResolution {
  data: FDC3ReturnMessageData;
  error?: FDC3ReturnError;
}

/*
    message from stub (API) to localAgent
 */
export interface FDC3Message {
  topic: string;
  returnId: string;
  source: string; //instanceId of the origin of the message
  data: FDC3MessageData;
}

export interface FDC3ReturnError {
  type: string;
  message?: string;
}

export type FDC3MessageData =
  | ContextListenerData
  | IntentListenerData
  | BroadcastData
  | CurrentContextData
  | ChannelMessageData
  | ListenerMessageData
  | FindIntentData
  | FindIntentContextData
  | OpenData
  | RaiseIntentData
  | RaiseIntentContextData
  | EmptyMessage;

export interface EmptyMessage {
  context?: Context;
}

/*
 describes data for creating a context listener
*/
export interface ContextListenerData {
  listenerId: string;
  contextType?: string;
  channel?: string; //id of channel scope (if scoped)
}

/*
 describes data for creating an intent listener
*/
export interface IntentListenerData {
  listenerId: string;
  intent: string;
}

/*
 describes data for a broadcast message
*/
export interface BroadcastData {
  context: Context;
  channel?: string; //id of channel scope (if scoped)
}

/*
 describes data for a getCurrentContext message
*/
export interface CurrentContextData {
  contextType?: string;
  channel: string; //id of channel scope
}

/*
 describes data for a message only identifiying a channel (e.g. joinChannel, getOrCreateChannel)
*/
export interface ChannelMessageData {
  channel: string; //id of channel scope
}

/*
 describes data for identifiying a listener 
*/
export interface ListenerMessageData {
  listenerId: string;
}

/*
 descibes data for the find intent API
*/
export interface FindIntentData {
  intent: string;
  context?: Context;
  resultType?: string; //2.0 only
}

/*
 descibes data for the find intent by context API
*/
export interface FindIntentContextData {
  context: Context;
  resultType?: string; //2.0 only
}

/*
 describe data for the open API
*/
export interface OpenData {
  target: AppMetadata;
  context?: Context | undefined;
}

/*
 describe data for raiseIntent API
*/
export interface RaiseIntentData {
  intent: string;
  context?: Context | undefined;
  target?: AppMetadata | undefined;
}

/*
 describe data for raiseIntentForContext API
*/
export interface RaiseIntentContextData {
  context: Context;
  target?: AppMetadata| undefined;
}

/*
 data for intent resolution (from the end user)
*/
/*export interface ResolveIntentData {
 selected: FDC3App;
 intent: string;
 context?: Context | undefined;
}*/

export type FDC3ReturnMessageData = {} | RegisterInstanceReturn;

export interface RegisterInstanceReturn {
  instanceId: string;
}

export interface ListenerItem {
  id?: string;
  handler?: ContextHandler;
  contextType?: string;
}

/**
 * cross version representation of channel data
 */
export interface ChannelData {
  id: string;
  type: ChannelTypes;
  displayMetadata?: ChannelMetadata;
}

export class ChannelMetadata implements DisplayMetadata {
  /**
   * A user-readable name for this channel, e.g: `"Red"`
   */
  name?: string;

  /**
   * The color that should be associated within this channel when displaying this channel in a UI, e.g: `0xFF0000`.
   */
  color?: string;

  /**
   * A URL of an image that can be used to display this channel
   */
  glyph?: string;

  /**
   * alternate / secondary color to use in conjunction with 'color' when creating UIs
   */
  color2?: string;
}

export type ChannelTypes = "user" | "app" | "private";

