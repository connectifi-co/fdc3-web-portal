import { createAgent } from '@connectifi/agent-web';
import { LocalAgent } from './localAgent/main';


let fdc3;
let localAgent : LocalAgent = new LocalAgent();

document.addEventListener("DOMContentLoaded", async () => {
    fdc3 = await createAgent('https://nicholaskolba.connectifi-interop.com','*@Demo', {
        props: {position:'tr'}
    });
  
    if (fdc3){
        localAgent.setFDC3(fdc3);
        document.dispatchEvent(new CustomEvent('fdc3Ready'));
 
    }
    //set up local bus
    

    //channels

    //context listeners

    //intent listeners

    //set up post message responder


    
});