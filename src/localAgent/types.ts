import { Context } from '@finos/fdc3';

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