const puppeteer = require('puppeteer');

(async () => {
  const url = 'https://fourkay.net/fourkay-review-render-2394/';
  const outPath = 'elfsight-badge.png';

  const browser = await puppeteer.launch({
    headless: 'new',           // new headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();

  // Reasonable viewport; deviceScaleFactor=2 for a sharp badge
  await page.setViewport({
    width: 600,
    height: 200,
    deviceScaleFactor: 2
  });

  // Go to the render page and wait for network to quiet down
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  // Wait explicitly for the badge wrapper (Elfsight has loaded)
  await page.waitForSelector('#fourkay-elfsight-badge-wrapper', {
    timeout: 60000
  });

  const element = await page.$('#fourkay-elfsight-badge-wrapper');
  if (!element) {
    throw new Error('Badge wrapper not found');
  }

  // Screenshot just that element
  await element.screenshot({
    path: outPath,
    omitBackground: false
  });

  await browser.close();
  console.log('Screenshot saved to', outPath);
})().catch(err => {
  console.error('Screenshot failed:', err);
  process.exit(1);
});
