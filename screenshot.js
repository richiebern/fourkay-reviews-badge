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
    deviceScaleFactor: 2
  });

  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  await page.waitForSelector('#fourkay-elfsight-badge-wrapper', {
    timeout: 60000
  });

  // Remove any padding/margins dynamically before capture
  await page.evaluate(() => {
    const wrapper = document.querySelector('#fourkay-elfsight-badge-wrapper');
    if (wrapper) {
      wrapper.style.padding = '0';
      wrapper.style.margin = '0';
    }

    document.body.style.margin = '0';
  });

  const element = await page.$('#fourkay-elfsight-badge-wrapper');
  if (!element) {
    throw new Error('Badge wrapper not found');
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
  console.log('Trimmed screenshot saved:', outPath);
})();
