import { createAgent } from '@connectifi/agent-web';
import { LocalAgent } from './localAgent/main';


let fdc3;
let localAgent : LocalAgent = new LocalAgent();

document.addEventListener("DOMContentLoaded", async () => {
    fdc3 = await createAgent('https://dev.connectifi-interop.com','*@Demo', {
        props: {position:'tr'}
    });

    //set up local bus
    

    //channels

    //context listeners

    //intent listeners

    //set up post message responder


    
});