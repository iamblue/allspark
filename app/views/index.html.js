import { default as React } from 'react';
import {
  WebpackScriptEntry,
  WebpackStyleEntry,
} from 'reacthtmlpack/lib/entry';

export default (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <title>MCS Lite</title>
      <WebpackStyleEntry
        chunkName="vendorStyle"
        chunkFilepath="../scripts/vendorCSSEntry.js"
        configFilepath="../webpack.config.js" />
      <WebpackStyleEntry
        chunkName="client"
        chunkFilepath="../scripts/client.js"
        configFilepath="../webpack.config.js" />
    </head>
    <body>
      <div id="app" style={{ position: 'absolute', height: '100%', width: '100%' }}/>
      <WebpackScriptEntry
        chunkName="client"
        chunkFilepath="../scripts/client.js"
        configFilepath="../webpack.config.js" />
    </body>
  </html>
);

