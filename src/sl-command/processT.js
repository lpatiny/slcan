'use strict';

const parseUavcanFrame = require('./parseUavcanFrame');

const {
  MESSAGE_FRAME,
  ANONYMOUS_MESSAGE_FRAME,
  SERVICE_FRAME
} = require('../MessageTypes');

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
      break;
    default:
  }
}

module.exports = processT;
