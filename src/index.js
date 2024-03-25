/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.js` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.js --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		let reqUrl = new URL(request.url);

		if (!reqUrl.pathname.startsWith("/inline"))
			return await fetch(request);

		reqUrl.pathname = reqUrl.pathname.replace("/inline", "")
		reqUrl.hostname = 'cln.sh';

		request = new Request(reqUrl.toString(), new Request(request));

		let response = await fetch(request)
		let maxRedirects = 20 // Prevent infinite loops

		while (response.status >= 300 && response.status < 400 && maxRedirects > 0) {
			if (!response.headers.has('Location')) {
				break // No location header, can't follow
			}
			const location = response.headers.get('Location')
			response = await fetch(location, {
				method: request.method,
				headers: request.headers,
			})
			maxRedirects -= 1
		}

		return response
	},
};
