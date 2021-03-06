const debug = require('debug');
const puppeteer = require('puppeteer');
const config = require('../config/server.config');

const debugError = debug('express:error:component:renderer');
const debugNotice = debug('express:notice:component:renderer');

// temporary memory cache
const RENDER_CACHE = new Map();

async function ssr(url, browserWSEndpoint) {
  const cachedPage = RENDER_CACHE.get(url);
  if (!!cachedPage && Date.now() < (cachedPage[1] + 1000 * 60 * config.cacheTimeout)) {
    return RENDER_CACHE.get(url)[0];
  }

  const start = Date.now();

  const browser = await puppeteer.connect({ browserWSEndpoint });
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on('request', (req) => {
    const allowlist = ['document', 'script', 'xhr', 'fetch'];
    if (!allowlist.includes(req.resourceType())) {
      return req.abort();
    }
    const blocklist = ['google-analytics.com', '/gtag/js', 'ga.js', 'analytics.js', 'google.com/recaptcha', 'gstatic.com'];
    if (blocklist.find((regex) => req.url().match(regex))) {
      return req.abort();
    }
    return req.continue();
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
  } catch (err) {
    debugError(err);
    debugError(new Error('page.goto timed out'));
  }

  await page.evaluate(() => {
    document.body.innerHTML += '<div id="pre-rendered"></div>';
  });

  const html = await page.content();
  const htmlRemovedScripts = ((a) => a.replace(/<script[^>]*>.*?<\/script>/gi, ''))(html);
  await page.close();

  const ttRenderMs = Date.now() - start;
  debugNotice(`Headless rendered page in: ${ttRenderMs}ms`);

  RENDER_CACHE.set(url, [htmlRemovedScripts, Date.now()]);

  return htmlRemovedScripts;
}

module.exports = ssr;
