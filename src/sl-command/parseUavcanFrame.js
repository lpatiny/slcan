'use strict';

const debug = require('debug')('slcan.parseUavcanFrame');

const {
  MESSAGE_FRAME,
  ANONYMOUS_MESSAGE_FRAME,
  SERVICE_FRAME,
  getMessageTypeLabel
} = require('../MessageTypes');

// https://uavcan.org/Specification/4._CAN_bus_transport_layer/

function parseUavcanFrame(string) {
  let identifier = string.substr(0, 8);
  let dataLength = Number(string.substr(8, 1));
  let data = string.substr(9);
  let header = Number(`0x${identifier}`);
  let result = parseHeader(header);
  result.dataLength = dataLength;
  let tailByte = Number(`0x${data.substring(data.length - 2)}`);
  result.data = data.substring(0, data.length - 2);
  result = Object.assign(result, parseTailByte(tailByte));

  debug(
    `${result.messageTypeDescription} src:${result.sourceNodeID} dst:${
      result.destinationNodeID
    } dataType:${result.dataTypeID} first:${result.startTransfer} last:${
      result.endTransfer
    } toggle:${result.toggleBit} nb:${result.transferID}`
  );

  return result;
}

module.exports = parseUavcanFrame;

function parseHeader(header) {
  let type = getType(header);
  let toReturn = {
    messageType: type,
    priority: (header >> 24) & 31,
    isService: (header >> 7) & 1,
    sourceNodeID: header & 127
  };
  toReturn.messageTypeDescription = getMessageTypeLabel(type);
  switch (type) {
    case MESSAGE_FRAME:
      toReturn.dataTypeID = (header >> 8) & 65535;
      break;
    case ANONYMOUS_MESSAGE_FRAME:
      toReturn.discriminator = (header >> 10) & 16383;
      toReturn.dataTypeID = (header >> 8) & 3;
      break;
    case SERVICE_FRAME:
      toReturn.dataTypeID = (header >> 16) & 255;
      toReturn.isRequest = (header >> 15) & 1;
      toReturn.destinationNodeID = (header >> 8) & 127;
      break;
    default:
  }

  return toReturn;
}

function getType(header) {
  if ((header & 255) === 0) {
    return ANONYMOUS_MESSAGE_FRAME;
  }
  if ((header & 128) === 0) return MESSAGE_FRAME;
  return SERVICE_FRAME;
}

function parseTailByte(tailByte) {
  return {
    startTransfer: tailByte >> 7,
    endTransfer: (tailByte >> 6) & 1,
    toggleBit: (tailByte >> 5) & 1,
    transferID: tailByte & 31
  };
}
