// Launching Puppeteer to mimic bot like behavior
const puppeteer = require('puppeteer');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // See the browser
  const page = await browser.newPage();
  await page.goto('https://mycustomdomain.shop'); //plugin is hosted in this site for testing

  // Inject bot-like mouse movement simulation into the page
  await page.evaluate(() => {
    let x = 100, y = 100;
    let interval = setInterval(() => {
      const event = new MouseEvent('mousemove', {
        clientX: x,
        clientY: y,
        bubbles: true
      });
      document.dispatchEvent(event);
      x += 5;
      y += 5;
      if (x > 300) clearInterval(interval);
    }, 50);
  });

  // Wait to observe classification result
  await delay(5000);
  await browser.close();
})();