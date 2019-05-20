'use strict';

const debug = require('debug')('slcan.device');
const { dataTypes, serialize, prependCRC } = require('uavcan');

const {
  MESSAGE_FRAME,
  ANONYMOUS_MESSAGE_FRAME,
  SERVICE_FRAME
} = require('./MessageTypes');
const serializeUavcanFrane = require('./serializeUavcanFrame');

class Node {
  constructor(nodeID, adapter) {
    this.nodeID = nodeID;
    this.transferID = 0;
    this.toggleBit = false;
    this.adapter = adapter;
    this.data = new Array(32);
  }

  sendRequest(data, dataTypeLongID, destinationNodeID) {
    let bytes = this.getBytes(data, dataTypeLongID, true, true);
    if (bytes.length > 7) {
      bytes = prependCRC(bytes, dataTypeLongID);
    }
    let info = {
      sourceNodeID: this.nodeID,
      destinationNodeID,
      priority: 31,
      isService: true,
      isRequest: true,
      dataTypeID: dataTypes[dataTypeLongID].info.dataTypeID,
      messageType: SERVICE_FRAME
    };
    let frames = serializeUavcanFrane(bytes, this, info);
    for (let frame of frames) {
      let text = `T${frame.header}${frame.dataLength}${frame.data}${
        frame.tailByte
      }`;
      let value = Object.assign(frame, info);
      this.adapter.write(text);
      this.adapter.slcanEventEmitter.emit('frame', {
        event: 'TX',
        value
      });
    }
  }

  sendResponse(data, dataTypeID, nodeTo) {
    let bytes = this.getBytes(data, dataTypeID, true, false);
  }

  sendMessage(data, dataTypeID) {
    let bytes = this.getBytes(data, dataTypeID, false);
  }

  sendAnonymousMessage(data, dataTypeID) {
    let bytes = this.getBytes(data, dataTypeID, false, true);
  }

  seen() {
    this.lastSeen = Date.now();
  }

  getBytes(data, dataTypeID, isService, isRequestIsAnonymous) {
    let dataType = dataTypes[dataTypeID];
    if (!dataType) {
      debug(`ERROR: unknown datatype: ${dataType}`);
    }
    let bytes = serialize(data, dataType, isService, isRequestIsAnonymous);
    if (bytes.length > 7) {
      // TODO add HASH + bytes CRC
    }
    return bytes;
  }
}

module.exports = Node;
