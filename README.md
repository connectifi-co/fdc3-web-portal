# fdc3-web-portal
Reference implementation of a web portal using FDC3 api/provider pattern and the [Connectifi](https://connectifi.co) interop service

## Stub/Provider Pattern
This is a pattern for enabling apps to use a single library for FDC3 regardless of who the FDC3 provider ultimately is.  

The provider code - is loaded into each app/component via the *createcreateWebAgentAPI* call .  This returns an FDC3 API and uses `postMessage` to discover and then bind to a *FDC3Provider* which owns the FDC3 implementation.  In this example, the provider is a *WebAgent* using *Connectifi* for interop outside of the web page.

![API/Provider Pattern](provider-pattern.png)

**Notes** 

- API/Provider pattern should work for apps implemented in either iFrames or in the same DOM (using module scope).  This included test harness page uses iframes.
- the `createcreateWebAgentAPI` function allows apps to acquire an FDC3 api

## WebAgent Pattern
In this example, the FDC3Provider is a *WebAgent* which implements a local bus for FDC3 interop within the page while connecting to a wider FDC3 implementation enabling FDC3 interop outside of the page.  The *WebAgent* setup looks like this:

```js
 const localAgent: WebAgent = new WebAgent();
 // bind the web agent to the main FDC3 implementation
 localAgent.bind(fdc3);

```

**Notes**
- the WebAgent can support any number of FDC3 providers.  In this example it is using *Connectifi*.
- the WebAgent allows apps to broadcast to each other via FDC3 within scope of the web page
- the local apps have channel membership independent of the page they are running on


## Project setup

- clone
- `npm i`
- `npm run dev`
- open http://localhost:5173/


## Development

The project currently has the following parts:

- `index.html` & `app1.html` - test harness UIs
- `src/agent.ts` - this is the harness app code, instantiates the *WebAgent* and connects to the *Connectifi* service
- `src/common` - contains the types and topics used in the postMessage *wire protocol* between the api and web agent
- `src/webAgent` - the WebAgent implementation
- `src/webAgentAPI` - the FDC3 API implementation

## Next Steps

(in no certain order)

- integrate intents with the WebAgent (currently just deferring to the FDC3Provider)
- add 2.0 support
- add module / non-iframe example
- test against desktop agents
