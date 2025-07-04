import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Required to allow user interaction
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  console.log('Browser started.');

  // Listen for new targets (tabs, windows, etc.)
  browser.on('targetcreated', async (target) => {
    if (target.type() === 'page') {
      const page = await target.page();
      const url = page.url();
      console.log(`New page opened: ${url || 'about:blank'}`);

      // ✅ Listen for when the page fully loads
      page.on('load', () => {
        console.log(`Page loaded: ${page.url()}`);
      });

      // Wait until DOM is available
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {});

      // Inject rrweb script
      await page.addScriptTag({
        url: 'https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js',
      });

      // Start recording and send events to console or your server
      await page.evaluate(() => {
        rrweb.record({
          emit(event) {
            console.log('rrweb event:', event);
          },
        });
      });

      console.log('rrweb recording started');

      // ✅ Inject <h1>Test text</h1> at the top of <body>
      await page.evaluate(() => {
        const header = document.createElement('h1');
        header.textContent = 'Test text';
        header.style.color = 'red'; // Optional styling
        header.style.fontSize = '2rem';
        document.body.insertBefore(header, document.body.firstChild);
      });

      console.log('<h1>Test text</h1> injected');
    }
  });

  // Keep browser open
})();
