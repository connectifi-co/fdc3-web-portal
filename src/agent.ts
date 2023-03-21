import {
  createAgent,
  ResolveCallback,
  IntentResolutionMessage,
} from "@connectifi/agent-web";
import { LocalAgent } from "./main";

let fdc3;
const localAgent: LocalAgent = new LocalAgent();

document.addEventListener("DOMContentLoaded", async () => {
  fdc3 = await createAgent("https://dev.connectifi-interop.com", "*@Demo", {
    props: {
      position: "tr",
    },
    resolverHandler: (
      message: IntentResolutionMessage,
      resolveCallback: ResolveCallback
    ) => {
      console.log("Intent Resolver function called", message);
      //create resolver UI
      //when the user selects a result, call the resolverCallback like so:
      //resolveCallback.call(this, message.eventId, app, result.intent.name, context);

      const context = message.context;
      const menus: Array<HTMLElement> = [];
      const intentMenu = document.createElement("div");

      intentMenu.id = "intentResolver-intent-menu";

      const headerItem = document.createElement("div");
      headerItem.textContent = "Intents";

      menus.push(intentMenu);

      //iterate through the results
      message.data.forEach((result: any) => {
        const menuItem = document.createElement("div");
        menuItem.innerText = result.intent.displayName;
        intentMenu?.appendChild(menuItem);
        const intentItemMenu = document.createElement("div");
        result.apps.forEach((app: any) => {
          intentItemMenu.id = result.intent.name;
          const appItem = document.createElement("div");
          appItem.id = app.details.directoryData.name;
          appItem.textContent =
            app.details.directoryData.title || app.details.directoryData.name;
          appItem.addEventListener("click", async () => {
            console.log("resolve resolver", context);
            resolveCallback.call(
              this,
              message.eventId,
              app,
              result.intent.name,
              context
            );
          });
          intentItemMenu.appendChild(appItem);
        });
        menus.push(intentItemMenu);
      });

      menus.forEach((menu) => {
        document.body.appendChild(menu);
      });
    },
    onLoading: () => {
      //display loading UI here
    },
    onLoadingStopped: () => {
      //stop the loading UI here
    },
  });

  if (fdc3) {
    localAgent.setFDC3(fdc3);
    document.dispatchEvent(new CustomEvent("fdc3Ready"));
  }
});
