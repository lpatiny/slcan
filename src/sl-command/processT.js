'use strict';

const debug = require('debug')('uavcan.processT');
const crc = require('crc-can');
const { DataTypesManager } = require('uavcan');

const debugData = require('../debugData');
const {
  MESSAGE_FRAME,
  ANONYMOUS_MESSAGE_FRAME,
  SERVICE_FRAME
} = require('../MessageTypes');

const parseUavcanFrame = require('./parseUavcanFrame');

function processT(data, adapter) {
  let parsed = parseUavcanFrame(data);

  if (parsed.sourceNodeID) {
    adapter.update(parsed.sourceNodeID);
  }

  switch (parsed.messageType) {
    case ANONYMOUS_MESSAGE_FRAME:
      // we are sure it is only one frame
      break;
    case MESSAGE_FRAME:
      break;
    case SERVICE_FRAME:
      processService(parsed, adapter);
      break;
    default:
  }
}

module.exports = processT;

function processService(parsed, adapter) {
  let sourceNode = adapter.nodes[parsed.sourceNodeID];
  if (!sourceNode) {
    debug(`ERROR: sourceNode was not found: ${parsed.sourceNodeID}`);
  }
  sourceNode.toggleBit = parsed.toggleBit;
  sourceNode.transferID = parsed.transferID;
  if (parsed.startTransfer) {
    sourceNode.data[parsed.transferID] = '';
  }
  console.log({ service: parsed.isService, length: parsed.dataLength });
  sourceNode.data[parsed.transferID] += parsed.data;
  if (parsed.endTransfer) {
    let data = sourceNode.data[parsed.transferID];
    checkCRC(data, parsed.dataTypeID, parsed.isService);
    //  debugData(data.substring(4), parsed.messageType, parsed.dataTypeID);
  }
}

function checkCRC(data, dataTypeID, isService) {
  let dataType;
  if (isService) {
    dataType = DataTypesManager.getServiceByID(dataTypeID);
  } else {
    dataType = DataTypesManager.getMessageByID(dataTypeID);
  }
  if (!dataType || !dataType.info) {
    debug(`Can not check CRC of ${data}`);
    return false;
  }

  console.log(data);
  console.log(dataType.info.hash);

  let hash = dataType.info.hash
    .split(/(..)/)
    .filter((a) => a)
    .map((a) => Number(`0x${a}`));

  let bytes = data
    .split(/(..)/)
    .filter((a) => a)
    .map((a) => Number(`0x${a}`));

  let expected = bytes.slice(0, 2);
  bytes = hash.concat(bytes.slice(2));
  console.log(bytes.length);
  console.log(bytes);
  console.log(new TextDecoder('utf8').decode(Buffer.from(bytes)));
  let result = crc(bytes);
  console.log({ expected, L: result % 256, H: result >> 8 });
}
