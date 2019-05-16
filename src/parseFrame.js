'use strict';

const parseExtendedFrame = require('./parseExtendedFrame');

function parseFrame(buffer) {
  // todo we should check if it ends by \r
  let string = new TextDecoder().decode(buffer).trim();
  let type = string.charAt(0);

  switch (type) {
    case 'T':
      parseExtendedFrame(string.substring(1));
      break;
    default:
      console.log('Unknown type of frame');
  }
}

module.exports = parseFrame;
