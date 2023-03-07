import { guid } from '../common/util';
import { LocalInstance, ChannelInstance, FDC3Message, ContextListenerData, BroadcastData } from '../common/types';
import { TOPICS } from '../common/topics';
import { DesktopAgent, Context } from '@finos/fdc3';



/**
 * FDC3Stub is a standard implementation of FDC3 that will provide an FDC3 api interface as either
 * a module or global scope.   The FDC3Stub abstracts the actual FDC3 Connection, so that
 * an app or module can be written to the stub and have an FDC3 provider plugged in after the fact
 * 
 * localAgent
 * 
 * localAgents handle webpages that are split into AppBoundaries - either by iframes or some other
 * logical boundaries in the page - each boundary is marked by a different instance of the FDC3Stub.
 * 
 * local implementation of a FDC3 Desktop Agent
 * manages state of 'local' channels (system/user & app)
 * registry of intent listeners
 * registry of context listeners
 * 
 * a localAgent does NOT
 * - connect to a directory
 * - open apps
 * - resolve intents
 * 
 * a localAgent DOES
 * - register each AppBoundary and assign it an instanceId
 * - register local context and intent listeners
 * - route context and intents to local listeners
 * - register local channel affiliation
 * 
 * Question: 
 *  - can we have reliable detection of when an AppBoundary has gone away or been replaced based on 
 *      a new registration coming from an iFrame with a previous registration
 * 
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



export class LocalAgent {

    //collection of 'app' instances or app bounderies local to the page
    localInstances: Map<string, LocalInstance>;

    //collection of channels for local state
    channels: Map<string, ChannelInstance>;

    fdc3: DesktopAgent | undefined;

    constructor () {

        this.localInstances = new Map();
        this.channels = new Map();
        

        //set up listeners
        this.initListeners();
    }

    setFDC3( fdc3: DesktopAgent) {
        this.fdc3 = fdc3;
    }

    initListeners () {
        //add message listener
        window.addEventListener('message', async (event: MessageEvent) => {
            const message : FDC3Message= event.data || {}  as FDC3Message;
            const messageSource = event.source;
            
            

            //registration
            //send back an instanceId
            if (message.topic === 'registerInstance'){
                //generate a guid
                const instanceId = guid();
                //add to the localInstances collection
                this.localInstances.set(instanceId, {
                    id: instanceId,
                    channel: 'default',
                    contextListeners:new Map(),
                    intentListeners: new Map(),
                    source: messageSource
                });

                //send back as instanceId
                messageSource?.postMessage({
                    topic: message.returnId,
                    data: {
                        instanceId: instanceId
                    }
                });
            } 
            //sendHandler

            //get instanceId from the message
            if (message.topic === TOPICS.ADD_CONTEXT_LISTENER){
                //get the instance
                const instance = this.localInstances.get(message.source);
                const messageData = message.data as ContextListenerData;
                //register the listener
                if (instance){
                    instance.contextListeners.set(messageData.listenerId, 
                        {
                            contextType: messageData.contextType || '*',
                            handler: (context: Context) => {
                                //send a context message to the listener source
                                instance.source?.postMessage({
                                    topic: TOPICS.CONTEXT,
                                    data: {
                                        context: context,
                                        listenerId: messageData.listenerId
                                    }
                                })
                            }                        
                        });
                }
                
                //register with external FDC3
                
                if (this.fdc3){
                    this.fdc3.addContextListener(messageData.contextType || '*', (context : Context) => {
                        instance?.contextListeners?.get(messageData.listenerId)
                    });
                } else {
                    document.addEventListener("fdc3Ready", () => {
                        if (this.fdc3){
                            this.fdc3.addContextListener(messageData.contextType || '*', (context : Context) => {
                                instance?.contextListeners?.forEach( listener => {
                                    listener.handler.call(this, context);
                                });
                            });
                        }   
                    });
                }

                
                //send a return message
                messageSource?.postMessage({
                    topic: message.returnId,
                    data: {

                    }
                });
            }

            else if (message.topic === TOPICS.BROADCAST){
                const thisInstance = this.localInstances.get(message.source);
                const messageData = message.data as BroadcastData;

                //send to external
                if (this.fdc3){
                    this.fdc3.broadcast(messageData.context);
                }

                //handle locally
                //iterate through local instances
                this.localInstances.forEach((instance : LocalInstance) => {
                    //prevent echos
                    let isMatch : boolean = instance.id !== message.source;

                    if (isMatch){
                        instance.source?.postMessage({
                            topic: TOPICS.CONTEXT,
                            data: {
                                context: messageData.context,
                               // listenerId: instance.contextListeners.listenerId
                            }
                        });
                    }


                });
            }

        });
        
    }


 }