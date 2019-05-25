'use strict';

const debug = require('debug')('uavcan.processT');
const { validateCRC } = require('uavcan');
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
    event: 'RX',
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
    // debugData(sourceNode.data[parsed.transferID], parsed.messageType, parsed.dataTypeID);
  }
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
    emitUAVCAN(
      SERVICE_FRAME,
      parsed,
      sourceNode.data[parsed.transferID],
      adapter
    );
    debugData(
      sourceNode.data[parsed.transferID],
      parsed.messageType,
      parsed.dataTypeID
    );
  }
}

function emitUAVCAN(type, parsed, data, adapter) {
  validateCRC(data, parsed.dataTypeLongID);
  if (!parsed.startTransfer) {
    data = data.substring(4);
    //  checkCRC(data, parsed.dataTypeID, parsed.isService);
  }

  let result;
  let dataType;
  let kind;
  switch (type) {
    case MESSAGE_FRAME:
      kind = 'Message';
      result = parseMessage(data, parsed.dataTypeID);
      dataType = DataTypesManager.getMessageByID(parsed.dataTypeID);
      break;
    case ANONYMOUS_MESSAGE_FRAME:
      kind = 'Anonymous message';
      result = parseMessage(data, parsed.dataTypeID);
      dataType = DataTypesManager.getMessageByID(parsed.dataTypeID);
      break;
    case SERVICE_FRAME:
      dataType = DataTypesManager.getServiceByID(parsed.dataTypeID);
      if (parsed.isRequest) {
        kind = 'Service request';
        result = parseRequest(data, parsed.dataTypeID);
      } else {
        kind = 'Service response';
        result = parseResponse(data, parsed.dataTypeID);
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
