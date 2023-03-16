
import { createAPI } from './api';
import { sendMessage,  setInstanceId } from './sendMessage';
import { RegisterInstanceReturn } from '../common/types';
import { DesktopAgent } from '@finos/fdc3';


export const installer = async () : Promise<DesktopAgent> => {
    const registrationResult = await sendMessage("registerInstance");
    const instanceId = (registrationResult.data as RegisterInstanceReturn).instanceId;
    setInstanceId(instanceId);

    console.log("creating FDC3");
    return createAPI();
};

