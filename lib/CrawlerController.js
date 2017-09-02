var Crawler = require("crawler");
var URL = require('url').URL;

class CrawlerController {

  constructor(callback) {
    this.callback = callback;
    this.promises = {};
    this.completedTimer = -1;
    this.DEBUG_PARAM = '_crawler_debug';

    this.crawler = new Crawler({
      queueSize : 10000,
      maxConnections : 10,
      callback : (error, res, done) => {
        var url = new URL(res.options.uri);
        url.searchParams.delete(this.DEBUG_PARAM);
        url = url.href;
    
        if( error ) {
          console.error(error);
          this.promises[url].reject(error);
        } else {
          this.promises[url].resolve({
            url, res,
            time: Date.now() - this.promises[url].timestamp
          });
        }

        delete this.promises[url];

        done();
        this._checkCompleted();
      }
    });

    this.crawler.on('request', (options) => {
      var url = new URL(options.uri);
      url.searchParams.delete(this.DEBUG_PARAM);

      this.promises[url.href]['timestamp'] = Date.now();
    });
  }

  crawl(url) {
    return new Promise((resolve, reject) => {
      try {
        url = new URL(url);
      } catch(e) {
        return reject(e);
      }
      
      this.promises[url] = {resolve, reject};
  
      url.searchParams.append(this.DEBUG_PARAM, 'true');
      this.crawler.queue(url.href);
    });
  }

  _checkCompleted() {
    if( this.completedTimer !== -1 ) {
      clearTimeout(this.completedTimer);
    }

    this.completedTimer = setTimeout(() => {
      if( Object.keys(this.promises).length === 0 ) {
        if( this.callback ) this.callback();
      }
    }, 500);
  }

}

module.exports = CrawlerController;