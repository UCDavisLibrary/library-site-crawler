var data = require('../crawler-results');
var puppeteer = require('puppeteer');
var config = require('../config');
var fs = require('fs-extra');
var path = require('path');

var SIZES = {
  desktop : {
    width: 1500,
    height: 800
  },
  tablet : {
    width: 800,
    height: 600
  },
  mobile : {
    width: 350,
    height: 600
  }
}

var dir = path.join(__dirname, '..', 'screenshots');
var browser, page;

async function screenshot(pathname) {
  if( !data.pages[pathname] ) {
    return console.warn(`Can't screenshot ${pathname}, page not crawled`);
  }

  await page.goto(config.baseUrl+pathname, {waitUntil: 'networkidle'});
  await page.emulateMedia('screen');

  var name = pathname.replace(/\//g, '_');

  data.pages[pathname].screenshots = {}

  for( var key in SIZES ) {
    await page.setViewport(SIZES[key]);

    console.log('generating ', `${name}-${key}.png`)
    await page.screenshot({
      path: path.join(dir, `${name}-${key}.png`),
      fullPage: true
    });
    data.pages[pathname].screenshots[key] = `${name}-${key}.png`;
  }
}

async function run() {
  await fs.remove(dir);
  await fs.mkdirs(dir);

  for( var key in data.pages ) {
    if( data.pages[key].screenshots ) {
      delete data.pages[key].screenshots
    }
  }

  browser = await puppeteer.launch();
  page = await browser.newPage();

  for( var i = 0; i < config.screenshots.length; i++ ) {
    await screenshot(config.screenshots[i])
  }
}

run()
  .then(() => {
    browser.close();

    data.crawledAt = Date.now();
    fs.writeFileSync(
      path.join(__dirname, '..', 'crawler-results.json'),
      JSON.stringify(data, '  ', '  ')
    );

    console.log('Screenshots complete');
  })
  .catch(e => console.error(e));