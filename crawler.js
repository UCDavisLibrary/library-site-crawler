var Crawler = require('crawler');
var config = require('./config');
var fs = require('fs');
var URL = require('url').URL;
var CrawlerController = require('./lib/CrawlerController');
var postProcess = require('./lib/post-process');
var validHtmlResponse = require('./lib/valid-html-response');


var BASE_URL = config.baseUrl;

var crawling = {};
var crawled = {};

// create crawler controller and set a finished callback
var crawlerController = new CrawlerController(() => {
  var result = postProcess(crawled);
  result.baseUrl = BASE_URL;
  fs.writeFileSync('crawler-results.json', JSON.stringify(result, '  ', '  '));
  console.log('done. urls='+Object.keys(crawled).length+' '+Object.keys(crawling).length);

  require('./lib/screenshot');
});

// we only ever store path and search param information
function urlForStorage(url) {
  url = new URL(url);
  return url.pathname+url.search;
}

// method for extracting anchor tag link information and making sure
// it's ready for crawling
function crawlPageLink(tag, pageUrl) {
  var url = tag.attribs.href;
  if( !url ) return;

  // make sure url is full url
  if( url[0] === '/' ) url = BASE_URL+url;

  try {
    url = new URL(url);
  } catch(e) {
    return; // bad url
  }

  // make sure the url is not a email address
  if( !url.origin ) return;
  
  // in case the debug flag was appended to a link
  url.searchParams.delete(crawlerController.DEBUG_PARAM);

  // strip off any hash
  url = url.origin+url.pathname+url.search;

  // only care about internal links
  if( !url.startsWith(BASE_URL) ) return;

  // we don't care about images or pdfs
  if( url.match(/\.(png|jpg|pdf|gif)$/i) ) return;

  crawled[urlForStorage(pageUrl)]
    .links[urlForStorage(url)] = true;

  queue(url);
}

// queue a url for crawling
async function queue(url) {
  // good for limiting crawl while testing
  // if( Object.keys(crawling).length === 100 ) return;

  // don't crawl if we already have queued or completed
  if( crawling[url] ) return;
  crawling[url] = true;

  // make sure the url is a full path
  if( url[0] === '/' ) url = BASE_URL+url;
  

  // wait for the crawler to actually crawl url
  var {res, time} = await crawlerController.crawl(url);
  console.log('Crawled: '+url);
  
  // grab the link path
  var urlPath = urlForStorage(url);

  // mak sure we returned html
  var result = validHtmlResponse(res);

  // if not, just set info and return
  if( result.error ) {
    crawled[urlPath] = result;
    crawled[urlPath]['time'] = time;
    return;
  }

  // grab the template information
  var $ = res.$;
  crawled[urlPath] = {
    links : {},
    time : time,
    php : $('#php-context').html(),
    twig : $('#twig-context').html()
  }

  // now lets find all anchor tag links and crawl them
  var links = $('a');
  for( var i = 0; i < links.length; i++ ) {
    crawlPageLink(links[i], url);
  }
}

// Let's get to work
queue(BASE_URL);

// Only links to DB are in Polymer search widget, not supported by JSDOM.
// manually add these links
queue(BASE_URL+'/database/');
var alpha = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];
alpha.forEach((letter) => {
  queue(`${BASE_URL}/az-database/${letter}/`);
});

