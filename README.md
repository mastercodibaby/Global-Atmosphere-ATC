# Global Atmosphere

A static website for two Discord-backed two-way voice channels.

## Setup
1. Create or reuse a Discord server with two voice channels named **Normalcy to Normalcy** and **Deplomacy to Normalcy**.
2. Create an invitation link for each channel. Discord invites may take visitors through a server join flow first.
3. Edit `config.js` to set the `normal` and `deplomacy` invitation URLs.
4. Publish `index.html`, `config.js`, and `global-atmosphere.ini` together on a static host such as GitHub Pages.

The on-page Configure button stores links in the visitor's browser only; it does not publish changes to other visitors. Set `config.js` for a public website.

## Security
The `ssh:1000001164` string is included as a legacy project identifier, not a working SSH credential. Never publish private SSH keys, authentication tokens, or secrets in these static files. No SSH server or mail server is provisioned by this site.

## Important
Voice is hosted by Discord, not the website itself. An independently hosted browser-to-browser voice service would require WebRTC signaling, TURN/STUN configuration, and a server-side deployment.

This service is not monitored for emergencies; users should contact emergency services for immediate danger.
