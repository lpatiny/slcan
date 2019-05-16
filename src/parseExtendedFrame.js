'use strict';

const debug = require('debug')('slcan.parseExtendedFrame');

const MESSAGE_FRAME = 1;
const ANONYMOUS_MESSAGE_FRAME = 2;
const SERVICE_FRAME = 3;

// https://uavcan.org/Specification/4._CAN_bus_transport_layer/

function parseExtendedFrame(string) {
  let identifier = string.substr(0, 8);
  let dataLength = string.substr(8, 1);
  let data = string.substr(9);
  let header = `0x${identifier}` >> n3;
  let result = parseHeader(header);
  result.data = data;
  result.dataLength = dataLength;
  console.log(result);
  return result;
}

module.exports = parseExtendedFrame;

function parseHeader(header) {
  let type = getType(header);
  let toReturn = {
    messageType: type,
    priority: (header >> 28) & 5,
    isService: (header >> 7) & 1,
    sourceNodeID: header & 127
  };
  toReturn.messageTypeDescription = getMessageTypeLabel(type);
  switch (type) {
    case ANONYMOUS_MESSAGE_FRAME:
      toReturn.messageTypeID = (header >> 8) & 65535;
      break;
    case MESSAGE_FRAME:
      toReturn.discriminator = (header >> 10) & 16383;
      toReturn.messageTypeID = (header >> 8) & 3;
      break;
    case SERVICE_FRAME:
      toReturn.serviceTypeID = (header >> 16) & 255;
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
  if (header & 128) return MESSAGE_FRAME;
  return SERVICE_FRAME;
}

function getMessageTypeLabel(messageType) {
  switch (messageType) {
    case MESSAGE_FRAME:
      return 'Message frame';
    case ANONYMOUS_MESSAGE_FRAME:
      return 'Anonymous message frame';
    case SERVICE_FRAME:
      return 'Service frame';
    default:
  }
  return '';
}

function parsePayload(data) {}
