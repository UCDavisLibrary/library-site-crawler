module.exports = function validHtmlResponse(res) {
  if( res.statusCode !== 200 ) {
    return {
      statusCode : res.statusCode,
      error : 'non 200 status code'
    }
  }

  if( !res.headers ) {
    return {
      error : 'no headers sent'
    }
  }

  if( !res.headers['content-type'] ) {
    return {
      error : 'no content-type header sent'
    }
  }

  if( !res.headers['content-type'].match(/text\/html/) ) {
    return {
      ['content-type'] : res.headers['content-type'],
      error : 'not html'
    }
  }

  if( !res.$ ) {
    return {
      error : 'Unknown error, $ not set from crawler'
    }
  }

  return {valid: true};
}