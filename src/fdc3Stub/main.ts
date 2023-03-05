
import { createAPI } from './api';
import { sendMessage, getReturnHandlers, setInstanceId } from './sendMessage';
import { FDC3ReturnMessage, RegisterInstanceReturn } from '../common/types';

//types needed
//response type (data or error)
//return handler type




//add a return handler listener
window.addEventListener('message', async (event: MessageEvent) => {
    const message : FDC3ReturnMessage= event.data || {}  as FDC3ReturnMessage;
    const returnHandlers = getReturnHandlers();
    if (returnHandlers.has(message.topic)){
        return returnHandlers.get(message.topic).call(this, message.data);
    }
    
});


//find the fdc3 provider and register on startup
document.addEventListener('DOMContentLoaded', async () => {
    const registrationResult = await sendMessage("registerInstance");
    const instanceId = (registrationResult.data as RegisterInstanceReturn).instanceId;
    setInstanceId(instanceId);
    console.log("*** instance registered with id ", instanceId);

    console.log("creating FDC3");
    window.fdc3 = createAPI();
    document.dispatchEvent(new CustomEvent('fdc3Ready', {}));
});

