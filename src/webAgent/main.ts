import { guid } from "@/common/util";
import {
  LocalInstance,
  ChannelInstance,
  FDC3Message,
  FDC3ReturnMessage,
} from "@/common/types";
import { DesktopAgent } from "@finos/fdc3";
import { FDC3Handler, fdc3Handlers } from "./handlers";
import { ConnectifiDesktopAgent } from '@connectifi/agent-web';

/**
 * WebAgent is a standard implementation of FDC3 that will provide an FDC3 api interface as either
 * a module or global scope.   The WebAgent abstracts the actual FDC3 Connection, so that
 * an app or module can be written to the stub and have an FDC3 provider plugged in after the fact
 *
 * WebAgent
 *
 * the WebAgent handle webpages that are split into AppBoundaries - either by iframes or some other
 * logical boundaries in the page - each boundary is marked by a different instance of the WebAgent API.
 *
 * local implementation of a FDC3 Desktop Agent
 * manages state of 'local' channels (system/user & app)
 * registry of intent listeners
 * registry of context listeners
 *
 * a WebAgent does NOT
 * - connect to a directory
 * - open apps
 * - resolve intents
 *
 * a WebAgent DOES
 * - register each AppBoundary and assign it an instanceId
 * - register local context and intent listeners
 * - route context and intents to local listeners
 * - register local channel affiliation
 *
 * Question:
 *  - can we have reliable detection of when an AppBoundary has gone away or been replaced based on
 *      a new registration coming from an iFrame with a previous registration
 *
 * LocalInstance Type
 *  - id
 *  - channel
 *  - contextListeners (Map listenerId, ContextListener)
 *  - intentListeners (Map listenerId, IntentListener)
 *
 * ChannelInstance Type
 *  - id
 *  - type
 *  - context (Map contextType, Context) only stores current context (by type)
 *
 * ContextListener Type
 *  - contextType
 *  - channel ?
 *
 * IntentListener Type
 * - intent
 * - contextType ?
 *
 */

export class WebAgent {
  // controls ability to broadcast on the "default" channel
  allowBroadcastOnDefault: boolean = false;
  // collection of channels for local state
  channels: Map<string, ChannelInstance>;
  // handlers for fdc3 messages
  handlers: Map<string, FDC3Handler>;
  // collection of 'app' instances or app bounderies local to the page
  localInstances: Map<string, LocalInstance>;
  // underlying desktop agent
  fdc3: DesktopAgent | ConnectifiDesktopAgent |  undefined;

  constructor() {
    this.channels = new Map();
    this.handlers = fdc3Handlers;
    this.localInstances = new Map();
    // set up message listener
    window.addEventListener("message", async (event: MessageEvent) => {
      const message: FDC3Message = event.data || ({} as FDC3Message);
      const messageSource = event.source;
      if (message.topic === "registerInstance") {
        // handle registration
        this.handleRegistration(message, messageSource);
      } else {
        // handle fdc3 messages
        this.handleMessage(message, messageSource);
      }
    });
  }

  // bind to an FDC3 implementation
  bind(fdc3: DesktopAgent | ConnectifiDesktopAgent) {
    this.fdc3 = fdc3;
  }

  // return the underlying implementation - used by the handlers
  getFDC3() {
    return this.fdc3;
  }

  // handle web agent api registration
  handleRegistration(
    message: FDC3Message,
    messageSource: MessageEventSource | null
  ) {
    // generate a guid
    const instanceId = guid();
    // add to the localInstances collection
    this.localInstances.set(instanceId, {
      id: instanceId,
      channel: "default",
      contextListeners: new Map(),
      intentListeners: new Map(),
      source: messageSource,
    });
    if (this.fdc3) {
      this.sendHandshake(message, messageSource, instanceId);
    } else {
      document.addEventListener("fdc3Ready", () => {
        this.sendHandshake(message, messageSource, instanceId);
      });
    }
  }

  // send back the instanceId to the api
  sendHandshake(
    message: FDC3Message,
    messageSource: MessageEventSource | null,
    instanceId: string
  ) {
    messageSource?.postMessage({
      topic: message.returnId,
      data: {
        instanceId: instanceId,
      },
    });
  }

  async handleMessage(
    message: FDC3Message,
    messageSource: MessageEventSource | null
  ) {
    const handler = this.handlers.get(message.topic);
    if (handler) {
      const result = (await handler.call(this, this, message)) || {};
      const returnMessage: FDC3ReturnMessage = {
        topic: message.returnId,
        ...result,
      };
      //send a return message
      messageSource?.postMessage(returnMessage);
    }
  }
}
