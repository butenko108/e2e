import puppeteer from "puppeteer";

(async () => {
	const browser = await puppeteer.launch({
		headless: false, // Required to allow user interaction
		defaultViewport: null,
		args: ["--start-maximized"],
	});

	console.log("Browser started.");

	// Listen for new targets (tabs, windows, etc.)
	browser.on("targetcreated", async (target) => {
		if (target.type() === "page") {
			const page = await target.page();
			const url = page.url();
			console.log(`New page opened: ${url || "about:blank"}`);

			// ✅ Mirror browser console logs to Node.js terminal
			page.on("console", (msg) => {
				const type = msg.type().toUpperCase();
				const args = msg.args();

				Promise.all(args.map((arg) => arg.jsonValue()))
					.then((values) => {
						console.log(`[BROWSER ${type}]:`, ...values);
					})
					.catch((err) => {
						console.error("[BROWSER LOG PARSE ERROR]:", err);
					});
			});

			// ✅ Слушаем сетевые запросы
			page.on("request", async (request) => {
				const postData = request.postData();
				console.log(`➡️ REQUEST: ${request.method()} ${request.url()}`);
				console.log("Headers:", request.headers());
				if (postData) {
					console.log("Request Body:", postData);
				}
			});

			// ✅ Слушаем ответы на запросы (с фильтрацией по контент-тайпу)
			page.on("response", async (response) => {
				const contentType = response.headers()["content-type"] || "";
				const isTextLike =
					/^(application\/(json|javascript|xml|.*\+json|.*\+xml)|text\/.*)/.test(
						contentType,
					);

				if (!isTextLike) return; // 🛑 пропускаем всё, что не текст

				const req = response.request();
				console.log(
					`⬅️ RESPONSE: ${response.status()} ${req.method()} ${response.url()}`,
				);
				console.log("Headers:", response.headers());

				try {
					const body = await response.text();
					console.log("Response Body:", body);
				} catch (err) {
					console.error("Error reading response body:", err);
				}
			});

			// ✅ Listen for when the page fully loads
			page.on("load", () => {
				console.log(`Page loaded: ${page.url()}`);
			});

			// Wait until DOM is available
			// await page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {});

			// Inject rrweb script
			// await page.addScriptTag({
			//   url: 'https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js',
			// });

			// Start recording and send events to console or your server
			// await page.evaluate(() => {
			//   rrweb.record({
			//     emit(event) {
			//       console.log('rrweb event:', event);
			//     },
			//   });
			// });

			// console.log('rrweb recording started');

			// ✅ Inject <h1>Test text</h1> at the top of <body>
			// await page.evaluate(() => {
			//   const header = document.createElement('h1');
			//   header.textContent = 'Test text';
			//   header.style.color = 'red'; // Optional styling
			//   header.style.fontSize = '2rem';
			//   document.body.insertBefore(header, document.body.firstChild);
			// });

			// console.log('<h1>Test text</h1> injected');
		}
	});

	// Keep browser open
})();
