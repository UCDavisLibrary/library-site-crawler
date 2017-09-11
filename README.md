# library-site-crawler
Crawler for screenshots and debugging

Just create a config.json file in the root directory and pass 
root url as well as paths you would like to screenshot

config.json
```json
{
  "baseUrl" : "https://beta.library.ucdavis.edu",
  "screenshots" : [
    "/",
    "/az-database/b/",
    "/help",
    "/service/connect-from-off-campus"
  ]
}
```
