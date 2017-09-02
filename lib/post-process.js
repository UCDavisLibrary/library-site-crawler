module.exports = function(urls) {
  var globalUrls = null;
  
  // find all global urls, links that exist on every page
  for( var key in urls ) {
    if( !urls[key].links ) continue;

    // make sure page links are a hash
    if( Array.isArray(urls[key].links) ) {
      var tmp = {};
      urls[key].links.forEach(link => tmp[link] = true);
      urls[key].links = tmp;
    }

    // if this is first item, just set the possible global links list
    if( !globalUrls ) {
      globalUrls = Object.assign({}, urls[key].links);
      continue;
    }

    var pageLinks = urls[key].links;
    for( var key2 in globalUrls ) {
      if( !pageLinks[key2] ) {
        delete globalUrls[key2];
      }
    }
  }

  // remove global urls for pages
  for( var key in urls ) {
    if( !urls[key].links ) continue;

    var pageLinks = urls[key].links;
    for( var key2 in globalUrls ) {
      if( pageLinks[key2] ) {
        delete pageLinks[key2];
      }
    }

    urls[key].links = Object.keys(urls[key].links);
  }

  return {
    pages: urls, 
    globalLinks : Object.keys(globalUrls)
  }
}