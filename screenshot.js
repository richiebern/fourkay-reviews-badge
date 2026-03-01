const puppeteer = require('puppeteer');

(async () => {
  const url = 'https://fourkay.net/fourkay-review-render-2394/';
  const outPath = 'elfsight-badge.png';

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 800,
    height: 400,
    deviceScaleFactor: 2     // retina-sharp
  });

  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  // Wait for Elfsight to load inside our frame
  await page.waitForSelector('#fourkay-badge-frame', { timeout: 60000 });

  // Remove any margins from body to avoid weird offsets
  await page.evaluate(() => {
    document.body.style.margin = '0';
  });

  const element = await page.$('#fourkay-badge-frame');
  if (!element) {
    throw new Error('Badge frame not found');
  }

  const box = await element.boundingBox();

  await page.screenshot({
    path: outPath,
    clip: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height
    }
  });

  await browser.close();
  console.log('Screenshot saved to', outPath);
})();
