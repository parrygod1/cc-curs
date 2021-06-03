const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
let puppeterInstanceBrowser = null;
console.log('cold start');
module.exports = async (url) => {
  let browser;
  if (puppeterInstanceBrowser) browser = puppeterInstanceBrowser;
  else {
    console.log('new instance created');
    browser = await puppeteer.launch();
    puppeterInstanceBrowser = browser;
  }
  const page = await browser.newPage();

  const headlessUserAgent = await page.evaluate(() => navigator.userAgent);
  const chromeUserAgent = headlessUserAgent.replace('HeadlessChrome', 'Chrome');
  await page.setUserAgent(chromeUserAgent);
  await page.setExtraHTTPHeaders({
    'accept-language': 'en-US,en;q=0.8',
  });
  await page.setJavaScriptEnabled(true);
  await page.setViewport({
    width: 1200,
    height: 10000,
  });
  await page.goto(url);

  // await page.waitForTimeout(3000);
  // await page.screenshot({ path: 'a.png' });
  const html = await page.evaluate(() => document.querySelector('*').outerHTML);
  await page.close();

  // await browser.close();
  // jsdom
  const { document } = new JSDOM(html).window;
  return document;
};
