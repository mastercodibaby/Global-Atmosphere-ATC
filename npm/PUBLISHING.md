# Global Atmosphere ATC — npm publishing

Copy the files in this package into the root of your existing GitHub repository, preserving the `.github/workflows/` directory. Do not delete your existing application files.

## Important prerequisite

The repository's server.js references a `public/` directory, but the inspected repository root contains the website files at the root. Make sure the deployed/published application includes a `public/` directory with the HTML, JS, CSS, icon, and manifest assets, or update server.js to serve the actual asset directory. Also fix any runtime errors such as missing MAX_ROOM before publishing.

## Local steps

1. Install Node.js 20 or newer.
2. Run `npm install` in the repository root to generate package-lock.json.
3. Run `npm run check` and `npm pack --dry-run`.
4. Test `npm start` and open http://localhost:3000. Verify voice signaling with two clients.
5. Create/sign into an npm account: `npm login`.
6. Confirm the package name is available: `npm view global-atmosphere-atc-server version` (a 404 can indicate the name is available; verify before publishing).
7. Publish: `npm publish --access public`. Follow npm's current authentication/2FA requirements.

## GitHub Actions publishing (optional)

Create an npm granular access token with permission to publish this package, if supported for your npm account and security policy. Add it to GitHub repository Settings > Secrets and variables > Actions as `NPM_TOKEN`. Then run the 'Publish to npm' workflow manually. Some npm configurations require trusted publishing/OIDC or additional 2FA; configure npm accordingly. Never commit tokens to .npmrc or source files.

## Subsequent versions

Increase the version with `npm version patch` (or minor/major) before publishing again. npm will not accept the same package version twice.

## Caveats

Publishing to npm does not deploy a running WebSocket server or make GitHub Pages run Node.js. Deploy the server to a persistent Node.js host, and configure a working WSS endpoint and TURN server for reliable remote voice connectivity.
