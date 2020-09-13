const debug = require('debug')('express:component:renderer');
const puppeteer = require('puppeteer');

// temporary memory cache
const RENDER_CACHE = new Map();

async function ssr(url) {
  if (RENDER_CACHE.has(url)) {
    return RENDER_CACHE.get(url);
  }

  const start = Date.now();

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on('request', req => {
    const allowlist = ['document', 'script', 'xhr', 'fetch'];
    if (!allowlist.includes(req.resourceType())) {
      return req.abort();
    }
    req.continue();
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
  } catch (err) {
    debug(err);
    debug(new Error('page.goto timed out'));
  }

  const html = await page.content();
  await browser.close();

  const ttRenderMs = Date.now() - start;
  debug(`Headless rendered page in: ${ttRenderMs}ms`);

  RENDER_CACHE.set(url, html);

  return html;
}

module.exports = ssr;
