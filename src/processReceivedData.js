'use strict';

const debug = require('debug')('slcan.parseFrame');

const processT = require('./sl-command/processT');

function processReceivedData(string, adapter) {
  // todo we should check if it ends by \r

  let type = string.charAt(0);

  switch (type) {
    case 'T':
      processT(string.substring(1), adapter);
      break;
    case '':
      debug('Received carriage return');
      break;
    case '\u0007':
      debug('Received ERROR');
      break;
    default:
      console.log(`Unknown type of frame: "${string}"`);
  }
}

module.exports = processReceivedData;
