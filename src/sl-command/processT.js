'use strict';

const debug = require('debug')('uavcan.processT');

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
  sourceNode.data[parsed.transferID] += parsed.data;
  if (parsed.endTransfer) {
    debugData(
      sourceNode.data[parsed.transferID],
      parsed.messageType,
      parsed.dataTypeID
    );
  }
}
