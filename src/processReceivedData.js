'use strict';

const debug = require('debug')('slcan.parseFrame');

const processT = require('./sl-command/processT');

function processReceivedData(buffer, adapter) {
  // todo we should check if it ends by \r
  let string = new TextDecoder().decode(buffer).trim();
  let type = string.charAt(0);

  switch (type) {
    case 'T':
      processT(string.substring(1), adapter);
      break;
    case '\r':
      debug('Received carriage return');
      break;
    case '\u0007':
      debug('Received ERROR');
      break;
    default:
      console.log(`Unknown type of frame: "${type.charCodeAt(0)}"`);
  }
}

module.exports = processReceivedData;
