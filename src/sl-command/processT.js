'use strict';

const debug = require('debug')('uavcan.processT');
const crc = require('crc-can');
const {
  DataTypesManager,
  parseMessage,
  parseResponse,
  parseRequest
} = require('uavcan');

const debugData = require('../debugData');
const {
  MESSAGE_FRAME,
  ANONYMOUS_MESSAGE_FRAME,
  SERVICE_FRAME
} = require('../MessageTypes');

const parseUavcanFrame = require('./parseUavcanFrame');

function processT(data, adapter) {
  let parsed = parseUavcanFrame(data);

  adapter.slcanEventEmitter.emit('frame', {
    event: 'received',
    value: parsed
  });

  if (parsed.sourceNodeID) {
    adapter.update(parsed.sourceNodeID);
  }

  switch (parsed.messageType) {
    case ANONYMOUS_MESSAGE_FRAME:
      processAnonymousMessage(parsed, adapter);
      break;
    case MESSAGE_FRAME:
      processMessage(parsed, adapter);
      break;
    case SERVICE_FRAME:
      processService(parsed, adapter);
      break;
    default:
  }
}

module.exports = processT;

function processAnonymousMessage(parsed, adapter) {
  emitUAVCAN(ANONYMOUS_MESSAGE_FRAME, parsed, parsed.data, adapter);
  // debugData(data, parsed.messageType, parsed.dataTypeID);
}

function processMessage(parsed, adapter) {
  let sourceNode = adapter.nodes[parsed.sourceNodeID];
  if (!sourceNode) {
    debug(`ERROR: sourceNode was not found: ${parsed.sourceNodeID}`);
  }
  sourceNode.toggleBit = parsed.toggleBit;
  sourceNode.transferID = parsed.transferID;
  if (parsed.startTransfer) {
    sourceNode.data[parsed.transferID] = '';
  }
  sourceNode.data[parsed.transferID] += parsed.data;
  if (parsed.endTransfer) {
    emitUAVCAN(
      MESSAGE_FRAME,
      parsed,
      sourceNode.data[parsed.transferID],
      adapter
    );
    // debugData(data, parsed.messageType, parsed.dataTypeID);
  }
}

function emitUAVCAN(type, parsed, data, adapter) {
  if (!parsed.startTransfer) {
    checkCRC(data, parsed.dataTypeID, parsed.isService);
    data = data.substring(4);
  }
  let result;
  let dataType;
  let kind;
  switch (type) {
    case MESSAGE_FRAME:
      kind = 'Message';
      result = parseMessage(parsed.data, parsed.dataTypeID);
      dataType = DataTypesManager.getMessageByID(parsed.dataTypeID);
      break;
    case ANONYMOUS_MESSAGE_FRAME:
      kind = 'Anonymous message';
      result = parseMessage(parsed.data, parsed.dataTypeID);
      dataType = DataTypesManager.getMessageByID(parsed.dataTypeID);
      break;
    case SERVICE_FRAME:
      dataType = DataTypesManager.getServiceByID(parsed.dataTypeID);
      if (parsed.isRequest) {
        kind = 'Service request';
        result = parseRequest(parsed.data, parsed.dataTypeID);
      } else {
        kind = 'Service answer';
        result = parseResponse(parsed.data, parsed.dataTypeID);
      }
      break;
    default:
  }
  let toSend = {
    dataTypeID: parsed.dataTypeID,
    dataTypeFullID: dataType.id,
    data: data
      .split(/(..)/)
      .filter((a) => a)
      .map((a) => a.charCodeAt(0)),
    priority: parsed.priority,
    sourceNodeID: parsed.sourceNodeID,
    destinationNodeID: parsed.destinationNodeID,
    isService: parsed.isService,
    isRequest: parsed.isRequest,
    transferID: parsed.transferID,
    value: result
  };
  adapter.slcanEventEmitter.emit('uavcan', {
    event: kind,
    value: toSend
  });
}

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
  sourceNode.data[parsed.transferID] += parsed.data;
  if (parsed.endTransfer) {
    emitUAVCAN(SERVICE_FRAME, parsed, parsed.data, adapter);
    // debugData(data, parsed.messageType, parsed.dataTypeID);
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
  let result = crc(bytes);

  // console.log({ expected, L: result % 256, H: result >> 8 });
  return false;
}
