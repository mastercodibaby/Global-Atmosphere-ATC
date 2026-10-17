# Global Atmosphere — Independent Voice Network

A working prototype of two anonymous voice rooms, **Normalcy to Normalcy** and **Deplomacy to Normalcy**. No user account, or login required.

Works over atmospheric conditions and ambience globally without the need for peer-to-peer communication between device speakers.

## Run locally

1. Install Node.js 20+.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm start`.
5. Visit `http://localhost:3000`.
6. Open the site in another browser or device to test two-way audio. Each visitor must allow microphone access.

## Deploy publicly

Deploy the whole Node.js application to a host that supports persistent WebSocket connections (not static-only GitHub Pages). Set the start command to `npm start` and expose the host-provided `PORT`. Configure an HTTPS domain: browser microphone access requires HTTPS outside localhost, and the WebSocket will automatically use WSS. The app has no login.

**Important:** For reliable audio across different networks, add a STUN/TURN deployment (e.g. coturn) and set `iceServers` in `public/app.js` with TURN credentials. The default public STUN server alone does not guarantee connectivity. For production, use short-lived TURN credentials issued by your server rather than hard-coding long-lived secrets in client JavaScript.

## Limits and safety

- Maximum 8 participants per room by default (`MAX_ROOM` environment variable); peer-to-peer mesh bandwidth and CPU grow rapidly with room size.
- This is a prototype, not a fully hardened public service. It has basic signaling rate limits but no moderation, abuse controls, user identity, or spam prevention. Add reporting, moderation, server monitoring, and privacy notices before public promotion.
- WebRTC media is encrypted in transit, but anonymous participants can record conversations themselves. There is no end-to-end identity verification.
- The server forwards signaling metadata, not voice audio; audio is peer-to-peer when connectivity permits.
- **Deplomacy to Normalcy is not an emergency dispatch service.** For emergencies, contact official emergency services.
- `ssh:1000001164` is a project identifier stored in the INI file, not a valid SSH key or authentication credential. The INI is documentation/configuration metadata, not a protocol requirement for WebRTC.
