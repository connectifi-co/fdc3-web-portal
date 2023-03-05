
import { 
    FDC3MessageData, 
    FDC3ReturnMessage, 
    FDC3ReturnMessageData, 
    FDC3SendMessageResolution,
    RegisterInstanceReturn } from '../common/types';
import { guid } from '../common/util';

const returnHandlers : Map<string, any> = new Map();
let instanceId : string | undefined;

export const getReturnHandlers = () :  Map<string, any> => {
    return returnHandlers;
};

export const setInstanceId = (id : string ) => {
    instanceId = id;
};

export const sendMessage = (topic: string, data?: FDC3MessageData, handler? : any) : Promise<FDC3SendMessageResolution> => {
    return new Promise((resolve) => {
    const returnId = `${topic}_${guid()}`;
    const theHandler =  async (message: FDC3ReturnMessage) => { 
        console.log("event", message);
        if (handler) {
           resolve(await handler.call(this, data));
        }
        resolve({data:(message.data || {}), error:message.error});
    };
    returnHandlers.set(returnId, theHandler );
     //do everything through window messages?
     window.top?.postMessage({
         topic,
         returnId,
         data });
    });
  
};

