import {
  createAgent,
  ResolveCallback,
  IntentResolutionMessage,
  ResolutionType,
  AppIntentResult
} from "@connectifi/agent-web";
import { WebAgent } from "@/main";

let fdc3;
const localAgent = new WebAgent();

document.addEventListener("DOMContentLoaded", async () => {
  fdc3 = await createAgent("https://dev.connectifi-interop.com", "*@sandbox", {
    props: {
      position: "tr"
    },
  });

  if (fdc3) {
    localAgent.bind(fdc3);
    localAgent.allowBroadcastOnDefault = true;
    document.dispatchEvent(new CustomEvent("fdc3Ready"));
  }
});
