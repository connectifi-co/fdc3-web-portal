import { createAgent } from '@connectifi/agent-web';

let fdc3;

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