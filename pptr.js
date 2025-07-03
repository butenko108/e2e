import puppeteer from "puppeteer";

(async () => {
	// Launch the browser and open a new blank page
	const browser = await puppeteer.launch({ headless: false, slowMo: 500 });
	const page = await browser.newPage();

	// Navigate the page to a URL
	await page.goto("http://127.0.0.1:5500/");

	await page.evaluate(() => {
		const pEl = document.createElement("p");
		pEl.textContent = "Text content";

		const hEl = document.querySelector(".heading");

		hEl?.parentNode?.insertBefore(pEl, hEl);
	});

	await browser.close();
})();
