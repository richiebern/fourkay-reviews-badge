// screenshot.js
const puppeteer = require('puppeteer');

(async () => {
  const url = 'https://fourkay.net/fourkay-review-render-2394/';
  const outPath = 'elfsight-badge.png';

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // HiDPI for sharp badge; final PNG will be ~2x CSS size
  await page.setViewport({
    width: 800,
    height: 400,
    deviceScaleFactor: 2
  });

  console.log('Opening page:', url);
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  // Hide/remove Complianz cookie banner and overlays for screenshot only
  await page.addStyleTag({
    content: `
      #cmplz-cookiebanner-container,
      .cmplz-cookiebanner,
      .cmplz-manage-consent,
      .cmplz-soft-cookiewall,
      .cmplz-blocked-content-container {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `
  });

  await page.evaluate(() => {
    [
      '#cmplz-cookiebanner-container',
      '.cmplz-cookiebanner',
      '.cmplz-manage-consent',
      '.cmplz-soft-cookiewall',
      '.cmplz-blocked-content-container'
    ].forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove());
    });
  });

  // Belt-and-braces: force black background on html/body
  await page.evaluate(() => {
    document.documentElement.style.backgroundColor = '#000';
    document.body.style.backgroundColor = '#000';
    document.body.style.margin = '0';
  });

  // Wait for our fixed-size frame that contains the badge
  await page.waitForSelector('#fourkay-badge-frame', { timeout: 60000 });

  const element = await page.$('#fourkay-badge-frame');
  if (!element) {
    throw new Error('Badge frame #fourkay-badge-frame not found');
  }

  // Make sure the frame itself has no margin and is visible
  await page.evaluate(() => {
    const frame = document.querySelector('#fourkay-badge-frame');
    if (frame) {
      frame.style.margin = '0';
    }
  });

  // Small pause to let layout settle after removing Complianz elements
  await new Promise(resolve => setTimeout(resolve, 500));

  // Scroll it nicely into view so there’s no weird offset
  await element.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'center' }));

  // Screenshot just that element – NO manual clip box
  await element.screenshot({
    path: outPath
  });

  await browser.close();
  console.log('Screenshot saved to', outPath);
})().catch(err => {
  console.error('Screenshot failed:', err);
  process.exit(1);
});
