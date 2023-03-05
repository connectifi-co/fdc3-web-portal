import { Context, ContextHandler, DisplayMetadata } from '@finos/fdc3';

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
 }

 export interface ChannelInstance {
     id: string;
     type: 'user' | 'app' | 'private';
     context: Map<string, Context>;
 }

 export interface ContextListener {
    contextType: string;
    channel?: string;
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

 //type ultimately returned to sendMessage
 export interface FDC3SendMessageResolution {
    data: FDC3ReturnMessageData;
    error?: FDC3ReturnError;
 }

 export interface FDC3Message {
     topic: string;
     returnId: string;
     data: FDC3MessageData;
 }


 export interface FDC3ReturnError {
     type: string;
     description?: string;
 }

 export type FDC3MessageData = {};

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

  export type ChannelTypes = 'user' | 'app' | 'private';