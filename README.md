# fdc3-web-portal
Reference implementation of a web portal using FDC3 Stub/Provider pattern and the [Connectifi](https://connectifi.co) interop service

## Stub/Provider Pattern
This is a pattern for enabling apps to use a single library for FDC3 regardless of who the FDC3 provider ultimately is.  

The provider code - *FDC3Stub* - is loaded into each app.  The stub exposes an FDC3 API and uses `postMessage` to discover and then bind to a *FDC3Provider* which owns the FDC3 implementation.  In this example, the provider is a *LocalAgent* using *Connectifi* for interop outside of the web page.

![Stub/Provider Pattern](stub-provider-pattern.png)

** Notes ** 

- Stub/Provider pattern should work for apps implemented in either iFrames or in the same DOM (using module scope).  This implementation is currently with iFrames only
- the FDC3stub currently exposes the proposed `installer()` function for apps to acquire an FDC3 api

## LocalAgent Pattern
In this example, the FDC3Provider is a *LocalAgent* which implements a local bus for FDC3 interop within the page while connecting to a wider FDC3 implementation enabling FDC3 interop outside of the page.  The *LocalAgent* setup looks like this:

```js
 const localAgent: LocalAgent = new LocalAgent();
 //attain the fdc3 reference and set it on the localAgent
 localAgent.setFDC3(fdc3);

```

** Notes **
- the LocalAgent can support any number of FDC3 providers.  In this example it is using *Connectifi*.
- the LocalAgent allows apps to broadcast to each other via FDC3 within scope of the web page
- the local apps have color channel membership  independent of the page they are running on 


## Project setup

- clone
- `npm i`
- `npm run dev`
- open http://localhost:5173/


## Development

The project currently has the following parts:

- `index.html` & `app1.html` - test harness UIs
- `src/main.ts` - this is the harness app code, instantiates the *LocalAgent* and connects to the *Connectifi* service
- `src/common` - contains the types and topics used in the postMessage *wire protocol* between the FDC3 Stub & Provider
- `src/localAgent` - the LocalAgent implementation
- `src/fdc3Stub` - the FDC3Stub implementation

## Next Steps

(in no certain order)

- integrate intents with the localAgent (currently just deferring to the FDC3Provider)
- add 2.0 support
- add module / non-iframe example
- test against desktop agents
- publish the FDC3Stub to NPM
- publish the LocalAgent to NPM
