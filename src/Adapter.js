'use strict';

const updateNodeInfo = require('./updateNodeInfo');
const getValue = require('./getValue');
const Node = require('./Node');

const debug = require('debug')('slcan.adapter');

const processReceivedData = require('./processReceivedData');

const STATUS_OPENING = 1;
const STATUS_OPENED = 2;
const STATUS_CLOSED = 3;
const STATUS_ERROR = 10;

class Adapter {
  constructor(portName, serialPort, slcanEventEmitter, options = {}) {
    const { nodeID = 127 } = options;
    this.status = STATUS_OPENING;
    this.portName = portName;
    this.serialPort = serialPort;
    this.nodes = {};
    this.slcanEventEmitter = slcanEventEmitter;

    if (!isNaN(nodeID)) {
      this.adapterNode = new Node(nodeID, this);
    }

    serialPort.on('open', (open) => this.open(open));
    serialPort.on('data', (data) => this.data(data));
    serialPort.on('error', (error) => this.error(error));
    serialPort.on('close', (close) => this.close(close));

    //  getValue(this);
    // updateNodeInfo(this);
  }

  async open() {
    debug(`Open ${this.portName}`);
    this.serialPort.write('S3\r');
    this.serialPort.write('O\r');
    this.status = STATUS_OPENED;
    this.slcanEventEmitter.emit('adapter', {
      event: 'Open',
      value: {}
    });
  }

  close() {
    debug(`Close ${this.portName}`);
    this.status = STATUS_CLOSED;
    this.slcanEventEmitter.emit('adapter', {
      event: 'Close',
      value: {}
    });
  }

  error(error) {
    debug(`Error ${this.portName}`);
    debug(error);
    this.status = STATUS_ERROR;
    this.slcanEventEmitter.emit('adapter', {
      event: 'Error',
      value: error
    });
  }

  data(buffer) {
    let string = new TextDecoder().decode(buffer);
    debug(`Data ${this.portName}: ${string}`);
    processReceivedData(string, this);
    this.slcanEventEmitter.emit('adapter', {
      event: 'received',
      value: string
    });
  }

  update(sourceNodeID) {
    if (!this.nodes[sourceNodeID]) {
      this.nodes[sourceNodeID] = new Node(sourceNodeID, this);
    }
    this.nodes[sourceNodeID].seen();
  }

  write(strings) {
    if (!Array.isArray(strings)) strings = [strings];
    for (let string of strings) {
      debug(`Write serial frame: ${string}`);
      this.serialPort.write(`${string}\r`);
    }
  }
}

module.exports = Adapter;
