'use strict';

const debug = require('debug')('slcan.parseExtendedFrame');

const n0 = BigInt(0);
const n1 = BigInt(1);
const n3 = BigInt(3);
const n127 = BigInt(127);
const n128 = BigInt(128);
const n255 = BigInt(255);
const n65535 = BigInt(65535);

const MESSAGE_FRAME = 1;
const ANONYMOUS_MESSAGE_FRAME = 2;
const SERVICE_FRAME = 3;

// https://uavcan.org/Specification/4._CAN_bus_transport_layer/

function parseExtendedFrame(string) {
  let identifier = string.substr(0, 8);
  let dataLength = string.substr(8, 1);
  let data = string.substr(9);
  let header = BigInt(`0x${identifier}`) >> n3;
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
    priority: (header >> BigInt(28)) & BigInt(5),
    isService: (header >> BigInt(7)) & n1,
    sourceNodeID: header & n127
  };
  toReturn.messageTypeDescription = getMessageTypeLabel(type);
  switch (type) {
    case ANONYMOUS_MESSAGE_FRAME:
      toReturn.messageTypeID = (header >> BigInt(8)) & n65535;
      break;
    case MESSAGE_FRAME:
      toReturn.discriminator = (header >> BigInt(10)) & BigInt(16383);
      toReturn.messageTypeID = (header >> BigInt(8)) & n3;
      break;
    case SERVICE_FRAME:
      toReturn.serviceTypeID = (header >> BigInt(16)) & n255;
      toReturn.isRequest = (header >> BigInt(15)) & n1;
      toReturn.destinationNodeID = (header >> BigInt(8)) & n127;
      break;
    default:
  }
  return toReturn;
}

function getType(header) {
  if ((header & n255) === n0) {
    return ANONYMOUS_MESSAGE_FRAME;
  }
  if (header & n128) return MESSAGE_FRAME;
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
}
