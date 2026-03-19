Kaaro Excalidraw — working plan

Links
- Excalidraw upstream: https://github.com/excalidraw/excalidraw
- Integration docs: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/integration

Leverage vs fork
- We can self-host without forking by deploying the stock `excalidraw-app` build. Forking is only needed when we want custom UI, preloaded libraries, auth, or SDK hooks. Recommendation: start with a fork to own Netlify config and future tweaks, but deploy the unmodified app first to validate hosting.


### What is this project

leveraging excalidraw to the best of our abilities

* A: a shared live canvas for realtime collaboration. (Build with y-js). 

* B: a excalidraw Library pipeline: authoring workspace, CLI to generate `.excalidrawlib`, CDN hosting + registry JSON, versioning and previews.
* C: Agent Tooling - A skill export for Agent to generate and operate Excalidraw

* D — (Maybe) Extensions/SDK: plugin surface (element generators, export presets, templates gallery), embeddable component hooks/events, theming/SSO.

