'use strict';

const yaml = require('yaml');
const debug = require('debug')('slcan.debugdata');
const {
  parseRequest,
  parseResponse,
  parseMessage,
  DataTypesManager
} = require('uavcan');

const {
  MESSAGE_FRAME,
  ANONYMOUS_MESSAGE_FRAME,
  SERVICE_FRAME
} = require('./MessageTypes');

function debugData(data, messageType, dataTypeID, isRequest) {
  if (!data || !dataTypeID) return;
  let parsed;
  switch (messageType) {
    case MESSAGE_FRAME:
    case ANONYMOUS_MESSAGE_FRAME:
      debug(`datatype: ${DataTypesManager.getMessageByID(dataTypeID).id}`);
      parsed = parseMessage(data, dataTypeID);
      break;
    case SERVICE_FRAME:
      debug(`datatype: ${DataTypesManager.getServiceByID(dataTypeID).id}`);
      if (isRequest) {
        parsed = parseRequest(data, dataTypeID);
      } else {
        parsed = parseResponse(data, dataTypeID);
      }
      break;
    default:
  }
  debug(yaml.stringify(parsed));
}

module.exports = debugData;
