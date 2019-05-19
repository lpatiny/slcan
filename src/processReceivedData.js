'use strict';

const debug = require('debug')('slcan.parseFrame');

const processT = require('./sl-command/processT');

let leftOver = ''; // the part that was left over from previous data

function processReceivedData(string, adapter) {
  // eslint-disable-next-line no-control-regex
  string = leftOver + string.replace(/\x07/g, '\x07\r');
  while (string.includes('\r')) {
    let position = string.indexOf('\r');
    let currentString = string.substring(0, position);
    string = string.substring(position + 1);
    let type = currentString.charAt(0);
    switch (type) {
      case 'T':
        processT(currentString.substring(1), adapter);
        break;
      case '':
        debug('Received carriage return');
        break;
      case '\u0007':
        debug('Received ERROR');
        break;
      default:
        console.log(`Unknown type of frame: "${currentString}"`);
    }
  }
  leftOver = string;
}

module.exports = processReceivedData;
