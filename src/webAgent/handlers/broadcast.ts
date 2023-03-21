import { LocalAgent } from '@/localAgent/main';
import { FDC3Message, LocalInstance, BroadcastData } from '@/common/types';
import { TOPICS } from '@/common/topics';

export const broadcast = async ( localAgent : LocalAgent,  message : FDC3Message) => { 
    const thisInstance = localAgent.localInstances.get(message.source);
    const messageData = message.data as BroadcastData;

    //send to external
    //if instance is 'joined' to a channel, or if this is a broadcast on a specific channel, get the channel and broadcast to it
    const broadcastChannel = messageData.channel || thisInstance?.channel;
    if (localAgent.fdc3 && broadcastChannel && broadcastChannel !== 'default'){  
        const remoteChannel = await localAgent.fdc3.getOrCreateChannel(broadcastChannel);
        remoteChannel?.broadcast(messageData.context);
    }
    
    //what is the channel?  it is either explicit on the message, or implicit from channel membership
    //if no channel, no-op
    let channel : string | undefined;

    if (messageData.channel) {
        channel = messageData.channel;
    } else {
        channel = thisInstance?.channel;
    }
    if (!channel){
        return;
    }
    
    //handle locally
    //iterate through local instances
    localAgent.localInstances.forEach((instance : LocalInstance) => {
        //prevent echos
        let isMatch : boolean = instance.id !== message.source;
        //iterate through listeners on instance
        if (isMatch) {
            instance.contextListeners.forEach((listener, listenerId) => {
                 //test channel
                 const listenerChannel = listener.channel || instance.channel;
                 isMatch = (listenerChannel !== undefined && listenerChannel === channel);
                 //allow localconnections by default
                 if (localAgent.noDefaultChannel){
                     isMatch = !(listenerChannel === 'default' && channel === 'default');
                 }
                //test context type  - only if the channels line up!
                if (isMatch){
                    isMatch = messageData.context.type === '*' || listener.contextType === '*' || messageData.context.type === listener.contextType;
                    instance.source?.postMessage({
                        topic: TOPICS.CONTEXT,
                        data: {
                            context: messageData.context,
                            listenerId: listenerId
                        }
                    });
                }
            });

        }




    });

    return;

};