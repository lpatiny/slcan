'use strict';

const debug = require('debug')('slcan.serializeUavcanFrame');

const {
  MESSAGE_FRAME,
  ANONYMOUS_MESSAGE_FRAME,
  SERVICE_FRAME
} = require('./MessageTypes');

function serializeUavcanFrane(bytes, sourceNode, options = {}) {
  options = Object.assign({}, options);
  let header = serializeHeader(options);

  let results = [];
  for (let i = 0; i < bytes.length || i === 0; i += 7) {
    let data = '';
    let j = i;
    for (j; j < Math.min(i + 7, bytes.length); j++) {
      data += Number(bytes[i] & 255)
        .toString(16)
        .padStart(2, '0');
    }
    sourceNode.toggleBit = !sourceNode.toggleBit;
    sourceNode.transferID = sourceNode.transferID++ % 32;
    let tailByte = (
      ((i === 0) << 7) |
      ((j === bytes.length) << 6) |
      (sourceNode.toggleBit << 5) |
      sourceNode.transferID
    )
      .toString(16)
      .padStart(2, '0');

    results.push(`T${header}${data.length + 1}${data}${tailByte}`);
  }
  return results;
}

module.exports = serializeUavcanFrane;

function serializeHeader(options = {}) {
  let {
    messageType,
    priority = 15,
    sourceNodeID,
    destinationNodeID,
    isRequest,
    dataTypeID,
    discriminator = Math.floor(Math.random(1) * 16384)
  } = options;
  let header = 0;

  header |= (priority & 31) << 24;

  switch (messageType) {
    case MESSAGE_FRAME:
      header |= sourceNodeID & 127;
      header |= (dataTypeID & 65535) << 8;
      break;
    case ANONYMOUS_MESSAGE_FRAME:
      header |= (dataTypeID & 3) << 8;
      header |= (discriminator & 16383) << 10;
      break;
    case SERVICE_FRAME:
      header |= sourceNodeID & 127;
      header |= 1 << 7;
      header |= (destinationNodeID & 127) << 8;
      header |= (isRequest & 1) << 15;
      header |= (dataTypeID & 255) << 16;
      break;
    default:
  }
  return header.toString(16).padStart(8, '0');
}
