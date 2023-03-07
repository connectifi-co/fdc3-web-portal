
import { createAPI } from './api';
import { sendMessage,  setInstanceId } from './sendMessage';
import { RegisterInstanceReturn } from '../common/types';

//types needed
//response type (data or error)
//return handler type



//find the fdc3 provider and register on startup
document.addEventListener('DOMContentLoaded', async () => {
    const registrationResult = await sendMessage("registerInstance");
    const instanceId = (registrationResult.data as RegisterInstanceReturn).instanceId;
    setInstanceId(instanceId);

    console.log("creating FDC3");
    window.fdc3 = createAPI();
    document.dispatchEvent(new CustomEvent('fdc3Ready', {}));
});

